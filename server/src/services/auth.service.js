import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwtConfig from '../config/jwt.js';
import env from '../config/env.js';
import ApiError from '../errors/ApiError.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import authRepository from '../repositories/auth.repository.js';
import logger from '../utils/logger.js';

// Configuration parameter for email verification enforcement
const REQUIRE_EMAIL_VERIFICATION = process.env.REQUIRE_EMAIL_VERIFICATION === 'true';

/**
 * Authentication Service layer coordinating JWT, password hashes, and user lifecycle queries.
 */
class AuthService {
  /**
   * Helper to hash string tokens using SHA256.
   * @private
   */
  _hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Helper to generate JWT Access and Refresh tokens.
   * @private
   */
  _generateTokens(user) {
    const payload = { id: user.id, email: user.email, role: user.role };
    
    const accessToken = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: '15m',
    });

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return {
      accessToken,
      rawRefreshToken,
      refreshTokenExpiresAt,
    };
  }

  /**
   * Register a new user in the system.
   */
  async register(userData) {
    const { email, phone, password, confirm_password, ...rest } = userData;

    // Check email uniqueness
    const existingEmail = await authRepository.findUserByEmail(email);
    if (existingEmail) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Email address is already registered.');
    }

    // Check phone uniqueness
    const existingPhone = await authRepository.findUserByPhone(phone);
    if (existingPhone) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Phone number is already registered.');
    }

    // Hash password with 12 salt rounds
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await authRepository.createUser({
      ...rest,
      email,
      phone,
      password: passwordHash,
      verification_token: verificationToken,
      verification_token_expiry: verificationTokenExpiry,
      email_verified: false,
      status: 'ACTIVE',
    });

    // Mock Email Dispatch (Business logic boundary)
    logger.info(`[Email Dispatch] Verification token for ${email}: ${verificationToken}`);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Authenticate email/password credentials and generate tokens.
   */
  async login(email, password, deviceInfo = null, ipAddress = null) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password.');
    }

    // Validate password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password.');
    }

    // Check status
    if (user.status !== 'ACTIVE') {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, `Your account is currently ${user.status.toLowerCase()}.`);
    }

    // Enforce email verification if enabled
    if (REQUIRE_EMAIL_VERIFICATION && !user.email_verified) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Please verify your email address before logging in.');
    }

    // Update last login timestamp
    await authRepository.updateUser(user.id, { last_login: new Date() });

    // Generate tokens
    const { accessToken, rawRefreshToken, refreshTokenExpiresAt } = this._generateTokens(user);

    // Hash and store refresh token
    const hashedToken = this._hashToken(rawRefreshToken);
    await authRepository.saveRefreshToken(user.id, hashedToken, refreshTokenExpiresAt, deviceInfo, ipAddress);

    const { password: _, ...userProfile } = user;

    return {
      user: userProfile,
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  /**
   * Rotate access/refresh tokens using sliding expiration.
   */
  async refreshToken(rawRefreshToken, deviceInfo = null, ipAddress = null) {
    const oldHashedToken = this._hashToken(rawRefreshToken);

    const tokenRecord = await authRepository.findRefreshToken(oldHashedToken);
    if (!tokenRecord) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid refresh token.');
    }

    // Check expiration
    if (new Date() > tokenRecord.expires_at) {
      await authRepository.deleteRefreshToken(oldHashedToken);
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Refresh token has expired.');
    }

    const user = tokenRecord.user;

    // Token Rotation: Generate new token pair
    const { accessToken, rawRefreshToken: newRawToken, refreshTokenExpiresAt } = this._generateTokens(user);
    const newHashedToken = this._hashToken(newRawToken);

    // Save new token and revoke/delete old token
    await authRepository.saveRefreshToken(user.id, newHashedToken, refreshTokenExpiresAt, deviceInfo, ipAddress);
    await authRepository.deleteRefreshToken(oldHashedToken);

    return {
      accessToken,
      refreshToken: newRawToken,
    };
  }

  /**
   * Log out a single session.
   */
  async logout(rawRefreshToken) {
    const hashedToken = this._hashToken(rawRefreshToken);
    await authRepository.deleteRefreshToken(hashedToken);
  }

  /**
   * Log out all active sessions of a user.
   */
  async logoutAll(userId) {
    await authRepository.deleteAllRefreshTokens(userId);
  }

  /**
   * Verify verification token and activate account.
   */
  async verifyEmail(token) {
    const user = await authRepository.findUserByVerificationToken(token);
    if (!user) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid verification token.');
    }

    if (new Date() > user.verification_token_expiry) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Verification token has expired. Please request a new one.');
    }

    await authRepository.updateUser(user.id, {
      email_verified: true,
      verification_token: null,
      verification_token_expiry: null,
    });
  }

  /**
   * Regenerate and resend verification token.
   */
  async resendVerification(email) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found.');
    }

    if (user.email_verified) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Email address is already verified.');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await authRepository.updateUser(user.id, {
      verification_token: verificationToken,
      verification_token_expiry: verificationTokenExpiry,
    });

    logger.info(`[Email Dispatch] Resent Verification token for ${email}: ${verificationToken}`);
    return verificationToken;
  }

  /**
   * Generate secure reset token for password recovery.
   */
  async forgotPassword(email) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      // Return success statement for security to prevent user enumeration
      logger.info(`[Forgot Password] Requested for unexisting email: ${email}`);
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await authRepository.updateUser(user.id, {
      reset_token: resetToken,
      reset_token_expiry: resetTokenExpiry,
    });

    logger.info(`[Email Dispatch] Password Reset token for ${email}: ${resetToken}`);
    return resetToken;
  }

  /**
   * Reset user password using token verification.
   */
  async resetPassword(token, password) {
    const user = await authRepository.findUserByResetToken(token);
    if (!user) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid password reset token.');
    }

    if (new Date() > user.reset_token_expiry) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Reset token has expired.');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await authRepository.updateUser(user.id, {
      password: passwordHash,
      reset_token: null,
      reset_token_expiry: null,
    });
  }

  /**
   * Change user password.
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User profile not found.');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Current password is incorrect.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await authRepository.updateUser(user.id, {
      password: passwordHash,
    });
  }

  /**
   * Retrieve profile of authenticated user.
   */
  async getProfile(userId) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User profile not found.');
    }
    const { password: _, ...profile } = user;
    return profile;
  }

  /**
   * Update profile fields of user.
   */
  async updateProfile(userId, profileData) {
    const user = await authRepository.updateUser(userId, profileData);
    const { password: _, ...profile } = user;
    return profile;
  }

  /**
   * Fetch active notifications for a user.
   */
  async getNotifications(userId) {
    const { prisma } = await import('../config/database.js');
    return prisma.notifications.findMany({
      where: { user_id: userId, deleted_at: null },
      orderBy: { sent_at: 'desc' },
    });
  }

  /**
   * Mark all notifications of a user as read.
   */
  async markAllNotificationsRead(userId) {
    const { prisma } = await import('../config/database.js');
    return prisma.notifications.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });
  }
}

export default new AuthService();
