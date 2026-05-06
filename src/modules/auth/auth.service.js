// src/modules/auth/auth.service.js
import User from "../../models/User.model.js";
import AppError from "../../utils/AppError.js";
import { compareValue, hashValue } from "../../utils/bcrypt.utils.js";
import { signToken, verifyToken } from "../../utils/jwt.utils.js";
import { generateOtp } from "../../utils/otp.utils.js";
import { sendOtpEmail } from "../../services/email.service.js";

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";
const OTP_EXPIRES_IN_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 3;
const SALT_ROUNDS = 10;

const isProduction = process.env.NODE_ENV === "production";

const buildTokenPayload = (user) => ({
  sub: user._id.toString(),
  role: user.role,
  email: user.email
});

const generateTokens = (user) => {
  const payload = buildTokenPayload(user);

  return {
    accessToken: signToken(payload, { expiresIn: ACCESS_TOKEN_EXPIRES_IN }),
    refreshToken: signToken(
      { ...payload, type: "refresh" },
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    )
  };
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile ?? null,
  gender: user.gender,
  role: user.role,
  emailConsent: user.emailConsent,
  isActive: user.isActive,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const issueOtpForUser = async (user, purpose) => {
  const otp = generateOtp(6);
  user.otpHash = await hashValue(otp, SALT_ROUNDS);
  user.otpExpires = new Date(Date.now() + OTP_EXPIRES_IN_MS);
  user.otpAttempts = 0;
  user.otpPurpose = purpose;

  return otp;
};

const clearOtpState = (user) => {
  user.otpHash = undefined;
  user.otpExpires = undefined;
  user.otpAttempts = 0;
  user.otpPurpose = undefined;
};

const getOtpResponseData = (baseData, otp) => {
  if (!isProduction) {
    return {
      ...baseData,
      otp
    };
  }

  return baseData;
};

const authService = {
  async register(payload) {
    const { name, email, password, gender, mobile, emailConsent } = payload;
    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedMobile = mobile?.trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new AppError("Email is already in use", 409);
    }

    if (normalizedMobile) {
      const existingMobile = await User.findOne({ mobile: normalizedMobile });
      if (existingMobile) {
        throw new AppError("Mobile number is already in use", 409);
      }
    }

    const hashedPassword = await hashValue(password, SALT_ROUNDS);

    const user = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      gender,
      mobile: normalizedMobile || undefined,
      emailConsent,
      role: "user"
    });

    const otp = await issueOtpForUser(user, "verify-email");
    await user.save();
    await sendOtpEmail(user.email, otp);

    return getOtpResponseData(
      {
        user: sanitizeUser(user)
      },
      otp
    );
  },

  async login(payload) {
    const { email, password } = payload;
    const normalizedEmail = email?.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    if (!user.isActive) {
      throw new AppError("User account is inactive", 403);
    }

    const isPasswordValid = await compareValue(password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    const tokens = generateTokens(user);

    return {
      user: sanitizeUser(user),
      tokens
    };
  },

  async forgotPassword(payload) {
    const { email } = payload;
    const normalizedEmail = email?.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const otp = await issueOtpForUser(user, "reset-password");
    user.passwordResetAllowedUntil = undefined;

    await user.save();
    await sendOtpEmail(user.email, otp);

    return getOtpResponseData(
      {
        email: user.email
      },
      otp
    );
  },

  async verifyOtp(payload) {
    const { email, otp } = payload;
    const normalizedEmail = email?.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.otpHash || !user.otpExpires || !user.otpPurpose) {
      throw new AppError("OTP not found or already used", 400);
    }

    if (user.otpExpires.getTime() < Date.now()) {
      throw new AppError("OTP expired", 400);
    }

    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      throw new AppError("Maximum OTP attempts exceeded", 400);
    }

    user.otpAttempts += 1;

    const isOtpValid = await compareValue(otp, user.otpHash);
    if (!isOtpValid) {
      await user.save();
      throw new AppError("Invalid OTP", 400);
    }

    const otpPurpose = user.otpPurpose;
    clearOtpState(user);

    if (otpPurpose === "verify-email") {
      user.isVerified = true;
      user.passwordResetAllowedUntil = undefined;
    }

    if (otpPurpose === "reset-password") {
      user.passwordResetAllowedUntil = new Date(Date.now() + OTP_EXPIRES_IN_MS);
    }

    await user.save();

    return {
      user: sanitizeUser(user)
    };
  },

  async resetPassword(payload) {
    const { email, newPassword } = payload;
    const normalizedEmail = email?.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (
      !user.passwordResetAllowedUntil ||
      user.passwordResetAllowedUntil.getTime() < Date.now()
    ) {
      throw new AppError("Unauthorized access", 401);
    }

    user.password = await hashValue(newPassword, SALT_ROUNDS);
    user.passwordResetAllowedUntil = undefined;
    clearOtpState(user);

    await user.save();

    return {
      user: sanitizeUser(user)
    };
  },

  async refreshToken(payload) {
    const { refreshToken } = payload;

    let decodedToken;
    try {
      decodedToken = verifyToken(refreshToken);
    } catch (error) {
      throw new AppError("Unauthorized access", 401);
    }

    if (decodedToken.type !== "refresh") {
      throw new AppError("Unauthorized access", 401);
    }

    const user = await User.findById(decodedToken.sub);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.isActive) {
      throw new AppError("User account is inactive", 403);
    }

    return {
      accessToken: signToken(buildTokenPayload(user), {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN
      })
    };
  }
};

export default authService;
