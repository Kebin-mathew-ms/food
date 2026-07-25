import settingsRepository from '../repositories/settings.repository.js';
import { prisma } from '../config/database.js';
import logger from '../utils/logger.js';

class SettingsService {
  /**
   * Log settings change to audit trail helper.
   */
  async logAudit(userId, details) {
    try {
      await prisma.audit_logs.create({
        data: {
          user_id: userId,
          action: 'SETTINGS_CHANGED',
          table_name: 'system_settings',
          record_id: 'GLOBAL',
          new_values: JSON.stringify(details),
        },
      });
    } catch (err) {
      logger.error('[Audit Logging Error]:', err.message);
    }
  }

  /**
   * Fetch all settings.
   */
  async getSettings() {
    const list = await settingsRepository.getAllSettings();
    // Convert array to clean key-value object
    const configs = {};
    list.forEach((item) => {
      configs[item.setting_key] = item.setting_value;
    });
    return configs;
  }

  /**
   * Batch update system settings.
   */
  async updateSettings(settingsData, adminUserId) {
    const updated = await settingsRepository.updateSettings(settingsData);
    await this.logAudit(adminUserId, settingsData);
    return updated;
  }
}

const settingsService = new SettingsService();
export default settingsService;
