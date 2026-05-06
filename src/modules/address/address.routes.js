import { Router } from "express";

import authMiddleware from "../../middlewares/auth.middleware.js";
import validateMiddleware from "../../middlewares/validate.middleware.js";
import addressController from "./address.controller.js";
import addressValidation from "./address.validation.js";

const router = Router();

router.use(authMiddleware);

router
  .route("/")
  .get(addressController.getUserAddresses)
  .post(
    validateMiddleware(addressValidation.createAddress),
    addressController.createAddress
  );

router
  .route("/:id")
  .get(
    validateMiddleware(addressValidation.addressId),
    addressController.getAddressById
  )
  .put(
    validateMiddleware(addressValidation.addressId),
    validateMiddleware(addressValidation.updateAddress),
    addressController.updateAddress
  )
  .delete(
    validateMiddleware(addressValidation.addressId),
    addressController.deleteAddress
  );

export default router;
