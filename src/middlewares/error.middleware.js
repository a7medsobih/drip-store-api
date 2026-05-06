import { MESSAGES } from "../constants/messages.js";

const errorMiddleware = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || MESSAGES.INTERNAL_SERVER_ERROR,
    data: null,
    errors: error.errors || null
  });
};

export default errorMiddleware;
