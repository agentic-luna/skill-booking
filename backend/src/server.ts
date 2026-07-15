import http from 'http';
import app from './app';
import { env } from './config/environment';
import { prisma } from './config/prisma';
import { seedSuperadmin } from './config/seed';
import { initSocket } from './config/socket';
import { commsService, logger } from './api/di-container';

// Clean Architecture Worker bootstrapping dependencies
import { startNotificationWorker } from './infrastructure/queue/bull.queue';
import { PrismaNotificationRepository } from './infrastructure/database/repositories/notification.repository';

const server = http.createServer(app);

// Initialize Socket.io WebSockets
initSocket(server);

const startServer = async () => {
  try {
    // Verify database connection
    logger.info('[Prisma] Connecting to the database...');
    await prisma.$connect();
    logger.info('[Prisma] Database connection established.');

    // Seed Superadmin user
    await seedSuperadmin();

    // Initialize notification worker queue listener with Clean Architecture dependency injection
    logger.info('[BullMQ] Starting background notification worker...');
    const notificationRepo = new PrismaNotificationRepository();

    startNotificationWorker(notificationRepo, commsService);
    logger.info('[BullMQ] Notification worker active.');

    server.listen(env.PORT, () => {
      logger.info(`[Server] Application running on port ${env.PORT} in ${env.NODE_ENV} mode.`);
    });
  } catch (error) {
    logger.error('[Server] Initialization failed:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown for enterprise readiness
const gracefulShutdown = async (signal: string) => {
  logger.info(`[Server] Received ${signal}. Initiating graceful shutdown...`);

  server.close(async () => {
    logger.info('[Server] HTTP and Socket server closed.');

    try {
      await prisma.$disconnect();
      logger.info('[Prisma] Database connection closed.');
      process.exit(0);
    } catch (dbError) {
      logger.error('[Prisma] Error during database disconnect:', dbError);
      process.exit(1);
    }
  });

  // Force exit after 10 seconds if closing processes hang
  setTimeout(() => {
    logger.error('[Server] Graceful shutdown timed out. Forcing termination.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
