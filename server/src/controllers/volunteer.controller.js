import volunteerService from '../services/volunteer.service.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { successResponse } from '../helpers/response.helper.js';

class VolunteerController {
  /**
   * Get volunteer profile details.
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await volunteerService.getProfile(userId);
      return successResponse(res, HTTP_STATUS.OK, 'Volunteer profile retrieved successfully.', profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete or update profile.
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await volunteerService.upsertProfile(userId, req.body);
      return successResponse(res, HTTP_STATUS.OK, 'Volunteer profile saved successfully.', profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle online/offline status.
   */
  async updateStatus(req, res, next) {
    try {
      const userId = req.user.id;
      const { online_status } = req.body;
      const profile = await volunteerService.updateStatus(userId, online_status);
      return successResponse(res, HTTP_STATUS.OK, 'Online status updated successfully.', profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update volunteer coordinates location.
   */
  async updateLocation(req, res, next) {
    try {
      const userId = req.user.id;
      const { latitude, longitude } = req.body;
      const log = await volunteerService.updateLocation(userId, latitude, longitude);
      return successResponse(res, HTTP_STATUS.OK, 'Coordinates updated successfully.', log);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieve dashboard counts widgets and recharts values.
   */
  async getDashboard(req, res, next) {
    try {
      const userId = req.user.id;
      const stats = await volunteerService.getDashboardData(userId);
      return successResponse(res, HTTP_STATUS.OK, 'Volunteer dashboard data retrieved successfully.', stats);
    } catch (error) {
      next(error);
    }
  }
}

const volunteerController = new VolunteerController();
export default volunteerController;
