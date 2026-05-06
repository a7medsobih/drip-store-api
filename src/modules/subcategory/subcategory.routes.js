import { Router } from "express";

import adminMiddleware from "../../middlewares/admin.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import validateMiddleware from "../../middlewares/validate.middleware.js";
import subcategoryController from "./subcategory.controller.js";
import subcategoryValidation from "./subcategory.validation.js";

const publicSubcategoryRoutes = Router();
const adminSubcategoryRoutes = Router();

publicSubcategoryRoutes.get(
  "/:id/subcategories",
  validateMiddleware(subcategoryValidation.categoryId),
  subcategoryController.getPublicSubcategoriesByCategoryId
);

adminSubcategoryRoutes.post(
  "/",
  authMiddleware,
  adminMiddleware,
  validateMiddleware(subcategoryValidation.createSubcategory),
  subcategoryController.createSubcategory
);

adminSubcategoryRoutes.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateMiddleware(subcategoryValidation.subcategoryId),
  validateMiddleware(subcategoryValidation.updateSubcategory),
  subcategoryController.updateSubcategory
);

adminSubcategoryRoutes.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateMiddleware(subcategoryValidation.subcategoryId),
  subcategoryController.deleteSubcategory
);

export { publicSubcategoryRoutes, adminSubcategoryRoutes };
