import User from "../../models/User.model.js";
import AppError from "../../utils/AppError.js";

const PROFILE_EXCLUDED_FIELDS =
  "-password -otpHash -otpExpires -otpAttempts -loginAttempts -lockUntil -passwordResetAllowedUntil";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const calculatePagination = (queryParams) => {
  const page = Number(queryParams.page) || DEFAULT_PAGE;
  const limit = Number(queryParams.limit) || DEFAULT_LIMIT;

  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
};

const buildUsersResponse = (items, page, limit, total) => ({
  items,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1
  }
});

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
  },

  async getAllUsers(queryParams) {
    const { page, limit, skip } = calculatePagination(queryParams);
    const query = {};

    if (queryParams.search) {
      const search = String(queryParams.search).trim();
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { mobile: { $regex: search, $options: "i" } }
        ];
      }
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select(PROFILE_EXCLUDED_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    return buildUsersResponse(users, page, limit, total);
  },

  async toggleUserActive(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.isActive = !user.isActive;
    await user.save();

    return User.findById(userId).select(PROFILE_EXCLUDED_FIELDS).lean();
  }
};

export default userService;
