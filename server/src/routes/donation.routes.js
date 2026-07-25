import { Router } from 'express';
import donationController from '../controllers/donation.controller.js';
import validate from '../validators/validate.helper.js';
import {
  createDonationSchema,
  updateDonationSchema,
  queryDonationSchema,
} from '../validators/donation.validator.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const router = Router();

// Stats metric for donors (requires DONOR role)
router.get(
  '/stats',
  authMiddleware,
  roleMiddleware('DONOR', 'ADMIN'),
  donationController.getStats
);

// CRUD operations on food donations
router.post(
  '/',
  authMiddleware,
  roleMiddleware('DONOR', 'ADMIN'),
  validate(createDonationSchema),
  donationController.create
);

router.get(
  '/',
  authMiddleware,
  validate(queryDonationSchema),
  donationController.list
);

// Discovery feed for NGOs to browse nearby food donations
router.get(
  '/nearby',
  authMiddleware,
  roleMiddleware('NGO', 'ADMIN'),
  donationController.getNearby
);

router.get(
  '/:id',
  authMiddleware,
  donationController.getById
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('DONOR', 'ADMIN'),
  validate(updateDonationSchema),
  donationController.update
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('DONOR', 'ADMIN'),
  donationController.delete
);

router.patch(
  '/:id/cancel',
  authMiddleware,
  roleMiddleware('DONOR', 'ADMIN'),
  donationController.cancel
);

router.patch(
  '/:id/restore',
  authMiddleware,
  roleMiddleware('ADMIN'),
  donationController.restore
);

// Image management routes (per-file uploading)
router.post(
  '/:id/images',
  authMiddleware,
  roleMiddleware('DONOR', 'ADMIN'),
  upload.single('image'), // Single image upload named 'image'
  donationController.uploadImage
);

router.post(
  '/:id/images/reorder',
  authMiddleware,
  roleMiddleware('DONOR', 'ADMIN'),
  donationController.reorderImages
);

router.delete(
  '/images/:imageId',
  authMiddleware,
  roleMiddleware('DONOR', 'ADMIN'),
  donationController.deleteImage
);

export default router;
