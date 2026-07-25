import { PrismaClient } from '@prisma/client';
import env from './env.js';
import logger from '../utils/logger.js';

let prismaInstance = null;

/**
 * Singleton database service wrapper around Prisma Client.
 * Implements connection retry logic, lifecycle handling, and logs.
 */
class PrismaService {
  constructor() {
    if (prismaInstance) {
      return prismaInstance;
    }

    try {
      this.client = new PrismaClient({
        datasources: {
          db: {
            url: env.databaseUrl,
          },
        },
        log:
          env.nodeEnv === 'development'
            ? [
                { emit: 'event', level: 'query' },
                { emit: 'stdout', level: 'info' },
                { emit: 'stdout', level: 'warn' },
                { emit: 'stdout', level: 'error' },
              ]
            : [{ emit: 'stdout', level: 'error' }],
      });

      // Bind query logging to Winston in development
      if (env.nodeEnv === 'development') {
        this.client.$on('query', (e) => {
          logger.debug(
            `Prisma Query: ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`
          );
        });
      }
    } catch (err) {
      logger.warn('Prisma Client is not generated yet (normal before initial migrations).');
      this.client = null;
    }

    prismaInstance = this;
  }

  /**
   * Accessor for PrismaClient instance.
   * @returns {PrismaClient|null}
   */
  getClient() {
    return this.client;
  }

  /**
   * Connects to MySQL with automatic retry cycles.
   * @param {number} [retries=5] - Number of times to retry
   * @param {number} [delay=5000] - Miliseconds to wait between retries
   */
  async connect(retries = 5, delay = 5000) {
    if (!this.client) {
      logger.warn('Active database connection skipped: Prisma client is ungenerated.');
      return;
    }

    while (retries > 0) {
      try {
        await this.client.$connect();
        logger.info('Database connection established successfully via Prisma ORM.');
        return;
      } catch (error) {
        retries--;
        logger.error(
          `Database connection failed: ${error.message || error}. Retries left: ${retries}`
        );

        if (retries === 0) {
          logger.error('CRITICAL: Exhausted all database connection retries. Service terminating.');
          if (env.nodeEnv === 'production') {
            process.exit(1);
          }
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Graceful disconnection utility.
   */
  async disconnect() {
    if (this.client) {
      try {
        await this.client.$disconnect();
        logger.info('Database connection closed down gracefully.');
      } catch (error) {
        logger.error('Error during database disconnection:', error.message || error);
      }
    }
  }
}

const prismaService = new PrismaService();
export const prisma = prismaService.getClient();
export const connectDatabase = (retries, delay) => prismaService.connect(retries, delay);
export const disconnectDatabase = () => prismaService.disconnect();
export default prismaService;
