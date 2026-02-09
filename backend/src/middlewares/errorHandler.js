const AppError = require("../utils/AppError");
const { Prisma } = require("@prisma/client");

function mapZodIssues(issues) {
  return new AppError("Validation xato", 400, {
    code: "VALIDATION_ERROR",
    details: issues,
  });
}

function mapPrismaError(err) {
  if (err.code === "P2002") {
    const target = err.meta?.target ? err.meta.target.join(", ") : "field";
    return new AppError(`Duplicate value for: ${target}`, 409, {
      code: "DUPLICATE_VALUE",
      details: { target },
    });
  }

  if (err.code === "P2025") {
    return new AppError("Resource topilmadi", 404, { code: "NOT_FOUND" });
  }

  return new AppError("Database xatosi", 500, { code: "DB_ERROR" });
}

function mapMulterError(err) {
  if (err.code === "LIMIT_FILE_SIZE") {
    return new AppError("Rasm hajmi katta (max 2MB)", 400, {
      code: "FILE_TOO_LARGE",
    });
  }
  return new AppError(err.message || "File upload xatosi", 400, {
    code: "UPLOAD_ERROR",
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let appErr = err;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    appErr = mapPrismaError(err);
  }

  if (err?.name === "MulterError") {
    appErr = mapMulterError(err);
  }

  if (!(appErr instanceof AppError)) {
    appErr = new AppError(appErr?.message || "Internal Server Error", 500, {
      code: "INTERNAL_ERROR",
      isOperational: false,
    });
  }

  const isProd = process.env.NODE_ENV === "production";

  if (!appErr.isOperational) {
    console.error("🔥 Non-operational error:", {
      requestId: req.requestId,
      message: err.message,
      stack: err.stack,
    });
  }

  res.status(appErr.statusCode).json({
    success: false,
    code: appErr.code,
    message: appErr.message,
    requestId: req.requestId,
    ...(appErr.details ? { details: appErr.details } : {}),
    ...(!isProd ? { stack: err.stack } : {}),
  });
}

module.exports = { errorHandler, mapZodIssues };
