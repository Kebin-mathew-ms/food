import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.js';
import ApiError from '../errors/ApiError.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { AUTH_MESSAGES } from '../utils/messages.js';
import authRepository from '../repositories/auth.repository.js';

/**
 * Authentication Middleware.
 * Verifies the JWT Access Token and appends the User model to the Request.
 */
export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new ApiError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.TOKEN_MISSING)
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify Access Token signature and expiry
    const decoded = jwt.verify(token, jwtConfig.secret);

    // Eager check user existence and status from repository
    const user = await authRepository.findUserById(decoded.id);
    if (!user) {
      return next(
        new ApiError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.TOKEN_INVALID)
      );
    }

    if (user.status !== 'ACTIVE') {
      return next(
        new ApiError(HTTP_STATUS.FORBIDDEN, `Your account is ${user.status.toLowerCase()}.`)
      );
    }

    // Attach minimal auth payload to request context
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(
        new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Access token has expired.')
      );
    }
    return next(
      new ApiError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.TOKEN_INVALID)
    );
  }
};

export default authMiddleware;
