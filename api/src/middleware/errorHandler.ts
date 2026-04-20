import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      details: err.details,
    });
  }

  logger.error('Unhandled Error', err);

  return res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    code: 'INTERNAL_SERVER_ERROR',
  });
}
