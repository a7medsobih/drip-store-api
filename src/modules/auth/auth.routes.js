// src/modules/auth/auth.routes.js
import { Router } from "express";

import authController from "./auth.controller.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-otp", authController.verifyOtp);
router.post("/reset-password", authController.resetPassword);
router.post("/refresh-token", authController.refreshToken);

export default router;
