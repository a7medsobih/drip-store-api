import mongoose from "mongoose";

const TESTIMONIAL_STATUS = ["pending", "approved", "refused"];

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

const validateCreateTestimonial = (req) => {
  const { body } = req;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return getValidationError("Request body must be an object");
  }

  const allowedFields = ["message", "rating"];
  const bodyKeys = Object.keys(body);

  for (const key of bodyKeys) {
    if (!allowedFields.includes(key)) {
      return getValidationError(`Field '${key}' is not allowed`);
    }
  }

  if (!("message" in body)) {
    return getValidationError("message is required");
  }

  if (typeof body.message !== "string") {
    return getValidationError("message must be a string");
  }

  const trimmedMessage = body.message.trim();
  if (trimmedMessage.length < 3 || trimmedMessage.length > 500) {
    return getValidationError("message must be between 3 and 500 characters");
  }

  if (!("rating" in body)) {
    return getValidationError("rating is required");
  }

  if (typeof body.rating !== "number" || Number.isNaN(body.rating)) {
    return getValidationError("rating must be a number");
  }

  if (body.rating < 1 || body.rating > 5) {
    return getValidationError("rating must be between 1 and 5");
  }

  return null;
};

const validatePublicTestimonials = (req) =>
  validatePositiveIntegerQuery(req.query.limit, "limit");

const validateGetAllTestimonials = (req) => {
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
    !TESTIMONIAL_STATUS.includes(req.query.status)
  ) {
    return getValidationError(
      `status must be one of ${TESTIMONIAL_STATUS.join(", ")}`
    );
  }

  return null;
};

const validateUpdateTestimonialStatus = (req) => {
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

  if (!TESTIMONIAL_STATUS.includes(body.status)) {
    return getValidationError(
      `status must be one of ${TESTIMONIAL_STATUS.join(", ")}`
    );
  }

  return null;
};

const testimonialValidation = {
  createTestimonial: validateCreateTestimonial,
  getPublicTestimonials: validatePublicTestimonials,
  getAllTestimonials: validateGetAllTestimonials,
  updateTestimonialStatus: validateUpdateTestimonialStatus,
  testimonialId: (req) => validateObjectId(req.params.id, "testimonial id")
};

export default testimonialValidation;
