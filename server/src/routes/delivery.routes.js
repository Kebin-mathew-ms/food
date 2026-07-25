import { Router } from 'express';
import deliveryController from '../controllers/delivery.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import validate from '../validators/validate.helper.js';
import { pickupProofSchema, completeDeliverySchema } from '../validators/volunteer.validator.js';
import multer from 'multer';
import path from 'path';
import ApiError from '../errors/ApiError.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';

const router = Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `proof-${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid file format. Only JPEG, PNG, and JPG are supported.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Assignments discovery
router.get(
  '/assignments',
  authMiddleware,
  roleMiddleware('VOLUNTEER', 'ADMIN'),
  deliveryController.getAssignments
);

router.get(
  '/assignments/:id',
  authMiddleware,
  roleMiddleware('VOLUNTEER', 'ADMIN'),
  deliveryController.getAssignmentById
);

router.patch(
  '/assignments/:id/accept',
  authMiddleware,
  roleMiddleware('VOLUNTEER', 'ADMIN'),
  deliveryController.acceptAssignment
);

router.patch(
  '/assignments/:id/reject',
  authMiddleware,
  roleMiddleware('VOLUNTEER', 'ADMIN'),
  deliveryController.rejectAssignment
);

// Active deliveries history log
router.get(
  '/history',
  authMiddleware,
  roleMiddleware('VOLUNTEER', 'ADMIN'),
  deliveryController.getHistory
);

// Active deliveries
router.get(
  '/deliveries',
  authMiddleware,
  roleMiddleware('VOLUNTEER', 'ADMIN'),
  deliveryController.getDeliveries
);

router.get(
  '/deliveries/:id',
  authMiddleware,
  roleMiddleware('VOLUNTEER', 'ADMIN'),
  deliveryController.getDeliveryById
);

router.patch(
  '/deliveries/:id/start',
  authMiddleware,
  roleMiddleware('VOLUNTEER', 'ADMIN'),
  deliveryController.startTransit
);

router.patch(
  '/deliveries/:id/arrived',
  authMiddleware,
  roleMiddleware('VOLUNTEER', 'ADMIN'),
  deliveryController.arrivedAtDestination
);

router.patch(
  '/deliveries/:id/pickup',
  authMiddleware,
  roleMiddleware('VOLUNTEER', 'ADMIN'),
  validate(pickupProofSchema),
  deliveryController.pickupFood
);

router.patch(
  '/deliveries/:id/complete',
  authMiddleware,
  roleMiddleware('VOLUNTEER', 'ADMIN'),
  validate(completeDeliverySchema),
  deliveryController.completeDelivery
);

// Proof uploading
router.post(
  '/deliveries/:id/pickup-images',
  authMiddleware,
  roleMiddleware('VOLUNTEER', 'ADMIN'),
  upload.single('photo'),
  deliveryController.uploadPickupImages
);

router.post(
  '/deliveries/:id/delivery-images',
  authMiddleware,
  roleMiddleware('VOLUNTEER', 'ADMIN'),
  upload.single('photo'),
  deliveryController.uploadDeliveryImages
);

router.post(
  '/deliveries/:id/signature',
  authMiddleware,
  roleMiddleware('VOLUNTEER', 'ADMIN'),
  deliveryController.uploadSignature
);

export default router;
