import { Router } from "express";

import adminMiddleware from "../../middlewares/admin.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import validateMiddleware from "../../middlewares/validate.middleware.js";
import refundController from "./refund.controller.js";
import refundValidation from "./refund.validation.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  validateMiddleware(refundValidation.createRefund),
  refundController.createRefund
);

router.get(
  "/admin",
  adminMiddleware,
  validateMiddleware(refundValidation.getAllRefunds),
  refundController.getAllRefunds
);

router.patch(
  "/:id/status",
  adminMiddleware,
  validateMiddleware(refundValidation.refundId),
  validateMiddleware(refundValidation.updateRefundStatus),
  refundController.updateRefundStatus
);

export default router;
