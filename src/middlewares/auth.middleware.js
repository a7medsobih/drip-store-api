import { MESSAGES } from "../constants/messages.js";
import AppError from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.utils.js";

const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new AppError(MESSAGES.UNAUTHORIZED, 401));
  }

  try {
    const token = authorization.split(" ")[1];
    const decodedToken = verifyToken(token);
    req.user = {
      ...decodedToken,
      id: decodedToken.sub
    };
    next();
  } catch (error) {
    next(new AppError("Invalid or expired token", 401));
  }
};

export default authMiddleware;
