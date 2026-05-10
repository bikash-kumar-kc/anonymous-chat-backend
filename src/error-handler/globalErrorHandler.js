import { logger } from "../config/logger.js";

// globalErrorHandler.js
export const globalErrorHandler = (err, req, res, _next) => {
  logger.error({

    type: "HTTP_ERROR",
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    status: err.status || 500,
    userId: req.user?.id,
    requestId: req.id,
  });

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  };