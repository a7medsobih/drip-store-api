import { Router } from "express";

import authMiddleware from "../../middlewares/auth.middleware.js";
import validateMiddleware from "../../middlewares/validate.middleware.js";
import userController from "./user.controller.js";
import userValidation from "./user.validation.js";

const router = Router();

router.use(authMiddleware);

router.get("/profile", userController.getProfile);
router.put(
  "/profile",
  validateMiddleware(userValidation.updateProfile),
  userController.updateProfile
);

export default router;
