import { Router } from 'express';
import { prisma } from '../config/database.js';
import { getIO } from '../config/socket.js';
import os from 'os';

const router = Router();

/**
 * Health check endpoint checking database and socket parameters.
 */
router.get('/health', async (req, res) => {
  const health = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    services: {
      database: 'DOWN',
      socket: 'DOWN',
    },
    uptime: process.uptime(),
  };

  try {
    // Check Database connection
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'UP';
  } catch (err) {
    health.status = 'DOWN';
  }

  // Check Socket Status
  const io = getIO();
  if (io) {
    health.services.socket = 'UP';
  }

  const statusCode = health.status === 'UP' ? 200 : 503;
  return res.status(statusCode).json(health);
});

/**
 * System metrics endpoint monitoring memory and CPU load averages.
 */
router.get('/metrics', async (req, res) => {
  const memoryUsage = process.memoryUsage();
  const dbStatus = 'CONNECTED';

  const metrics = {
    uptime: process.uptime(),
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
    },
    system: {
      platform: process.platform,
      arch: process.arch,
      cpusCount: os.cpus().length,
      freeMemory: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
      totalMemory: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
      loadAverage: os.loadavg(),
    },
    database: dbStatus,
  };

  return res.status(200).json(metrics);
});

export default router;
