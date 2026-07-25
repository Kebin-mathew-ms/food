import trackingService from '../services/tracking.service.js';
import volunteerService from '../services/volunteer.service.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { successResponse } from '../helpers/response.helper.js';

class TrackingController {
  /**
   * Log active telemetry location updates.
   */
  async updateLocation(req, res, next) {
    try {
      const userId = req.user.id;
      const { deliveryId, latitude, longitude } = req.body;
      const log = await trackingService.updateLocation(userId, deliveryId, latitude, longitude);
      return successResponse(res, HTTP_STATUS.OK, 'Location logged successfully.', log);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch current location paths.
   */
  async getLocationHistory(req, res, next) {
    try {
      const { deliveryId } = req.params;
      const history = await trackingService.getLocationHistory(deliveryId);
      return successResponse(res, HTTP_STATUS.OK, 'Location history retrieved.', history);
    } catch (error) {
      next(error);
    }
  }
}

const trackingController = new TrackingController();
export default trackingController;
