import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../../lib/db';
import { redis } from '../../lib/redis';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt';
import { AppError } from '../../lib/errors';
import { sendEmail } from '../../lib/email';
import { v4 as uuidv4 } from 'uuid';

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const result = await db.query(
    'SELECT id, outlet_id, name, email, password_hash, role, is_active FROM staff WHERE email = $1',
    [email]
  );

  const staff = result.rows[0];

  if (!staff || !staff.is_active) {
    throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await bcrypt.compare(password, staff.password_hash);
  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
  }

  // Fetch chain_id for the outlet
  const outletResult = await db.query('SELECT chain_id FROM outlets WHERE id = $1', [staff.outlet_id]);
  const chain_id = outletResult.rows[0]?.chain_id;

  const payload = {
    staff_id: staff.id,
    outlet_id: staff.outlet_id,
    chain_id,
    role: staff.role
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Store refresh token in Redis for revocation
  await redis.setex(`refresh_token:${staff.id}`, 30 * 24 * 60 * 60, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  res.json({
    success: true,
    accessToken,
    user: {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      outlet_id: staff.outlet_id
    }
  });
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError(401, 'Refresh token missing', 'REFRESH_TOKEN_MISSING');
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const storedToken = await redis.get(`refresh_token:${payload.staff_id}`);

    if (storedToken !== refreshToken) {
      throw new AppError(401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }

    const newAccessToken = signAccessToken({
      staff_id: payload.staff_id,
      outlet_id: payload.outlet_id,
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

export async function logout(req: Request, res: Response) {
  const staff_id = req.user?.staff_id;
  if (staff_id) {
    await redis.del(`refresh_token:${staff_id}`);
  }

  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
}

export async function invite(req: Request, res: Response) {
  const { email, name, role } = req.body;
  const outlet_id = req.user.outlet_id; // From verifyToken middleware

  // 1. Create staff record with no password
  const inviteToken = uuidv4();
  
  const result = await db.query(
    `INSERT INTO staff (outlet_id, name, email, role, is_active) 
     VALUES ($1, $2, $3, $4, false) RETURNING id`,
    [outlet_id, name, email, role]
  );
  
  const staff_id = result.rows[0].id;

  // 2. Store invite token in Redis
  await redis.setex(`invite_token:${inviteToken}`, 48 * 60 * 60, staff_id); // 48 hours

  // 3. Send email
  const inviteLink = `${process.env.OUTLET_APP_URL}/set-password?token=${inviteToken}`;
  await sendEmail({
    to: email,
    subject: 'Welcome to AdruvaResto - Complete your setup',
    html: `<h1>Welcome ${name}!</h1>
           <p>You have been invited to join the team at AdruvaResto.</p>
           <p>Click the link below to set your password and activate your account:</p>
           <a href="${inviteLink}">${inviteLink}</a>`
  });

  res.json({ success: true, message: 'Invite sent successfully' });
}

export async function setPassword(req: Request, res: Response) {
  const { token, password } = req.body;

  const staff_id = await redis.get(`invite_token:${token}`);
  if (!staff_id) {
    throw new AppError(400, 'Invalid or expired invite token', 'INVALID_INVITE_TOKEN');
  }

  const password_hash = await bcrypt.hash(password, 12);

  await db.query(
    'UPDATE staff SET password_hash = $1, is_active = true WHERE id = $2',
    [password_hash, staff_id]
  );

  await redis.del(`invite_token:${token}`);

  res.json({ success: true, message: 'Password set successfully' });
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;

  const result = await db.query('SELECT id, name FROM staff WHERE email = $1 AND is_active = true', [email]);
  const staff = result.rows[0];

  if (staff) {
    const resetToken = uuidv4();
    await redis.setex(`reset_token:${resetToken}`, 1 * 60 * 60, staff.id); // 1 hour

    const resetLink = `${process.env.OUTLET_APP_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: email,
      subject: 'Reset your AdruvaResto password',
      html: `<p>Hi ${staff.name},</p>
             <p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>`
    });
  }

  // Always return success to prevent email enumeration
  res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
}

export async function resetPassword(req: Request, res: Response) {
  const { token, newPassword } = req.body;

  const staff_id = await redis.get(`reset_token:${token}`);
  if (!staff_id) {
    throw new AppError(400, 'Invalid or expired reset token', 'INVALID_RESET_TOKEN');
  }

  const password_hash = await bcrypt.hash(newPassword, 12);

  await db.query(
    'UPDATE staff SET password_hash = $1 WHERE id = $2',
    [password_hash, staff_id]
  );

  await redis.del(`reset_token:${token}`);

  res.json({ success: true, message: 'Password reset successfully' });
}
