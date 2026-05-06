// src/modules/auth/auth.controller.js
import ApiResponse from "../../utils/ApiResponse.js";
import authService from "./auth.service.js";

const handleRequest = (serviceMethod, successMessage, statusCode = 200) => {
  return async (req, res, next) => {
    try {
      const data = await serviceMethod(req.body);

      res
        .status(statusCode)
        .json(new ApiResponse(statusCode, successMessage, data, null));
    } catch (error) {
      next(error);
    }
  };
};

const authController = {
  register: handleRequest(authService.register, "User registered successfully", 201),
  login: handleRequest(authService.login, "Login successful"),
  forgotPassword: handleRequest(
    authService.forgotPassword,
    "OTP sent successfully"
  ),
  verifyOtp: handleRequest(authService.verifyOtp, "OTP verified successfully"),
  resetPassword: handleRequest(
    authService.resetPassword,
    "Password reset successfully"
  ),
  refreshToken: handleRequest(
    authService.refreshToken,
    "Access token refreshed successfully"
  )
};

export default authController;
