import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../../../lib/db';
import { redis } from '../../../lib/redis';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../../lib/jwt';
import { AppError } from '../../../lib/errors';

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const result = await db.query(
    'SELECT id, chain_id, name, email, password_hash, role, is_active FROM chain_users WHERE email = $1',
    [email]
  );

  const user = result.rows[0];

  if (!user || !user.is_active) {
    throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
  }

  const payload = {
    chain_user_id: user.id,
    chain_id: user.chain_id,
    role: user.role
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await redis.setex(`refresh_token:chain:${user.id}`, 30 * 24 * 60 * 60, refreshToken);

  res.cookie('chainRefreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  res.json({
    success: true,
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      chain_id: user.chain_id
    }
  });
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies.chainRefreshToken;
  if (!refreshToken) {
    throw new AppError(401, 'Refresh token missing', 'REFRESH_TOKEN_MISSING');
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const storedToken = await redis.get(`refresh_token:chain:${payload.chain_user_id}`);

    if (storedToken !== refreshToken) {
      throw new AppError(401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }

    const newAccessToken = signAccessToken({
      chain_user_id: payload.chain_user_id,
      chain_id: payload.chain_id,
      role: payload.role
    });

    res.json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (err) {
    throw new AppError(401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN');
  }
}
