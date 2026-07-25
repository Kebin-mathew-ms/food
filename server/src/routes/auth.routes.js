import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import validate from '../validators/validate.helper.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../validators/auth.validator.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';
import rateLimit from 'express-rate-limit';

// Strict rate limiter for brute-force sensitive endpoints
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 15, // limit each IP to 15 authentication attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

// Public Authentication endpoints (rate limited)
router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authRateLimiter, authController.resendVerification);

// Protected Authentication endpoints
router.post('/logout-all', authMiddleware, authController.logoutAll);
router.post('/change-password', authMiddleware, validate(changePasswordSchema), authController.changePassword);
router.get('/profile', authMiddleware, authController.getProfile);
router.get('/notifications', authMiddleware, authController.getNotifications);
router.patch('/notifications/read-all', authMiddleware, authController.markAllNotificationsRead);

// Profile Update route supporting avatar image uploads
router.put(
  '/profile',
  authMiddleware,
  upload.single('avatar'), // Multer parses avatar file
  validate(updateProfileSchema),
  authController.updateProfile
);

export default router;
