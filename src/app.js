// src/app.js
import cors from "cors";
import express from "express";
import path from "path";

import corsMiddleware from "./config/cors.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import addressRoutes from "./modules/address/address.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import {
  adminCategoryRoutes,
  publicCategoryRoutes
} from "./modules/category/category.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import {
  adminProductRoutes,
  publicProductRoutes
} from "./modules/product/product.routes.js";
import refundRoutes from "./modules/refund/refund.routes.js";
import reportRoutes from "./modules/report/report.routes.js";
import {
  adminSubcategoryRoutes,
  publicSubcategoryRoutes
} from "./modules/subcategory/subcategory.routes.js";
import testimonialRoutes from "./modules/testimonial/testimonial.routes.js";
import adminUserRoutes from "./modules/user/user.admin.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(corsMiddleware);
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

app.use("/api/files", express.static(path.join(__dirname, "uploads")));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin/users", adminUserRoutes);
app.use("/api/v1/addresses", addressRoutes);
app.use("/api/v1/categories", publicCategoryRoutes);
app.use("/api/v1/subcategories", publicSubcategoryRoutes);
app.use("/api/v1/products", publicProductRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/refunds", refundRoutes);
app.use("/api/v1/testimonials", testimonialRoutes);
app.use("/api/v1/reports", reportRoutes);

app.use("/admin/v1/categories", adminCategoryRoutes);
app.use("/admin/v1/subcategories", adminSubcategoryRoutes);
app.use("/admin/v1/products", adminProductRoutes);

app.use(errorMiddleware);

export default app;
