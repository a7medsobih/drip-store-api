const getBodyError = (message) => ({
  error: message
});

const validateUpdateProfile = (req) => {
  const { body } = req;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return getBodyError("Request body must be an object");
  }

  const allowedFields = ["name", "mobile", "gender", "emailConsent"];
  const bodyKeys = Object.keys(body);

  if (bodyKeys.length === 0) {
    return getBodyError("At least one field is required");
  }

  for (const key of bodyKeys) {
    if (!allowedFields.includes(key)) {
      return getBodyError(`Field '${key}' is not allowed`);
    }
  }

  if ("name" in body) {
    if (typeof body.name !== "string") {
      return getBodyError("Name must be a string");
    }

    const trimmedName = body.name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 60) {
      return getBodyError("Name must be between 2 and 60 characters");
    }
  }

  if ("mobile" in body) {
    if (body.mobile !== undefined && typeof body.mobile !== "string") {
      return getBodyError("Mobile must be a string");
    }

    if (typeof body.mobile === "string" && body.mobile.trim() === "") {
      return getBodyError("Mobile cannot be empty");
    }
  }

  if ("gender" in body) {
    if (!["male", "female"].includes(body.gender)) {
      return getBodyError("Gender must be either male or female");
    }
  }

  if ("emailConsent" in body && typeof body.emailConsent !== "boolean") {
    return getBodyError("Email consent must be a boolean");
  }

  return null;
};

const userValidation = {
  updateProfile: validateUpdateProfile
};

export default userValidation;
