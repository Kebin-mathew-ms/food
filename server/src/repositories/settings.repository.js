import { prisma } from '../config/database.js';

class SettingsRepository {
  /**
   * Retrieve all settings key-value entries.
   */
  async getAllSettings() {
    return prisma.system_settings.findMany();
  }

  /**
   * Batch update settings.
   */
  async updateSettings(settingsObject) {
    const promises = Object.entries(settingsObject).map(([key, value]) =>
      prisma.system_settings.upsert({
        where: { setting_key: key },
        update: { setting_value: String(value) },
        create: {
          setting_key: key,
          setting_value: String(value),
          description: `System parameter for ${key}`,
        },
      })
    );
    await Promise.all(promises);
    return this.getAllSettings();
  }
}

const settingsRepository = new SettingsRepository();
export default settingsRepository;
