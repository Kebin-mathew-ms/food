import BaseRepository from './BaseRepository.js';

/**
 * NotificationRepository managing notifications entity queries.
 */
class NotificationRepository extends BaseRepository {
  constructor() {
    super('notifications');
  }

  /**
   * Fetch all active unread notifications for a user.
   */
  async findUnreadByUser(userId) {
    this._checkModel();
    return this.model.findMany({
      where: {
        user_id: userId,
        is_read: false,
        deleted_at: null,
      },
      orderBy: {
        sent_at: 'desc',
      },
    });
  }

  /**
   * Mark all unread notifications of a user as read.
   */
  async markAllAsRead(userId) {
    this._checkModel();
    return this.model.updateMany({
      where: {
        user_id: userId,
        is_read: false,
      },
      data: {
        is_read: true,
      },
    });
  }
}

export default new NotificationRepository();
