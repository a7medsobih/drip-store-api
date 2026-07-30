import { MESSAGES } from "../constants/messages.js";
import logger from "../config/logger.js";

const errorMiddleware = (error, req, res, next) => {
  logger.error(
    `[${req.method}] ${req.originalUrl} -> ${error.message || "Unknown error"}`
  );

  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || MESSAGES.INTERNAL_SERVER_ERROR,
    data: null,
    errors: error.errors || null
  });
};

export default errorMiddleware;
