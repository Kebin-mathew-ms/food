import deliveryService from '../services/delivery.service.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { successResponse } from '../helpers/response.helper.js';
import ApiError from '../errors/ApiError.js';
import cloudinary from 'cloudinary';
import fs from 'fs';

class DeliveryController {
  /**
   * List available assignments nearby.
   */
  async getAssignments(req, res, next) {
    try {
      const userId = req.user.id;
      const list = await deliveryService.getAssignments(userId);
      return successResponse(res, HTTP_STATUS.OK, 'Assignments retrieved successfully.', list);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get detail information of assignment.
   */
  async getAssignmentById(req, res, next) {
    try {
      const { id } = req.params;
      const assignment = await deliveryService.findById(id);
      return successResponse(res, HTTP_STATUS.OK, 'Assignment details retrieved.', assignment);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Accept pending assignment.
   */
  async acceptAssignment(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updated = await deliveryService.acceptAssignment(userId, id);
      return successResponse(res, HTTP_STATUS.OK, 'Assignment accepted successfully.', updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject pending assignment.
   */
  async rejectAssignment(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updated = await deliveryService.rejectAssignment(userId, id);
      return successResponse(res, HTTP_STATUS.OK, 'Assignment rejected successfully.', updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieve active deliveries for volunteer.
   */
  async getDeliveries(req, res, next) {
    try {
      const userId = req.user.id;
      const list = await deliveryService.getActiveDeliveries(userId);
      return successResponse(res, HTTP_STATUS.OK, 'Active deliveries retrieved.', list);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get specific delivery by ID.
   */
  async getDeliveryById(req, res, next) {
    try {
      const { id } = req.params;
      const delivery = await deliveryService.findById(id);
      return successResponse(res, HTTP_STATUS.OK, 'Delivery details retrieved.', delivery);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Transition start transit (accepted -> way to pickup or picked -> in transit).
   */
  async startTransit(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updated = await deliveryService.startTransit(userId, id);
      return successResponse(res, HTTP_STATUS.OK, 'Transit started successfully.', updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Transition arrived at destination NGO.
   */
  async arrivedAtDestination(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updated = await deliveryService.arrivedAtDestination(userId, id);
      return successResponse(res, HTTP_STATUS.OK, 'Arrived at destination.', updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload pickup proof images.
   */
  async uploadPickupImages(req, res, next) {
    try {
      const file = req.file;
      if (!file) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'No proof photo file selected.');
      }

      // Upload to Cloudinary (fallback to local link if credentials missing)
      let photoUrl = `/uploads/${file.filename}`;
      try {
        if (process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME) {
          const result = await cloudinary.v2.uploader.upload(file.path, {
            folder: 'pickups',
          });
          photoUrl = result.secure_url;
          // Delete temp local file
          fs.unlinkSync(file.path);
        }
      } catch (err) {
        // Fallback silently
      }

      return successResponse(res, HTTP_STATUS.OK, 'Pickup proof image uploaded.', { photoUrl });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete food pickup.
   */
  async pickupFood(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { latitude, longitude, photoUrl } = req.body;

      if (!photoUrl) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Pickup proof image is required.');
      }

      const updated = await deliveryService.pickupFood(userId, id, photoUrl, latitude, longitude);
      return successResponse(res, HTTP_STATUS.OK, 'Food pickup completed.', updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload delivery proof images.
   */
  async uploadDeliveryImages(req, res, next) {
    try {
      const file = req.file;
      if (!file) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'No delivery proof photo selected.');
      }

      let photoUrl = `/uploads/${file.filename}`;
      try {
        if (process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME) {
          const result = await cloudinary.v2.uploader.upload(file.path, {
            folder: 'deliveries',
          });
          photoUrl = result.secure_url;
          fs.unlinkSync(file.path);
        }
      } catch (err) {
        // Fallback silently
      }

      return successResponse(res, HTTP_STATUS.OK, 'Delivery proof image uploaded.', { photoUrl });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload signature canvas image.
   */
  async uploadSignature(req, res, next) {
    try {
      const { signature } = req.body; // Base64 signature data url
      if (!signature) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'No signature string provided.');
      }

      let signatureUrl = signature;
      try {
        if (process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME) {
          const result = await cloudinary.v2.uploader.upload(signature, {
            folder: 'signatures',
          });
          signatureUrl = result.secure_url;
        }
      } catch (err) {
        // Fallback silently to Base64 string
      }

      return successResponse(res, HTTP_STATUS.OK, 'Signature uploaded successfully.', { signatureUrl });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete food delivery.
   */
  async completeDelivery(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { latitude, longitude, delivery_notes, photoUrl, signatureUrl } = req.body;

      if (!photoUrl || !signatureUrl) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Delivery photo and recipient signature are required.');
      }

      const updated = await deliveryService.completeDelivery(
        userId,
        id,
        photoUrl,
        signatureUrl,
        delivery_notes,
        latitude,
        longitude
      );
      return successResponse(res, HTTP_STATUS.OK, 'Food delivery completed successfully.', updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch deliveries history.
   */
  async getHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const { status } = req.query;
      const list = await deliveryService.getHistory(userId, status);
      return successResponse(res, HTTP_STATUS.OK, 'Delivery history retrieved.', list);
    } catch (error) {
      next(error);
    }
  }
}

const deliveryController = new DeliveryController();
export default deliveryController;
