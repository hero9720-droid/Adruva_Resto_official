"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signQR = signQR;
exports.verifyQR = verifyQR;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Signs a space ID (table/room) with the outlet's secret to prevent ID enumeration.
 * Format: spaceId.signature
 */
function signQR(outletId, spaceId, secret) {
    const data = `${outletId}:${spaceId}`;
    const hmac = crypto_1.default.createHmac('sha256', secret);
    hmac.update(data);
    const signature = hmac.digest('hex').slice(0, 16); // Use 16 chars for brevity
    return `${spaceId}.${signature}`;
}
/**
 * Verifies a signed QR token.
 * Returns the spaceId if valid, null otherwise.
 */
function verifyQR(outletId, token, secret) {
    const [spaceId, signature] = token.split('.');
    if (!spaceId || !signature)
        return null;
    const expectedToken = signQR(outletId, spaceId, secret);
    if (expectedToken === token) {
        return spaceId;
    }
    return null;
}
