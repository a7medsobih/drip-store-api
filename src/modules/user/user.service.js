import User from "../../models/User.model.js";
import AppError from "../../utils/AppError.js";

const PROFILE_EXCLUDED_FIELDS =
  "-password -otpHash -otpExpires -otpAttempts -loginAttempts -lockUntil -passwordResetAllowedUntil";

const sanitizeProfileUpdatePayload = (payload) => {
  const sanitizedPayload = {};

  if ("name" in payload) {
    sanitizedPayload.name = payload.name.trim();
  }

  if ("mobile" in payload) {
    sanitizedPayload.mobile = payload.mobile?.trim();
  }

  if ("gender" in payload) {
    sanitizedPayload.gender = payload.gender;
  }

  if ("emailConsent" in payload) {
    sanitizedPayload.emailConsent = payload.emailConsent;
  }

  return sanitizedPayload;
};

const userService = {
  async getProfile(userId) {
    const user = await User.findById(userId).select(PROFILE_EXCLUDED_FIELDS).lean();

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  },

  async updateProfile(userId, payload) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const sanitizedPayload = sanitizeProfileUpdatePayload(payload);

    if (
      "mobile" in sanitizedPayload &&
      sanitizedPayload.mobile &&
      sanitizedPayload.mobile !== user.mobile
    ) {
      const existingMobile = await User.findOne({
        mobile: sanitizedPayload.mobile,
        _id: { $ne: userId }
      });

      if (existingMobile) {
        throw new AppError("Mobile number is already in use", 409);
      }
    }

    Object.assign(user, sanitizedPayload);
    await user.save();

    return this.getProfile(userId);
  }
};

export default userService;
