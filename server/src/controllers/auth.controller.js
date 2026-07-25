import authService from '../services/auth.service.js';
import { successResponse } from '../helpers/response.helper.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { COMMON_MESSAGES } from '../utils/messages.js';
import { v2 as cloudinary } from 'cloudinary';
import cloudinaryConfig from '../config/cloudinary.js';
import logger from '../utils/logger.js';
import fs from 'fs';

// Initialize Cloudinary SDK if variables are present
let isCloudinaryReady = false;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  try {
    cloudinary.config({
      cloud_name: cloudinaryConfig.cloudName,
      api_key: cloudinaryConfig.apiKey,
      api_secret: cloudinaryConfig.apiSecret,
    });
    isCloudinaryReady = true;
    logger.info('Cloudinary SDK configured successfully for profile image uploads.');
  } catch (err) {
    logger.error('Failed to configure Cloudinary:', err.message);
  }
}

/**
 * AuthController managing HTTP handlers for authentication and user sessions.
 */
class AuthController {
  /**
   * User registration endpoint.
   */
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      return successResponse(
        res,
        HTTP_STATUS.CREATED,
        'User registration completed successfully. Please check your email for the verification link.',
        user
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * User login endpoint.
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userAgent = req.headers['user-agent'] || 'unknown';
      const ip = req.ip || '127.0.0.1';

      const data = await authService.login(email, password, userAgent, ip);
      return successResponse(
        res,
        HTTP_STATUS.OK,
        'Successfully logged in.',
        data
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Single device logout endpoint.
   */
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Refresh token is required to log out.',
        });
      }
      await authService.logout(refreshToken);
      return successResponse(res, HTTP_STATUS.OK, 'Successfully logged out.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Multi-device logout endpoint.
   */
  async logoutAll(req, res, next) {
    try {
      const userId = req.user.id;
      await authService.logoutAll(userId);
      return successResponse(
        res,
        HTTP_STATUS.OK,
        'Successfully logged out of all active devices.'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Rotate access/refresh tokens endpoint.
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Refresh token is required.',
        });
      }
      const userAgent = req.headers['user-agent'] || 'unknown';
      const ip = req.ip || '127.0.0.1';

      const data = await authService.refreshToken(refreshToken, userAgent, ip);
      return successResponse(
        res,
        HTTP_STATUS.OK,
        'Access token successfully rotated.',
        data
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Account email verification activation.
   */
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Verification token is required.',
        });
      }
      await authService.verifyEmail(token);
      return successResponse(
        res,
        HTTP_STATUS.OK,
        'Your email address has been verified successfully. You can now log in.'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resend verification token link.
   */
  async resendVerification(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Email address is required.',
        });
      }
      await authService.resendVerification(email);
      return successResponse(
        res,
        HTTP_STATUS.OK,
        'Verification link has been resent successfully.'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Forgot password recovery link request.
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      // Return same generic message for security to avoid email profiling
      return successResponse(
        res,
        HTTP_STATUS.OK,
        'If the email is registered in our system, you will receive a password reset link shortly.'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Password reset execution using token.
   */
  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      return successResponse(
        res,
        HTTP_STATUS.OK,
        'Your password has been reset successfully. Please log in using your new credentials.'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Active account password alteration.
   */
  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { current_password, new_password } = req.body;
      await authService.changePassword(userId, current_password, new_password);
      return successResponse(
        res,
        HTTP_STATUS.OK,
        'Your password has been changed successfully.'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user profile details.
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await authService.getProfile(userId);
      return successResponse(
        res,
        HTTP_STATUS.OK,
        'User profile retrieved successfully.',
        profile
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile fields (including avatar uploading).
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profileData = { ...req.body };

      // Handle avatar file upload if uploaded
      if (req.file) {
        let avatarUrl = '';

        if (isCloudinaryReady) {
          try {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
              folder: 'food_waste_redistribution/avatars',
              transformation: [{ width: 250, height: 250, crop: 'thumb', gravity: 'face' }],
            });
            avatarUrl = uploadResult.secure_url;
            
            // Clean local temp file after upload
            fs.unlinkSync(req.file.path);
          } catch (cloudinaryErr) {
            logger.error('Cloudinary upload failure:', cloudinaryErr.message);
            // Fallback to local file path on Cloudinary failure
            avatarUrl = `/uploads/${req.file.filename}`;
          }
        } else {
          // If Cloudinary variables are not configured, fallback to local path
          avatarUrl = `/uploads/${req.file.filename}`;
        }

        profileData.profile_image = avatarUrl;
      }

      // Ensure email cannot be updated through this endpoint
      delete profileData.email;
      delete profileData.role;
      delete profileData.password;
      delete profileData.email_verified;

      const updatedProfile = await authService.updateProfile(userId, profileData);
      return successResponse(
        res,
        HTTP_STATUS.OK,
        'User profile updated successfully.',
        updatedProfile
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all notifications for authenticated user.
   */
  async getNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const notifications = await authService.getNotifications(userId);
      return successResponse(
        res,
        HTTP_STATUS.OK,
        'Notifications retrieved successfully.',
        notifications
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read.
   */
  async markAllNotificationsRead(req, res, next) {
    try {
      const userId = req.user.id;
      await authService.markAllNotificationsRead(userId);
      return successResponse(
        res,
        HTTP_STATUS.OK,
        'All notifications marked as read.'
      );
    } catch (error) {
      next(error);
    }
  }
}

const authController = new AuthController();
export default authController;
