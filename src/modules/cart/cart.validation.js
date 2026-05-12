import mongoose from "mongoose";

const getValidationError = (message) => ({
  error: message
});

const validateObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return getValidationError(`Invalid ${fieldName}`);
  }

  return null;
};

const isPositiveInteger = (value) => {
  return Number.isInteger(value) && value >= 1;
};

const validateAddToCart = (req) => {
  const { body } = req;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return getValidationError("Request body must be an object");
  }

  const allowedFields = ["productId", "quantity"];
  const bodyKeys = Object.keys(body);

  for (const key of bodyKeys) {
    if (!allowedFields.includes(key)) {
      return getValidationError(`Field '${key}' is not allowed`);
    }
  }

  if (!("productId" in body)) {
    return getValidationError("productId is required");
  }

  if (!("quantity" in body)) {
    return getValidationError("quantity is required");
  }

  const productIdError = validateObjectId(body.productId, "product id");
  if (productIdError) {
    return productIdError;
  }

  if (!isPositiveInteger(body.quantity)) {
    return getValidationError("Quantity must be a positive integer");
  }

  return null;
};

const validateUpdateCartItem = (req) => {
  const { body } = req;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return getValidationError("Request body must be an object");
  }

  const allowedFields = ["quantity"];
  const bodyKeys = Object.keys(body);

  if (bodyKeys.length === 0) {
    return getValidationError("quantity is required");
  }

  for (const key of bodyKeys) {
    if (!allowedFields.includes(key)) {
      return getValidationError(`Field '${key}' is not allowed`);
    }
  }

  if (!("quantity" in body)) {
    return getValidationError("quantity is required");
  }

  if (!isPositiveInteger(body.quantity)) {
    return getValidationError("Quantity must be a positive integer");
  }

  return null;
};

const validateMergeGuestCart = (req) => {
  const { body } = req;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return getValidationError("Request body must be an object");
  }

  const allowedFields = ["items"];
  const bodyKeys = Object.keys(body);

  for (const key of bodyKeys) {
    if (!allowedFields.includes(key)) {
      return getValidationError(`Field '${key}' is not allowed`);
    }
  }

  if (!Array.isArray(body.items)) {
    return getValidationError("items is required and must be an array");
  }

  for (const item of body.items) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return getValidationError("Each item must be an object");
    }

    const itemKeys = Object.keys(item);
    const allowedItemFields = ["productId", "quantity"];

    for (const key of itemKeys) {
      if (!allowedItemFields.includes(key)) {
        return getValidationError(`Field '${key}' is not allowed in items`);
      }
    }

    if (!("productId" in item)) {
      return getValidationError("Each item must include productId");
    }

    if (!("quantity" in item)) {
      return getValidationError("Each item must include quantity");
    }

    const productIdError = validateObjectId(item.productId, "product id");
    if (productIdError) {
      return productIdError;
    }

    if (!isPositiveInteger(item.quantity)) {
      return getValidationError("Each item quantity must be a positive integer");
    }
  }

  return null;
};

const cartValidation = {
  addToCart: validateAddToCart,
  updateCartItem: validateUpdateCartItem,
  cartItemId: (req) => validateObjectId(req.params.id, "cart id"),
  mergeGuestCart: validateMergeGuestCart
};

export default cartValidation;
