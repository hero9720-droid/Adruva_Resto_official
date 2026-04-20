import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { authenticator } = require('otplib');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const qrcode = require('qrcode') as typeof import('qrcode');
import { db } from '../../../lib/db';
import { signAccessToken } from '../../../lib/jwt';
import { AppError } from '../../../lib/errors';

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const result = await db.query(
    'SELECT id, name, email, password_hash, totp_secret, totp_enabled FROM superadmin_users WHERE email = $1',
    [email]
  );

  const admin = result.rows[0];
  console.log('Login attempt:', { email, totp_enabled: admin?.totp_enabled });

  if (!admin) {
    throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
  }

  if (!admin.totp_enabled) {
    const accessToken = signAccessToken({
      superadmin_id: admin.id,
      role: 'superadmin',
      totp_verified: true
    });
    return res.json({
      success: true,
      accessToken,
      totpEnabled: false
    });
  }

  // Generate partial JWT if 2FA is required
  const partialToken = signAccessToken({
    superadmin_id: admin.id,
    role: 'superadmin',
    step: 'password_verified',
    totp_verified: false
  });

  res.json({
    success: true,
    partialToken,
    totpEnabled: true
  });
}

export async function setup2FA(req: Request, res: Response) {
  // Only allowed if user has password_verified partial token
  if (req.user.step !== 'password_verified') {
    throw new AppError(403, 'Password verification required', 'FORBIDDEN');
  }

  const admin_id = req.user.superadmin_id;
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri('admin@adruvaresto.com', 'AdruvaResto', secret);
  
  const qrCodeDataUrl = await qrcode.toDataURL(otpauth);

  // Store secret temporarily in DB (unverified)
  await db.query(
    'UPDATE superadmin_users SET totp_secret = $1 WHERE id = $2',
    [secret, admin_id]
  );

  res.json({
    success: true,
    qrCode: qrCodeDataUrl,
    secret // Optional: show manual entry code
  });
}

export async function verify2FA(req: Request, res: Response) {
  const { token } = req.body;
  const admin_id = req.user.superadmin_id;

  const result = await db.query(
    'SELECT totp_secret FROM superadmin_users WHERE id = $1',
    [admin_id]
  );
  const secret = result.rows[0]?.totp_secret;

  if (!secret) {
    throw new AppError(400, '2FA setup not initiated', '2FA_NOT_SETUP');
  }

  const isValid = authenticator.verify({ token, secret });
  if (!isValid) {
    throw new AppError(401, 'Invalid TOTP token', 'INVALID_TOTP');
  }

  // Mark 2FA as enabled in DB
  await db.query(
    'UPDATE superadmin_users SET totp_enabled = true WHERE id = $1',
    [admin_id]
  );

  // Issue FULL access token
  const fullToken = signAccessToken({
    superadmin_id: admin_id,
    role: 'superadmin',
    totp_verified: true
  });

  res.json({
    success: true,
    accessToken: fullToken
  });
}
