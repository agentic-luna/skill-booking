import { Request, Response, NextFunction } from 'express';
import { AppError } from '../common/errors';
import { logger } from '../di-container';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  if (err.stack) {
    logger.error(err.stack);
  }
  logger.error(`[API Error] ${statusCode} - ${message}`, err, { path: req.path, method: req.method });

  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: isAppError ? err.constructor.name : 'InternalServerError',
      ...(isAppError && (err as AppError).details ? { details: (err as AppError).details } : {}),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
