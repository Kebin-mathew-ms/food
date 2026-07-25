import app from './app.js';
import env from './config/env.js';
import logger from './utils/logger.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { initSocketServer } from './config/socket.js';
import { initCronJobs } from './config/cron.js';

/**
 * Handle process-wide uncaught exceptions.
 */
process.on('uncaughtException', (error) => {
  logger.error('CRITICAL: Uncaught Exception detected!');
  logger.error(error.message || error);
  if (error.stack) {
    logger.error(error.stack);
  }
  process.exit(1);
});

/**
 * Handle process-wide unhandled promise rejections.
 */
process.on('unhandledRejection', (reason) => {
  logger.error('CRITICAL: Unhandled Promise Rejection detected!');
  logger.error(`Reason: ${reason}`);
  process.exit(1);
});

/**
 * Initialize components and boot the express application server.
 */
const startServer = async () => {
  // Establish connection with the database
  await connectDatabase();

  const server = app.listen(env.port, () => {
    logger.info(`[Server Startup] Node Environment: ${env.nodeEnv}`);
    logger.info(`[Server Startup] Listening on http://localhost:${env.port}`);
  });

  // Initialize Socket.io Server listener
  initSocketServer(server);

  // Initialize Scheduled Background Jobs
  initCronJobs();

  // Graceful shutdown handler
  const handleGracefulShutdown = async (signal) => {
    logger.info(`${signal} signal received. Commencing graceful server shutdown...`);
    await disconnectDatabase();
    server.close(() => {
      logger.info('HTTP server closed down successfully.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
};

startServer();
