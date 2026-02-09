const AppError = require("../utils/AppError");

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user?.role) {
      return next(new AppError("Auth kerak", 401, { code: "UNAUTHORIZED" }));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("Ruxsat yo‘q", 403, { code: "FORBIDDEN" }));
    }

    next();
  };
}

module.exports = { requireRole };
