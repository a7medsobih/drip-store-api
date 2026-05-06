import mongoose from "mongoose";

const getValidationError = (message) => ({
  error: message
});

const validateCategoryPayload = (req, { isUpdate = false } = {}) => {
  const { body } = req;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return getValidationError("Request body must be an object");
  }

  const allowedFields = ["title", "isActive"];
  const bodyKeys = Object.keys(body);

  if (isUpdate && bodyKeys.length === 0) {
    return getValidationError("At least one field is required");
  }

  for (const key of bodyKeys) {
    if (!allowedFields.includes(key)) {
      return getValidationError(`Field '${key}' is not allowed`);
    }
  }

  if (!isUpdate && !("title" in body)) {
    return getValidationError("Title is required");
  }

  if ("title" in body) {
    if (typeof body.title !== "string") {
      return getValidationError("Title must be a string");
    }

    if (body.title.trim().length === 0) {
      return getValidationError("Title cannot be empty");
    }
  }

  if ("isActive" in body && typeof body.isActive !== "boolean") {
    return getValidationError("isActive must be a boolean");
  }

  return null;
};

const validateCategoryId = (req) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return getValidationError("Invalid category id");
  }

  return null;
};

const categoryValidation = {
  createCategory: (req) => validateCategoryPayload(req),
  updateCategory: (req) => validateCategoryPayload(req, { isUpdate: true }),
  categoryId: validateCategoryId
};

export default categoryValidation;
