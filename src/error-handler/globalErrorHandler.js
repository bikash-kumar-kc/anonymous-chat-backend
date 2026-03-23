// globalErrorHandler.js
export const globalErrorHandler = (err, req, res, _next) => {
    
  
    const statusCode = err.statusCode || 500;
  
    res.status(statusCode).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  };