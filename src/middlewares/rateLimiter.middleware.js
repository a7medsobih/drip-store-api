const rateLimiterMiddleware = (req, res, next) => {
  next();
};

export default rateLimiterMiddleware;
