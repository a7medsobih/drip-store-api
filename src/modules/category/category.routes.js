import { Router } from "express";

import adminMiddleware from "../../middlewares/admin.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import validateMiddleware from "../../middlewares/validate.middleware.js";
import categoryController from "./category.controller.js";
import categoryValidation from "./category.validation.js";

const publicCategoryRoutes = Router();
const adminCategoryRoutes = Router();

publicCategoryRoutes.get("/", categoryController.getPublicCategories);

adminCategoryRoutes.post(
  "/",
  authMiddleware,
  adminMiddleware,
  validateMiddleware(categoryValidation.createCategory),
  categoryController.createCategory
);

adminCategoryRoutes.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateMiddleware(categoryValidation.categoryId),
  validateMiddleware(categoryValidation.updateCategory),
  categoryController.updateCategory
);

adminCategoryRoutes.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateMiddleware(categoryValidation.categoryId),
  categoryController.deleteCategory
);

export { publicCategoryRoutes, adminCategoryRoutes };
