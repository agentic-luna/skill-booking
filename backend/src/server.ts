import http from 'http';
import app from './app';
import { env } from './config/environment';
import { prisma } from './config/prisma';
import { initSocket } from './config/socket';

const server = http.createServer(app);

// Initialize Socket.io WebSockets
initSocket(server);

const startServer = async () => {
  try {
    // Verify database connection
    console.log('[Prisma] Connecting to the database...');
    await prisma.$connect();
    console.log('[Prisma] Database connection established.');

    server.listen(env.PORT, () => {
      console.log(`[Server] Application running on port ${env.PORT} in ${env.NODE_ENV} mode.`);
    });
  } catch (error) {
    console.error('[Server] Initialization failed:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown for enterprise readiness
const gracefulShutdown = async (signal: string) => {
  console.log(`[Server] Received ${signal}. Initiating graceful shutdown...`);
  
  server.close(async () => {
    console.log('[Server] HTTP and Socket server closed.');
    
    try {
      await prisma.$disconnect();
      console.log('[Prisma] Database connection closed.');
      process.exit(0);
    } catch (dbError) {
      console.error('[Prisma] Error during database disconnect:', dbError);
      process.exit(1);
    }
  });

  // Force exit after 10 seconds if closing processes hang
  setTimeout(() => {
    console.error('[Server] Graceful shutdown timed out. Forcing termination.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
