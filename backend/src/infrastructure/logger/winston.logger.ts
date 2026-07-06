import winston from 'winston';
import { ILoggerService } from '../../application/services/logger.service';

export class WinstonLoggerService implements ILoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      defaultMeta: { service: 'skill-booking-backend' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, meta, stack }) => {
              const metaString = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
              const stackString = stack ? `\n${stack}` : '';
              return `[${timestamp}] ${level}: ${message}${metaString}${stackString}`;
            })
          ),
        }),
      ],
    });
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, { meta });
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, { meta });
  }

  error(message: string, error?: any, meta?: any): void {
    const stack = error instanceof Error ? error.stack : undefined;
    const errMsg = error instanceof Error ? error.message : (error ? String(error) : '');
    const fullMessage = errMsg ? `${message} - Error: ${errMsg}` : message;
    this.logger.error(fullMessage, { stack, meta });
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, { meta });
  }
}
