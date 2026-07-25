import logger from '../utils/logger.js';
import env from '../config/env.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { COMMON_MESSAGES } from '../utils/messages.js';
import { errorResponse } from '../helpers/response.helper.js';

/**
 * Express Global Error Handling Middleware.
 * Catches all errors, logs them using Winston, and formats standardized JSON error responses.
 */
export const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || COMMON_MESSAGES.SERVER_ERROR;

  // Mask internal server error messages in production environment
  if (env.nodeEnv === 'production' && !err.isOperational) {
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    message = COMMON_MESSAGES.SERVER_ERROR;
  }

  // Log error using Winston logger
  logger.error(
    `${statusCode} - ${req.method} ${req.originalUrl} - IP: ${req.ip} - Message: ${message}`
  );
  if (err.stack) {
    logger.error(`Error Stack: ${err.stack}`);
  }

  // Format response error payload
  const errorDetails =
    env.nodeEnv === 'development' ? { stack: err.stack, details: err.errors || null } : null;

  return errorResponse(res, statusCode, message, errorDetails);
};

export default errorMiddleware;
