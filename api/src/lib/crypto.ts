import crypto from 'crypto';

/**
 * Signs a space ID (table/room) with the outlet's secret to prevent ID enumeration.
 * Format: spaceId.signature
 */
export function signQR(outletId: string, spaceId: string, secret: string): string {
  const data = `${outletId}:${spaceId}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  const signature = hmac.digest('hex').slice(0, 16); // Use 16 chars for brevity
  return `${spaceId}.${signature}`;
}

/**
 * Verifies a signed QR token.
 * Returns the spaceId if valid, null otherwise.
 */
export function verifyQR(outletId: string, token: string, secret: string): string | null {
  const [spaceId, signature] = token.split('.');
  if (!spaceId || !signature) return null;

  const expectedToken = signQR(outletId, spaceId, secret);
  if (expectedToken === token) {
    return spaceId;
  }
  return null;
}
