import { Router } from 'express';
import volunteerController from '../controllers/volunteer.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import validate from '../validators/validate.helper.js';
import {
  updateVolunteerProfileSchema,
  updateVolunteerStatusSchema,
  updateLocationSchema,
} from '../validators/volunteer.validator.js';

const router = Router();

// Profile endpoints
router.get(
  '/profile',
  authMiddleware,
  roleMiddleware('VOLUNTEER', 'ADMIN'),
  volunteerController.getProfile
);

router.put(
  '/profile',
  authMiddleware,
  roleMiddleware('VOLUNTEER', 'ADMIN'),
  validate(updateVolunteerProfileSchema),
  volunteerController.updateProfile
);

// Toggle status
router.patch(
  '/status',
  authMiddleware,
  roleMiddleware('VOLUNTEER', 'ADMIN'),
  validate(updateVolunteerStatusSchema),
  volunteerController.updateStatus
);

// Telemetry Location coords update
router.patch(
  '/location',
  authMiddleware,
  roleMiddleware('VOLUNTEER', 'ADMIN'),
  validate(updateLocationSchema),
  volunteerController.updateLocation
);

// Dashboard counts widgets
router.get(
  '/dashboard',
  authMiddleware,
  roleMiddleware('VOLUNTEER', 'ADMIN'),
  volunteerController.getDashboard
);

export default router;
