import settingsService from '../services/settings.service.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';
import { successResponse } from '../helpers/response.helper.js';

class SettingsController {
  /**
   * Get all active system configuration settings.
   */
  async getSettings(req, res, next) {
    try {
      const config = await settingsService.getSettings();
      return successResponse(res, HTTP_STATUS.OK, 'System settings retrieved.', config);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Batch update system config.
   */
  async updateSettings(req, res, next) {
    try {
      const adminUserId = req.user.id;
      const updated = await settingsService.updateSettings(req.body, adminUserId);
      return successResponse(res, HTTP_STATUS.OK, 'System configurations saved successfully.', updated);
    } catch (error) {
      next(error);
    }
  }
}

const settingsController = new SettingsController();
export default settingsController;
