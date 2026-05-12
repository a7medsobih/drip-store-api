import { Router } from "express";

import adminMiddleware from "../../middlewares/admin.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import validateMiddleware from "../../middlewares/validate.middleware.js";
import orderController from "./order.controller.js";
import orderValidation from "./order.validation.js";

const router = Router();

router.use(authMiddleware);

router
  .route("/")
  .get(
    validateMiddleware(orderValidation.getUserOrders),
    orderController.getUserOrders
  )
  .post(
    validateMiddleware(orderValidation.createOrder),
    orderController.createOrder
  );

router.get(
  "/admin",
  adminMiddleware,
  validateMiddleware(orderValidation.getAllOrders),
  orderController.getAllOrders
);

router.patch(
  "/:id/cancel",
  validateMiddleware(orderValidation.orderId),
  orderController.cancelOrder
);

router.patch(
  "/:id/status",
  adminMiddleware,
  validateMiddleware(orderValidation.orderId),
  validateMiddleware(orderValidation.updateOrderStatus),
  orderController.updateOrderStatus
);

export default router;
