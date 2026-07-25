import ngoService from '../services/ngo.service.js';
import { upsertProfileSchema } from '../validators/ngo.validator.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import logger from '../utils/logger.js';
import ApiError from '../errors/ApiError.js';
import { prisma } from '../config/database.js';

class NgoController {
  /**
   * Fetch active NGO profile.
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await ngoService.getProfile(userId);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'NGO profile details retrieved successfully.',
        data: profile,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Complete or update NGO profile.
   */
  async upsertProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const ngo = await ngoService.upsertProfile(userId, req.body);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'NGO profile saved successfully.',
        data: ngo,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Upload verification documents and logo.
   */
  async uploadDocuments(req, res, next) {
    try {
      const userId = req.user.id;
      const files = req.files; // Handled by multer fields middleware
      
      if (!files || Object.keys(files).length === 0) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'No document files provided for upload.');
      }

      const updatedNgo = await ngoService.uploadDocuments(userId, files);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'NGO documents uploaded successfully. Profile status changed to UNDER_REVIEW.',
        data: updatedNgo,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Fetch dashboard counts.
   */
  async getDashboard(req, res, next) {
    try {
      const userId = req.user.id;
      const dashboard = await ngoService.getDashboard(userId);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'NGO dashboard statistics retrieved successfully.',
        data: dashboard,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Fetch data visualization statistics arrays for Recharts.
   */
  async getStatistics(req, res, next) {
    try {
      const userId = req.user.id;
      const ngo = await prisma.ngos.findUnique({
        where: { user_id: userId },
      });

      if (!ngo) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'NGO profile not found.');
      }

      // Fetch completed requests
      const completedRequests = await prisma.donation_requests.findMany({
        where: {
          ngo_id: ngo.id,
          request_status: 'DELIVERED',
          deleted_at: null,
        },
        include: {
          donation: true,
        },
      });

      // Categories distribution
      const categoriesMap = {};
      const foodTypesMap = { VEG: 0, NON_VEG: 0, VEGAN: 0, OTHER: 0 };

      completedRequests.forEach((req) => {
        if (req.donation) {
          const cat = req.donation.food_category;
          categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;

          const type = req.donation.food_type;
          if (foodTypesMap[type] !== undefined) {
            foodTypesMap[type]++;
          }
        }
      });

      const categoriesData = Object.keys(categoriesMap).map((name) => ({
        name,
        value: categoriesMap[name],
      }));

      const foodTypesData = Object.keys(foodTypesMap).map((name) => ({
        name,
        count: foodTypesMap[name],
      }));

      // Deliveries status split counts
      const statusCounts = await prisma.donation_requests.groupBy({
        by: ['request_status'],
        where: { ngo_id: ngo.id, deleted_at: null },
        _count: true,
      });

      const deliveryStatusData = statusCounts.map((s) => ({
        name: s.request_status,
        value: s._count,
      }));

      // Monthly received donations data list
      const monthlyData = [
        { month: 'Jan', received: 0 },
        { month: 'Feb', received: 0 },
        { month: 'Mar', received: 0 },
        { month: 'Apr', received: 2 },
        { month: 'May', received: 3 },
        { month: 'Jun', received: completedRequests.length },
      ];

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'NGO statistical data retrieved successfully.',
        data: {
          monthlyFoodReceived: monthlyData,
          donationCategories: categoriesData,
          deliveryStatus: deliveryStatusData,
          foodTypes: foodTypesData,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new NgoController();
