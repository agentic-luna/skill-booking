"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const environment_1 = require("./config/environment");
const prisma_1 = require("./config/prisma");
const seed_1 = require("./config/seed");
const socket_1 = require("./config/socket");
const di_container_1 = require("./api/di-container");
// Clean Architecture Worker bootstrapping dependencies
const bull_queue_1 = require("./infrastructure/queue/bull.queue");
const notification_repository_1 = require("./infrastructure/database/repositories/notification.repository");
const event_status_job_1 = require("./infrastructure/jobs/event-status.job");
const booking_cleanup_job_1 = require("./infrastructure/jobs/booking-cleanup.job");
const server = http_1.default.createServer(app_1.default);
// Initialize Socket.io WebSockets
(0, socket_1.initSocket)(server);
const startServer = async () => {
    try {
        // Verify database connection
        di_container_1.logger.info('[Prisma] Connecting to the database...');
        await prisma_1.prisma.$connect();
        di_container_1.logger.info('[Prisma] Database connection established.');
        // Seed Superadmin user
        await (0, seed_1.seedSuperadmin)();
        // Seed default boost pricing plans
        await (0, seed_1.seedBoostPricing)();
        // Initialize notification worker queue listener with Clean Architecture dependency injection
        di_container_1.logger.info('[BullMQ] Starting background notification worker...');
        const notificationRepo = new notification_repository_1.PrismaNotificationRepository();
        (0, bull_queue_1.startNotificationWorker)(notificationRepo, di_container_1.commsService);
        di_container_1.logger.info('[BullMQ] Notification worker active.');
        server.listen(environment_1.env.PORT, () => {
            di_container_1.logger.info(`[Server] Application running on port ${environment_1.env.PORT} in ${environment_1.env.NODE_ENV} mode.`);
            event_status_job_1.EventJobs.startStatusUpdater();
            di_container_1.logger.info("[EventJobs] Starting event status updater...");
            booking_cleanup_job_1.BookingCleanupJob.startUnconfirmedBookingCleaner();
            di_container_1.logger.info("[BookingCleanupJob] Starting unconfirmed booking cleanup cron...");
            booking_cleanup_job_1.BookingCleanupJob.startUnconfirmedBoostCleaner();
            di_container_1.logger.info("[BookingCleanupJob] Starting unconfirmed boost cleanup cron...");
        });
    }
    catch (error) {
        di_container_1.logger.error('[Server] Initialization failed:', error);
        process.exit(1);
    }
};
// Handle graceful shutdown for enterprise readiness
const gracefulShutdown = async (signal) => {
    di_container_1.logger.info(`[Server] Received ${signal}. Initiating graceful shutdown...`);
    server.close(async () => {
        di_container_1.logger.info('[Server] HTTP and Socket server closed.');
        try {
            await prisma_1.prisma.$disconnect();
            di_container_1.logger.info('[Prisma] Database connection closed.');
            process.exit(0);
        }
        catch (dbError) {
            di_container_1.logger.error('[Prisma] Error during database disconnect:', dbError);
            process.exit(1);
        }
    });
    // Force exit after 10 seconds if closing processes hang
    setTimeout(() => {
        di_container_1.logger.error('[Server] Graceful shutdown timed out. Forcing termination.');
        process.exit(1);
    }, 10000);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
startServer();
