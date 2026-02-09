class AppError extends Error {
  constructor(message, statusCode = 500, options = {}) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = options.isOperational ?? true;
    this.code = options.code || "ERROR";
    this.details = options.details || null;
  }
}

module.exports = AppError;
