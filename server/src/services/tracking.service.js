import trackingRepository from '../repositories/tracking.repository.js';
import volunteerRepository from '../repositories/volunteer.repository.js';
import ApiError from '../errors/ApiError.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { broadcastToRoom } from '../config/socket.js';

class TrackingService {
  /**
   * Log telemetry updates and broadcast coordinates via sockets.
   */
  async updateLocation(userId, deliveryId, lat, lng) {
    const volunteer = await volunteerRepository.findByUserId(userId);
    if (!volunteer) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Volunteer profile not completed.');
    }

    // 1. Update volunteer's current location fields
    await volunteerRepository.updateLocation(volunteer.id, lat, lng);

    // 2. Log history log inside datastore
    const log = await trackingRepository.logLocation(volunteer.id, lat, lng);

    // 3. Broadcast real-time location event to specific active delivery room listeners
    broadcastToRoom(deliveryId, 'volunteer:location_updated', {
      deliveryId,
      volunteerId: volunteer.id,
      latitude: lat,
      longitude: lng,
      timestamp: new Date().toISOString(),
    });

    return log;
  }

  /**
   * Fetch coordinate paths.
   */
  async getLocationHistory(volunteerId, limit) {
    return trackingRepository.getLocHistory(volunteerId, limit);
  }
}

const trackingService = new TrackingService();
export default trackingService;
