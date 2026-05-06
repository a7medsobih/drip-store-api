import AppError from "../utils/AppError.js";

const validateMiddleware = (validator) => {
  return (req, res, next) => {
    if (typeof validator !== "function") {
      return next(new AppError("Validator must be a function", 500));
    }

    const result = validator(req);

    if (result && result.error) {
      return next(new AppError(result.error, 400));
    }

    next();
  };
};

export default validateMiddleware;
