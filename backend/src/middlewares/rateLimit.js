const rateLimit = require("express-rate-limit");
const AppError = require("../utils/AppError");

// ✅ umumiy handler: AppError formatida qaytaradi
function rateLimitHandler(code) {
  return (req, res, next) => {
    next(
      new AppError(
        "Juda ko‘p urinish. Birozdan keyin qayta urinib ko‘ring.",
        429,
        {
          code,
        },
      ),
    );
  };
}

// ✅ Signin: bruteforcega qarshi
const signinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10, // 10 ta urinish
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("RATE_LIMIT_SIGNIN"),
});

// ✅ Forgot password: email spamga qarshi
const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("RATE_LIMIT_FORGOT"),
});

// ✅ Refresh: token abusega qarshi
const refreshLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("RATE_LIMIT_REFRESH"),
});

// ✅ Delete request: email spamga qarshi
const deleteRequestLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("RATE_LIMIT_DELETE_REQUEST"),
});

module.exports = {
  signinLimiter,
  forgotLimiter,
  refreshLimiter,
  deleteRequestLimiter,
};
