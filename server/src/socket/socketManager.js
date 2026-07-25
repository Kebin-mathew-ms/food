import { getIO } from './socket.js';
import logger from '../utils/logger.js';

class SocketManager {
  /**
   * Broadcast to a specific room target.
   */
  toRoom(room, event, data) {
    const io = getIO();
    if (!io) {
      logger.warn('[Socket Manager Warning]: IO server instance not initialized yet.');
      return;
    }
    io.to(room).emit(event, data);
  }

  /**
   * Broadcast globally to all sockets.
   */
  broadcast(event, data) {
    const io = getIO();
    if (!io) {
      logger.warn('[Socket Manager Warning]: IO server instance not initialized.');
      return;
    }
    io.emit(event, data);
  }

  /**
   * Send notification payload directly to single user channel.
   */
  sendToUser(userId, event, data) {
    this.toRoom(`user:${userId}`, event, data);
  }

  /**
   * Send to all users of a specific role.
   */
  sendToRole(role, event, data) {
    this.toRoom(`role:${role}`, event, data);
  }

  /**
   * Send telemetry coordinates log to delivery rooms.
   */
  emitLocationUpdate(deliveryId, latitude, longitude) {
    this.toRoom(`delivery:${deliveryId}`, 'volunteer:location_updated', {
      deliveryId,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify volunteer assigned assignment channel.
   */
  emitVolunteerAssigned(deliveryId, volunteerId) {
    this.sendToUser(volunteerId, 'delivery:assigned', { deliveryId });
    this.sendToRole('ADMIN', 'volunteer:assigned', { deliveryId, volunteerId });
  }

  /**
   * Emit donation status updates globally (for dashboards, listings views).
   */
  emitDonationUpdated(donation) {
    this.broadcast('donation:updated', donation);
  }
}

const socketManager = new SocketManager();
export default socketManager;
