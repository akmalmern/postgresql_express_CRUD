const { verifyAccess } = require("../utils/tokens");
const AppError = require("../utils/AppError");

function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(new AppError("Token yo‘q", 401, { code: "NO_TOKEN" }));
  }

  const token = header.split(" ")[1];

  try {
    const payload = verifyAccess(token);
    // payload: { sub, role, iat, exp }
    req.user = payload;
    next();
  } catch (e) {
    next(
      new AppError("Token noto‘g‘ri yoki eskirgan", 401, {
        code: "INVALID_TOKEN",
      }),
    );
  }
}

module.exports = { auth };
