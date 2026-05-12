import mongoose from "mongoose";

import { ORDER_STATUS } from "../../constants/orderStatus.js";

const getValidationError = (message) => ({
  error: message
});

const validateObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return getValidationError(`Invalid ${fieldName}`);
  }

  return null;
};

const validatePositiveIntegerQuery = (value, fieldName) => {
  if (value === undefined) {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return getValidationError(`${fieldName} must be a positive integer`);
  }

  return null;
};

const validateCreateOrder = (req) => {
  const { body } = req;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return getValidationError("Request body must be an object");
  }

  const allowedFields = ["addressId"];
  const bodyKeys = Object.keys(body);

  for (const key of bodyKeys) {
    if (!allowedFields.includes(key)) {
      return getValidationError(`Field '${key}' is not allowed`);
    }
  }

  if (!("addressId" in body)) {
    return getValidationError("addressId is required");
  }

  return validateObjectId(body.addressId, "address id");
};

const validateOrdersPagination = (req) => {
  const pageError = validatePositiveIntegerQuery(req.query.page, "page");

  if (pageError) {
    return pageError;
  }

  return validatePositiveIntegerQuery(req.query.limit, "limit");
};

const validateGetAllOrders = (req) => {
  const paginationError = validateOrdersPagination(req);

  if (paginationError) {
    return paginationError;
  }

  if (
    req.query.status !== undefined &&
    !Object.values(ORDER_STATUS).includes(req.query.status)
  ) {
    return getValidationError(
      `status must be one of ${Object.values(ORDER_STATUS).join(", ")}`
    );
  }

  return null;
};

const validateUpdateOrderStatus = (req) => {
  const { body } = req;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return getValidationError("Request body must be an object");
  }

  const allowedFields = ["status"];
  const bodyKeys = Object.keys(body);

  for (const key of bodyKeys) {
    if (!allowedFields.includes(key)) {
      return getValidationError(`Field '${key}' is not allowed`);
    }
  }

  if (!("status" in body)) {
    return getValidationError("status is required");
  }

  if (!Object.values(ORDER_STATUS).includes(body.status)) {
    return getValidationError(
      `status must be one of ${Object.values(ORDER_STATUS).join(", ")}`
    );
  }

  return null;
};

const orderValidation = {
  createOrder: validateCreateOrder,
  getUserOrders: validateOrdersPagination,
  getAllOrders: validateGetAllOrders,
  updateOrderStatus: validateUpdateOrderStatus,
  orderId: (req) => validateObjectId(req.params.id, "order id")
};

export default orderValidation;
