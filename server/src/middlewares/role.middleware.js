import ApiError from '../errors/ApiError.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { AUTH_MESSAGES } from '../utils/messages.js';

/**
 * Role-Based Access Control (RBAC) authorization middleware.
 * @param {...string} allowedRoles - Authorized user roles (e.g. 'ADMIN', 'NGO')
 */
export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new ApiError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED)
      );
    }

    const hasRole = allowedRoles.includes(req.user.role);
    if (!hasRole) {
      return next(
        new ApiError(HTTP_STATUS.FORBIDDEN, AUTH_MESSAGES.FORBIDDEN)
      );
    }

    next();
  };
};

export default roleMiddleware;
