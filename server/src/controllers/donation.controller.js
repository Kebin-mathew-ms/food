import donationService from '../services/donation.service.js';
import { successResponse } from '../helpers/response.helper.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { prisma } from '../config/database.js';
import { calculateDistance } from '../utils/distance.js';
import ApiError from '../errors/ApiError.js';

/**
 * DonationController handling Express requests for food donations and images.
 */
class DonationController {
  /**
   * Create donation listing.
   */
  async create(req, res, next) {
    try {
      const donorId = req.user.id;
      const data = await donationService.createDonation(donorId, req.body);
      return successResponse(
        res,
        HTTP_STATUS.CREATED,
        'Food donation listed successfully.',
        data
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * List paginated food donations matching filters.
   */
  async list(req, res, next) {
    try {
      // If querying self listings as a donor, bind donorId
      const queryParams = { ...req.query };
      if (req.query.selfOnly === 'true' && req.user) {
        queryParams.donorId = req.user.id;
      }

      const data = await donationService.listDonations(queryParams);
      return successResponse(
        res,
        HTTP_STATUS.OK,
        'Food donations list retrieved successfully.',
        data
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieve single donation details.
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const donation = await donationService.getDonationById(id);
      return successResponse(
        res,
        HTTP_STATUS.OK,
        'Food donation retrieved successfully.',
        donation
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update donation listing details.
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const donorId = req.user.id;
      const userRole = req.user.role;

      const updated = await donationService.updateDonation(id, donorId, userRole, req.body);
      return successResponse(
        res,
        HTTP_STATUS.OK,
        'Food donation listing updated successfully.',
        updated
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel an active donation listing.
   */
  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const donorId = req.user.id;
      const userRole = req.user.role;

      const cancelled = await donationService.cancelDonation(id, donorId, userRole);
      return successResponse(
        res,
        HTTP_STATUS.OK,
        'Food donation listing cancelled successfully.',
        cancelled
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Soft-delete donation listing.
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const donorId = req.user.id;
      const userRole = req.user.role;

      await donationService.deleteDonation(id, donorId, userRole);
      return successResponse(
        res,
        HTTP_STATUS.OK,
        'Food donation listing deleted successfully.'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restore soft-deleted donation (Admin only).
   */
  async restore(req, res, next) {
    try {
      const { id } = req.params;
      const adminUserId = req.user.id;

      const restored = await donationService.restoreDonation(id, adminUserId);
      return successResponse(
        res,
        HTTP_STATUS.OK,
        'Food donation listing restored successfully.',
        restored
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload an image for a donation listing.
   */
  async uploadImage(req, res, next) {
    try {
      const { id } = req.params;
      const donorId = req.user.id;
      const userRole = req.user.role;

      if (!req.file) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'No image file was provided.',
        });
      }

      const newImage = await donationService.uploadDonationImage(id, donorId, userRole, req.file);
      return successResponse(
        res,
        HTTP_STATUS.CREATED,
        'Donation image uploaded successfully.',
        newImage
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an image from a donation listing.
   */
  async deleteImage(req, res, next) {
    try {
      const { imageId } = req.params;
      const donorId = req.user.id;
      const userRole = req.user.role;

      await donationService.deleteDonationImage(imageId, donorId, userRole);
      return successResponse(
        res,
        HTTP_STATUS.OK,
        'Donation image deleted successfully.'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reorder listings of images.
   */
  async reorderImages(req, res, next) {
    try {
      const { id } = req.params;
      const donorId = req.user.id;
      const userRole = req.user.role;
      const { orderedImageIds } = req.body;

      if (!Array.isArray(orderedImageIds)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'orderedImageIds must be an array of image IDs.',
        });
      }

      await donationService.reorderDonationImages(id, donorId, userRole, orderedImageIds);
      return successResponse(
        res,
        HTTP_STATUS.OK,
        'Donation images reordered successfully.'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get stats metrics for active donor.
   */
  async getStats(req, res, next) {
    try {
      const donorId = req.user.id;
      const stats = await donationService.getDonorStats(donorId);
      return successResponse(
        res,
        HTTP_STATUS.OK,
        'Donor stats retrieved successfully.',
        stats
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Discovery feed for NGOs to browse nearby food donations.
   */
  async getNearby(req, res, next) {
    try {
      const userId = req.user.id;

      // 1. Locate NGO profile and verify status
      const ngo = await prisma.ngos.findUnique({
        where: { user_id: userId },
      });

      if (!ngo) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'NGO Profile not completed.');
      }

      if (ngo.status !== 'VERIFIED') {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          'Access Denied: Only VERIFIED organizations can browse donations.'
        );
      }

      const {
        search = '',
        category = '',
        type = '',
        radius = '',
        sort = 'distance', // 'distance' | 'created_at' | 'expiry' | 'quantity'
        page = 1,
        limit = 10,
      } = req.query;

      // 2. Fetch all AVAILABLE donations in DB
      const now = new Date();
      const rawDonations = await prisma.food_donations.findMany({
        where: {
          status: 'AVAILABLE',
          deleted_at: null,
          expiry_time: { gt: now },
          ...(category ? { food_category: category } : {}),
          ...(type ? { food_type: type } : {}),
          ...(search
            ? {
                OR: [
                  { food_name: { contains: search } },
                  { description: { contains: search } },
                  { pickup_city: { contains: search } },
                ],
              }
            : {}),
        },
        include: {
          donation_images: true,
          donor: {
            select: {
              full_name: true,
            },
          },
        },
      });

      // 3. Compute distance in KM for each item
      const ngoLat = ngo.latitude || 40.7128;
      const ngoLng = ngo.longitude || -74.0060;
      const maxRadius = radius ? Number(radius) : (ngo.operating_radius || 10.0);

      const itemsWithDistance = rawDonations
        .map((item) => {
          const lat = item.pickup_latitude || 40.7128;
          const lng = item.pickup_longitude || -74.0060;
          const distance = calculateDistance(ngoLat, ngoLng, lat, lng);
          return { ...item, distance };
        })
        .filter((item) => item.distance <= maxRadius);

      // 4. Sort calculations
      if (sort === 'distance') {
        itemsWithDistance.sort((a, b) => a.distance - b.distance);
      } else if (sort === 'created_at') {
        itemsWithDistance.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else if (sort === 'expiry') {
        itemsWithDistance.sort((a, b) => new Date(a.expiry_time) - new Date(b.expiry_time));
      } else if (sort === 'quantity') {
        itemsWithDistance.sort((a, b) => b.quantity - a.quantity);
      }

      // 5. Paginate results
      const skip = (page - 1) * limit;
      const records = itemsWithDistance.slice(skip, skip + Number(limit));

      return successResponse(res, HTTP_STATUS.OK, 'Nearby food donations discovered successfully.', {
        records,
        metadata: {
          page: Number(page),
          limit: Number(limit),
          last_page: Math.ceil(itemsWithDistance.length / Number(limit)),
          total: itemsWithDistance.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

const donationController = new DonationController();
export default donationController;
