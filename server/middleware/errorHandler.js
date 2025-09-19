const logger = require('../utils/logger');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Default error response
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.statusCode || 500,
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error = {
      message: 'Validation Error',
      details: err.details,
      status: 400,
    };
  } else if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = {
        message: 'File too large. Maximum size is 10MB.',
        status: 413,
      };
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      error = {
        message: 'Unexpected file field.',
        status: 400,
      };
    } else {
      error = {
        message: 'File upload error.',
        status: 400,
      };
    }
  } else if (err.message.includes('Google Cloud')) {
    error = {
      message: 'Cloud service temporarily unavailable. Please try again.',
      status: 503,
    };
  } else if (err.message.includes('Document not found')) {
    error = {
      message: 'Document not found.',
      status: 404,
    };
  } else if (err.message.includes('Invalid file type')) {
    error = {
      message: 'Invalid file type. Only PDF, images, and text files are allowed.',
      status: 400,
    };
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    delete error.stack;
    if (error.status >= 500) {
      error.message = 'Internal Server Error';
    }
  } else {
    error.stack = err.stack;
  }

  res.status(error.status).json({
    success: false,
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(error.stack && { stack: error.stack }),
    timestamp: new Date().toISOString(),
  });
};

/**
 * Handle 404 errors
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Async error handler wrapper
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
};
