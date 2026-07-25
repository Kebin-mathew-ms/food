import volunteerRepository from '../repositories/volunteer.repository.js';
import ApiError from '../errors/ApiError.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';

class VolunteerService {
  /**
   * Fetch profile details by user ID.
   */
  async getProfile(userId) {
    const profile = await volunteerRepository.findByUserId(userId);
    if (!profile) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Volunteer profile not completed yet.');
    }
    return profile;
  }

  /**
   * Complete or update volunteer profile details.
   */
  async upsertProfile(userId, profileData) {
    return volunteerRepository.upsert(userId, {
      ...profileData,
    });
  }

  /**
   * Toggle online status.
   */
  async updateStatus(userId, onlineStatus) {
    const profile = await volunteerRepository.findByUserId(userId);
    if (!profile) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Volunteer profile not found. Please complete profile details first.');
    }

    return volunteerRepository.updateStatus(profile.id, onlineStatus);
  }

  /**
   * Update current coordinates location.
   */
  async updateLocation(userId, lat, lng) {
    const profile = await volunteerRepository.findByUserId(userId);
    if (!profile) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Volunteer profile not found.');
    }

    return volunteerRepository.updateLocation(profile.id, lat, lng);
  }

  /**
   * Compile dashboard stats and analytics.
   */
  async getDashboardData(userId) {
    const profile = await volunteerRepository.findByUserId(userId);
    if (!profile) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Volunteer profile not completed.');
    }

    const stats = await volunteerRepository.getDashboardStats(profile.id);
    const monthlyList = await volunteerRepository.getMonthlyDeliveries(profile.id);

    return {
      profileStatus: profile.online_status,
      stats,
      charts: {
        monthlyDeliveries: monthlyList,
      },
    };
  }
}

const volunteerService = new VolunteerService();
export default volunteerService;
