import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { globalLimiter } from './middleware/rate-limiter';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Global Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all API requests
app.use(globalLimiter);

// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Feature Routes
import eventsRouter from './modules/events/events.routes';
app.use('/api/v1/events', eventsRouter);

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
