import mongoose from "mongoose";

const REFUND_STATUS = ["pending", "approved", "refused"];

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

const validateCreateRefund = (req) => {
  const { body } = req;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return getValidationError("Request body must be an object");
  }

  const allowedFields = ["orderId", "reason"];
  const bodyKeys = Object.keys(body);

  for (const key of bodyKeys) {
    if (!allowedFields.includes(key)) {
      return getValidationError(`Field '${key}' is not allowed`);
    }
  }

  if (!("orderId" in body)) {
    return getValidationError("orderId is required");
  }

  const orderIdError = validateObjectId(body.orderId, "order id");
  if (orderIdError) {
    return orderIdError;
  }

  if (!("reason" in body)) {
    return getValidationError("reason is required");
  }

  if (typeof body.reason !== "string") {
    return getValidationError("reason must be a string");
  }

  const trimmedReason = body.reason.trim();

  if (trimmedReason.length < 3 || trimmedReason.length > 500) {
    return getValidationError("reason must be between 3 and 500 characters");
  }

  return null;
};

const validateGetAllRefunds = (req) => {
  const pageError = validatePositiveIntegerQuery(req.query.page, "page");
  if (pageError) {
    return pageError;
  }

  const limitError = validatePositiveIntegerQuery(req.query.limit, "limit");
  if (limitError) {
    return limitError;
  }

  if (
    req.query.status !== undefined &&
    !REFUND_STATUS.includes(req.query.status)
  ) {
    return getValidationError(
      `status must be one of ${REFUND_STATUS.join(", ")}`
    );
  }

  return null;
};

const validateUpdateRefundStatus = (req) => {
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

  if (!REFUND_STATUS.includes(body.status)) {
    return getValidationError(
      `status must be one of ${REFUND_STATUS.join(", ")}`
    );
  }

  return null;
};

const refundValidation = {
  createRefund: validateCreateRefund,
  getAllRefunds: validateGetAllRefunds,
  updateRefundStatus: validateUpdateRefundStatus,
  refundId: (req) => validateObjectId(req.params.id, "refund id")
};

export default refundValidation;
