import { Router } from "express";

import adminMiddleware from "../../middlewares/admin.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import upload from "../../middlewares/upload.middleware.js";
import validateMiddleware from "../../middlewares/validate.middleware.js";
import productController from "./product.controller.js";
import productValidation from "./product.validation.js";

const publicProductRoutes = Router();
const adminProductRoutes = Router();

publicProductRoutes.get(
  "/",
  validateMiddleware(productValidation.getProducts),
  productController.getProducts
);
publicProductRoutes.get("/best-sellers", productController.getBestSellers);
publicProductRoutes.get("/new-arrivals", productController.getNewArrivals);

adminProductRoutes.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  validateMiddleware(productValidation.createProduct),
  productController.createProduct
);

adminProductRoutes.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  validateMiddleware(productValidation.productId),
  validateMiddleware(productValidation.updateProduct),
  productController.updateProduct
);

adminProductRoutes.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateMiddleware(productValidation.productId),
  productController.deleteProduct
);

export { publicProductRoutes, adminProductRoutes };
