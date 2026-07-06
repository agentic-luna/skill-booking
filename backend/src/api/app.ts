import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { globalLimiter } from './middleware/rate-limiter';
import { errorHandler } from './middleware/error.middleware';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../config/swagger-spec';

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

// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

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
