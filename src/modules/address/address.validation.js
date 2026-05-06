import mongoose from "mongoose";

const getValidationError = (message) => ({
  error: message
});

const validateAddressId = (req) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return getValidationError("Invalid address id");
  }

  return null;
};

const validateAddressPayload = (req, { requireAtLeastOneField = false } = {}) => {
  const { body } = req;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return getValidationError("Request body must be an object");
  }

  const allowedFields = ["label", "addressText", "isDefault"];
  const bodyKeys = Object.keys(body);

  if (requireAtLeastOneField && bodyKeys.length === 0) {
    return getValidationError("At least one field is required");
  }

  for (const key of bodyKeys) {
    if (!allowedFields.includes(key)) {
      return getValidationError(`Field '${key}' is not allowed`);
    }
  }

  if (!requireAtLeastOneField) {
    if (!("label" in body)) {
      return getValidationError("Label is required");
    }

    if (!("addressText" in body)) {
      return getValidationError("Address text is required");
    }
  }

  if ("label" in body && !["home", "work", "other"].includes(body.label)) {
    return getValidationError("Label must be one of home, work, or other");
  }

  if ("addressText" in body) {
    if (typeof body.addressText !== "string") {
      return getValidationError("Address text must be a string");
    }

    if (body.addressText.trim().length < 10) {
      return getValidationError("Address text must be at least 10 characters");
    }
  }

  if ("isDefault" in body && typeof body.isDefault !== "boolean") {
    return getValidationError("isDefault must be a boolean");
  }

  return null;
};

const addressValidation = {
  createAddress: (req) => validateAddressPayload(req),
  updateAddress: (req) =>
    validateAddressPayload(req, { requireAtLeastOneField: true }),
  addressId: validateAddressId
};

export default addressValidation;
