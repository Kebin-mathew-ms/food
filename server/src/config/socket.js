import { initSocketServer, getIO } from '../socket/socket.js';
import socketManager from '../socket/socketManager.js';

export { initSocketServer, getIO };

export const broadcastToRoom = (room, event, data) => {
  socketManager.toRoom(room, event, data);
};

export default {
  initSocketServer,
  getIO,
  broadcastToRoom,
};
