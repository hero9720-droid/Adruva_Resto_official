"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const resend_1 = require("resend");
const logger_1 = require("./logger");
const resend = process.env.RESEND_API_KEY ? new resend_1.Resend(process.env.RESEND_API_KEY) : null;
async function sendEmail({ to, subject, html }) {
    if (!resend) {
        logger_1.logger.info('Email Mock: Subject: ' + subject + ' To: ' + to);
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
    }
    catch (error) {
        logger_1.logger.error('Email failed to send', error);
        // Don't throw in dev if we want to keep going
        if (process.env.NODE_ENV === 'development')
            return { id: 'error-mock' };
        throw error;
    }
}
