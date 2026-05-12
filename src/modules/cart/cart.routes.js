import { Router } from "express";

import authMiddleware from "../../middlewares/auth.middleware.js";
import validateMiddleware from "../../middlewares/validate.middleware.js";
import cartController from "./cart.controller.js";
import cartValidation from "./cart.validation.js";

const router = Router();

router.use(authMiddleware);

router
  .route("/")
  .get(cartController.getCart)
  .post(
    validateMiddleware(cartValidation.addToCart),
    cartController.addToCart
  )
  .delete(cartController.clearCart);

router.post(
  "/merge",
  validateMiddleware(cartValidation.mergeGuestCart),
  cartController.mergeGuestCart
);

router
  .route("/:id")
  .put(
    validateMiddleware(cartValidation.cartItemId),
    validateMiddleware(cartValidation.updateCartItem),
    cartController.updateCartItem
  )
  .delete(
    validateMiddleware(cartValidation.cartItemId),
    cartController.deleteCartItem
  );

export default router;
