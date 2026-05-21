import ApiResponse from "../../utils/ApiResponse.js";
import userService from "./user.service.js";

const userController = {
  async getProfile(req, res, next) {
    try {
      const profile = await userService.getProfile(req.user.id);

      res
        .status(200)
        .json(new ApiResponse(200, "Profile fetched successfully", profile, null));
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const profile = await userService.updateProfile(req.user.id, req.body);

      res
        .status(200)
        .json(new ApiResponse(200, "Profile updated successfully", profile, null));
    } catch (error) {
      next(error);
    }
  },

  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers(req.query);

      res
        .status(200)
        .json(new ApiResponse(200, "Users fetched successfully", users, null));
    } catch (error) {
      next(error);
    }
  },

  async toggleUserActive(req, res, next) {
    try {
      const user = await userService.toggleUserActive(req.params.id);

      res
        .status(200)
        .json(new ApiResponse(200, "User status updated successfully", user, null));
    } catch (error) {
      next(error);
    }
  }
};

export default userController;
