import ApiError from '../errors/ApiError.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { AUTH_MESSAGES } from '../utils/messages.js';

/**
 * Resource Ownership Enforcement Middleware.
 * Restricts access to owners of the resource (e.g. self profile edits) unless the user role is ADMIN.
 * @param {string} [idParamName='id'] - Key name mapping the user ID parameter in path/body
 */
export const ownershipMiddleware = (idParamName = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new ApiError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED)
      );
    }

    const targetUserId = req.params[idParamName] || req.body[idParamName];

    // Authorize if actor is ADMIN or if target matches user session
    if (req.user.role === 'ADMIN' || req.user.id === targetUserId) {
      return next();
    }

    return next(
      new ApiError(HTTP_STATUS.FORBIDDEN, AUTH_MESSAGES.FORBIDDEN)
    );
  };
};

export default ownershipMiddleware;
