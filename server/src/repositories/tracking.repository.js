import { prisma } from '../config/database.js';

class TrackingRepository {
  /**
   * Log telemetry coordinates history.
   */
  async logLocation(volunteerId, lat, lng) {
    return prisma.volunteer_location_logs.create({
      data: {
        volunteer_id: volunteerId,
        latitude: lat,
        longitude: lng,
      },
    });
  }

  /**
   * Fetch recent location history logs.
   */
  async getLocHistory(volunteerId, limit = 20) {
    return prisma.volunteer_location_logs.findMany({
      where: { volunteer_id: volunteerId },
      orderBy: { logged_at: 'desc' },
      take: limit,
    });
  }
}

const trackingRepository = new TrackingRepository();
export default trackingRepository;
