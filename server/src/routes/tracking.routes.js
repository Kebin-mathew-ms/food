import { Router } from 'express';
import trackingController from '../controllers/tracking.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

const router = Router();

router.post(
  '/update',
  authMiddleware,
  roleMiddleware('VOLUNTEER', 'ADMIN'),
  trackingController.updateLocation
);

router.get(
  '/:deliveryId',
  authMiddleware,
  roleMiddleware('VOLUNTEER', 'NGO', 'DONOR', 'ADMIN'),
  trackingController.getLocationHistory
);

export default router;
