import { Resend } from 'resend';
import { logger } from './logger';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!resend) {
    logger.info('Email Mock: Subject: ' + subject + ' To: ' + to);
    return { id: 'mock-id' };
  }
  
  try {
    const data = await resend.emails.send({
      from: 'AdruvaResto <no-reply@adruvaresto.com>',
      to,
      subject,
      html,
    });
    return data;
  } catch (error) {
    logger.error('Email failed to send', error);
    // Don't throw in dev if we want to keep going
    if (process.env.NODE_ENV === 'development') return { id: 'error-mock' };
    throw error;
  }
}
