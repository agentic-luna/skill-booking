import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import os from 'os';
import { globalLimiter } from './middleware/rate-limiter';
import { errorHandler } from './middleware/error.middleware';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../config/swagger-spec';
import { prisma } from '../config/prisma';

const app = express();

// Global Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Apply rate limiting
app.use(globalLimiter);

// Comprehensive Health Check Endpoint
app.get('/api/v1/health', async (_req, res) => {
  const startTime = Date.now();

  // --- Database Health ---
  let dbStatus: 'UP' | 'DOWN' = 'DOWN';
  let dbLatencyMs: number | null = null;
  let dbError: string | null = null;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = 'UP';
  } catch (err: any) {
    dbError = err.message || 'Unknown database error';
  }

  // --- Memory / RAM ---
  const memUsage = process.memoryUsage();
  const totalSystemMemory = os.totalmem();
  const freeSystemMemory = os.freemem();

  // --- Overall status ---
  const overallStatus = dbStatus === 'UP' ? 'UP' : 'DEGRADED';

  res.status(overallStatus === 'UP' ? 200 : 503).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    responseTimeMs: Date.now() - startTime,

    server: {
      uptime: process.uptime(),
      uptimeFormatted: formatUptime(process.uptime()),
      nodeVersion: process.version,
      pid: process.pid,
      environment: process.env.NODE_ENV || 'development',
    },

    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      ...(dbError && { error: dbError }),
    },

    memory: {
      process: {
        rss: formatBytes(memUsage.rss),
        heapTotal: formatBytes(memUsage.heapTotal),
        heapUsed: formatBytes(memUsage.heapUsed),
        external: formatBytes(memUsage.external),
      },
      system: {
        total: formatBytes(totalSystemMemory),
        free: formatBytes(freeSystemMemory),
        used: formatBytes(totalSystemMemory - freeSystemMemory),
        usagePercent: ((1 - freeSystemMemory / totalSystemMemory) * 100).toFixed(1) + '%',
      },
    },

    system: {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      cpuCores: os.cpus().length,
      loadAverage: os.loadavg().map((l) => l.toFixed(2)),
    },
  });
});

/** Format bytes into a human-readable string (e.g. 128.50 MB) */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i];
}

/** Format seconds into a human-readable uptime string */
function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

// Routing configurations
import authRouter from './routes/auth.routes';
import adminRouter from './routes/admin.routes';
import notificationsRouter from './routes/notifications.routes';
import hostsRouter from './routes/users.routes';
import eventsRouter from './routes/events.routes';
import bookingsRouter from './routes/bookings.routes';
import webhooksRouter from './routes/webhooks.routes';
import reviewsRouter from './routes/reviews.routes';
import boostedEventsRouter from './routes/boosted-events.routes';
import integrationsRouter from './routes/integrations.routes';
import wishlistRouter from './routes/wishlist.routes';
import complaintsRouter from './routes/complaints.routes';

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/hosts', hostsRouter);
app.use('/api/v1/events', eventsRouter);
app.use('/api/v1/bookings', bookingsRouter);
app.use('/api/v1/webhooks', webhooksRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/boosted-events', boostedEventsRouter);
app.use('/api/v1/integrations', integrationsRouter);
app.use('/api/v1/wishlist', wishlistRouter);
app.use('/api/v1/complaints', complaintsRouter);

// Catch-all route for undefined endpoints
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Cannot ${req.method} ${req.path}`,
    },
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
