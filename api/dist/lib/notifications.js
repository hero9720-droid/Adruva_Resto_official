"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNegativeReviewAlert = sendNegativeReviewAlert;
exports.sendWhatsAppMessage = sendWhatsAppMessage;
exports.sendTransactionalWhatsApp = sendTransactionalWhatsApp;
const resend_1 = require("resend");
const logger_1 = require("./logger");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY || 're_placeholder_key');
async function sendNegativeReviewAlert(data) {
    const { outletName, ratingFood, ratingService, ratingAmbience, comment, billId, customerPhone, managerEmail } = data;
    logger_1.logger.warn(`Negative review alert triggered for ${outletName}`);
    // 1. Email via Resend
    if (managerEmail) {
        try {
            await resend.emails.send({
                from: 'alerts@adruvaresto.com',
                to: managerEmail,
                subject: `🚨 Urgent: Negative Feedback at ${outletName}`,
                html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #ef4444;">Negative Feedback Received</h2>
            <p>A customer has just left a negative review at <strong>${outletName}</strong>.</p>
            <hr />
            <p><strong>Ratings:</strong></p>
            <ul>
              <li>Food: ${ratingFood}/5</li>
              <li>Service: ${ratingService}/5</li>
              <li>Ambience: ${ratingAmbience}/5</li>
            </ul>
            <p><strong>Customer Comment:</strong></p>
            <blockquote style="background: #f9f9f9; padding: 15px; border-left: 5px solid #ef4444;">
              "${comment || 'No comment provided'}"
            </blockquote>
            <p><strong>Bill ID:</strong> ${billId || 'N/A'}</p>
            <p><strong>Customer Phone:</strong> ${customerPhone || 'N/A'}</p>
            <hr />
            <p style="font-size: 12px; color: #666;">This is an automated alert from Adruva Resto Sentiment Engine.</p>
          </div>
        `
            });
            logger_1.logger.info(`Negative review email sent to ${managerEmail}`);
        }
        catch (err) {
            logger_1.logger.error('Failed to send review email alert', err);
        }
    }
    // 2. WhatsApp Simulator (Placeholder for Twilio/Meta API)
    console.log(`[WHATSAPP ALERT] to ${customerPhone || 'Manager'}: High-priority negative feedback at ${outletName}. Action required.`);
}
async function sendWhatsAppMessage(phone, message) {
    // Simulator: In production, integrate with Twilio, Wati, or Meta WhatsApp Cloud API
    console.log(`[WHATSAPP OUTGOING] to ${phone}: ${message}`);
    return { success: true, provider: 'simulator', message_id: Math.random().toString(36).substr(2, 9) };
}
async function sendTransactionalWhatsApp(type, data) {
    let message = '';
    switch (type) {
        case 'order_ready':
            message = `Hi ${data.name}, your order #${data.orderNumber} is ready at ${data.outletName}! 🍽️`;
            break;
        case 'points_earned':
            message = `Congrats ${data.name}! You just earned ${data.points} points. Your new balance: ${data.totalPoints} PTS. 🎁`;
            break;
        case 'welcome':
            message = `Welcome to the ${data.chainName} family! Visit us to earn exclusive rewards. 🌟`;
            break;
    }
    if (data.phone) {
        return await sendWhatsAppMessage(data.phone, message);
    }
}
