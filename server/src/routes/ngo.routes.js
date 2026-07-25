import { Router } from 'express';
import ngoController from '../controllers/ngo.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import multer from 'multer';
import path from 'path';
import ApiError from '../errors/ApiError.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import validate from '../validators/validate.helper.js';
import { upsertProfileSchema } from '../validators/ngo.validator.js';

const router = Router();

// Setup storage parameters for NGO verification documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `ngo-${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Zod-validated file mime filter: PDF, JPG, PNG and max 10MB
const documentFileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Invalid document file type. Only PDF, JPG, and PNG are allowed.'
      ),
      false
    );
  }
};

const ngoDocUpload = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Profile endpoints
router.get(
  '/profile',
  authMiddleware,
  roleMiddleware('NGO', 'ADMIN'),
  ngoController.getProfile
);

router.put(
  '/profile',
  authMiddleware,
  roleMiddleware('NGO', 'ADMIN'),
  validate(upsertProfileSchema),
  ngoController.upsertProfile
);

// Documents upload endpoint
router.post(
  '/documents',
  authMiddleware,
  roleMiddleware('NGO', 'ADMIN'),
  ngoDocUpload.fields([
    { name: 'registration_certificate', maxCount: 1 },
    { name: 'government_id', maxCount: 1 },
    { name: 'ngo_license', maxCount: 1 },
    { name: 'organization_logo', maxCount: 1 },
  ]),
  ngoController.uploadDocuments
);

// NGO dashboard statistics
router.get(
  '/dashboard',
  authMiddleware,
  roleMiddleware('NGO', 'ADMIN'),
  ngoController.getDashboard
);

router.get(
  '/statistics',
  authMiddleware,
  roleMiddleware('NGO', 'ADMIN'),
  ngoController.getStatistics
);

export default router;
