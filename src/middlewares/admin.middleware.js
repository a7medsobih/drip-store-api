import { ROLES } from "../constants/roles.js";
import AppError from "../utils/AppError.js";

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== ROLES.ADMIN) {
    return next(new AppError("Admin access required", 403));
  }

  next();
};

export default adminMiddleware;
