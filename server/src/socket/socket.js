import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.js';
import logger from '../utils/logger.js';

let ioInstance = null;

/**
 * Initialize Socket.io Server with authentication middleware.
 */
export const initSocketServer = (httpServer) => {
  if (ioInstance) return ioInstance;

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
    pingInterval: 10000, // Heartbeat frequency: 10s
    pingTimeout: 5000,   // Disconnect socket if no response in 5s
  });

  // JWT Authentication Middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication failed: Missing socket token.'));
      }

      const decoded = jwt.verify(token, jwtConfig.secret);
      socket.user = decoded; // Attach user details (id, email, role)
      next();
    } catch (err) {
      logger.error(`[Socket Auth Error]: ${err.message}`);
      next(new Error('Authentication failed: Invalid socket token.'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role } = socket.user;
    logger.info(`[Socket Connected] Client: ${socket.id} (User: ${id}, Role: ${role})`);

    // Join general user room
    socket.join(`user:${id}`);
    // Join role room
    socket.join(`role:${role}`);

    // Join specific active delivery tracking channel
    socket.on('delivery:join', (deliveryId) => {
      socket.join(`delivery:${deliveryId}`);
      logger.info(`[Socket Join] Client ${socket.id} joined delivery:${deliveryId}`);
    });

    socket.on('delivery:leave', (deliveryId) => {
      socket.leave(`delivery:${deliveryId}`);
      logger.info(`[Socket Leave] Client ${socket.id} left delivery:${deliveryId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`[Socket Disconnected] Client: ${socket.id}`);
    });
  });

  ioInstance = io;
  return io;
};

/**
 * Expose singleton instance getter.
 */
export const getIO = () => {
  return ioInstance;
};

export default {
  initSocketServer,
  getIO,
};
