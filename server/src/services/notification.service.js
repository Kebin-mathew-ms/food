import { prisma } from '../config/database.js';
import emailService from './email.service.js';
import socketManager from '../socket/socketManager.js';
import logger from '../utils/logger.js';

class NotificationService {
  /**
   * Universal dispatcher creating in-app DB logs, dispatching socket signals and emails.
   */
  async sendNotification({
    userId,
    title,
    message,
    category = 'SYSTEM',
    priority = 'MEDIUM',
    emailTemplate = null,
    emailSubject = '',
    emailContext = {},
  }) {
    try {
      // 1. Create In-App database notification entry
      const inApp = await prisma.notifications.create({
        data: {
          user_id: userId,
          title,
          message,
          type: category, // Category maps to standard type string in schema
          is_read: false,
          created_at: new Date(),
        },
      });

      // 2. Broadcast via Sockets for real-time delivery
      socketManager.sendToUser(userId, 'notification:received', {
        id: inApp.id,
        title,
        message,
        category,
        priority,
        created_at: inApp.created_at,
      });

      // 3. Dispatch Email if email template details are provided
      if (emailTemplate) {
        const user = await prisma.users.findUnique({
          where: { id: userId },
          select: { email: true, full_name: true },
        });

        if (user?.email) {
          await emailService.sendMail(user.email, emailSubject || title, emailTemplate, {
            name: user.full_name,
            ...emailContext,
          });
        }
      }

      logger.info(`[Notification Dispatched] User: ${userId} | Category: ${category} | Priority: ${priority}`);
      return inApp;
    } catch (err) {
      logger.error(`[Notification Service Dispatch Error]: ${err.message}`);
    }
  }

  /**
   * Bulk mark as read.
   */
  async markAllAsRead(userId) {
    return prisma.notifications.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });
  }

  /**
   * Delete single notification log.
   */
  async deleteNotification(id, userId) {
    return prisma.notifications.deleteMany({
      where: { id, user_id: userId },
    });
  }
}

const notificationService = new NotificationService();
export default notificationService;
