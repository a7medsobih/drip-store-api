import { Router } from "express";

import adminMiddleware from "../../middlewares/admin.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import validateMiddleware from "../../middlewares/validate.middleware.js";
import userController from "./user.controller.js";
import userValidation from "./user.validation.js";

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get(
  "/",
  validateMiddleware(userValidation.getAllUsers),
  userController.getAllUsers
);

router.patch(
  "/:id/toggle",
  validateMiddleware(userValidation.userId),
  userController.toggleUserActive
);

export default router;
