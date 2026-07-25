import cron from 'node-cron';
import { prisma } from './database.js';
import notificationService from '../services/notification.service.js';
import logger from '../utils/logger.js';

/**
 * Task 1: Auto Expire Food Donations (Runs every minute)
 */
export const startAutoExpireJob = () => {
  cron.schedule('* * * * *', async () => {
    logger.info('[Cron Job] Executing auto expiration check on food donations...');
    try {
      const now = new Date();
      const expired = await prisma.food_donations.findMany({
        where: {
          status: { in: ['AVAILABLE', 'REQUESTED'] },
          expiry_time: { lte: now },
          deleted_at: null,
        },
      });

      if (expired.length === 0) return;

      const promises = expired.map(async (donation) => {
        // Update status to EXPIRED
        await prisma.food_donations.update({
          where: { id: donation.id },
          data: { status: 'EXPIRED', updated_at: now },
        });

        // Notify donor
        await notificationService.sendNotification({
          userId: donation.donor_id,
          title: 'Donation Listing Expired',
          message: `Your food donation listing for "${donation.food_name}" has expired.`,
          category: 'DONATION',
          priority: 'HIGH',
          emailTemplate: 'donationExpired',
          emailSubject: 'Surplus Listing Expired - Action Required',
          emailContext: {
            foodName: donation.food_name,
          },
        });
      });

      await Promise.all(promises);
      logger.info(`[Cron Job] Successfully expired ${expired.length} food listings.`);
    } catch (err) {
      logger.error(`[Cron Job Error] Expiration check failed: ${err.message}`);
    }
  });
};

/**
 * Task 2: Clears old notifications (Runs every day at midnight: '0 0 * * *')
 */
export const startDatabaseCleanupJob = () => {
  cron.schedule('0 0 * * *', async () => {
    logger.info('[Cron Job] Commencing database notifications purge...');
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deleted = await prisma.notifications.deleteMany({
        where: {
          created_at: { lte: thirtyDaysAgo },
        },
      });

      logger.info(`[Cron Job] Successfully purged ${deleted.count} old notification records.`);
    } catch (err) {
      logger.error(`[Cron Job Error] Purging task failed: ${err.message}`);
    }
  });
};

/**
 * Boot all scheduled background processes.
 */
export const initCronJobs = () => {
  startAutoExpireJob();
  startDatabaseCleanupJob();
  logger.info('[Cron Engine] All background cron services initialized successfully.');
};

export default {
  initCronJobs,
  startAutoExpireJob,
  startDatabaseCleanupJob,
};
