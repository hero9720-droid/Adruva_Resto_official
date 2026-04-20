import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';

export function requireTOTP(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role === 'superadmin' && req.user?.totp_verified !== true) {
    throw new AppError(403, '2FA verification required', '2FA_REQUIRED');
  }
  next();
}
