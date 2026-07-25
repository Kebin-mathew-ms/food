import { Router } from 'express';
import requestController from '../controllers/request.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import validate from '../validators/validate.helper.js';
import { createRequestSchema } from '../validators/ngo.validator.js';

const router = Router();

// Retrieve full request list history
router.get(
  '/history',
  authMiddleware,
  roleMiddleware('NGO', 'ADMIN'),
  requestController.getRequestHistory
);

// Submit request
router.post(
  '/',
  authMiddleware,
  roleMiddleware('NGO', 'ADMIN'),
  validate(createRequestSchema),
  requestController.submitRequest
);

// Retrieve request details
router.get(
  '/:id',
  authMiddleware,
  requestController.getRequestDetails
);

// Cancel pending claim request
router.patch(
  '/:id/cancel',
  authMiddleware,
  roleMiddleware('NGO', 'ADMIN'),
  requestController.cancelRequest
);

// Submit delivery feedback review
router.post(
  '/:id/feedback',
  authMiddleware,
  roleMiddleware('NGO', 'ADMIN'),
  requestController.submitFeedback
);

export default router;
