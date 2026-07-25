import ApiError from '../errors/ApiError.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { COMMON_MESSAGES } from '../utils/messages.js';

/**
 * Middleware handling requests to routes that are not registered.
 */
export const notFoundMiddleware = (req, res, next) => {
  next(
    new ApiError(
      HTTP_STATUS.NOT_FOUND,
      `${COMMON_MESSAGES.RESOURCE_NOT_FOUND}: ${req.method} ${req.originalUrl}`
    )
  );
};

export default notFoundMiddleware;
