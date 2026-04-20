import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { AppError } from '../lib/errors';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
      subscriptionStatus?: string;
    }
  }
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, 'Authentication required', 'UNAUTHENTICATED');
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    throw new AppError(401, 'Invalid or expired token', 'INVALID_TOKEN');
  }
}
