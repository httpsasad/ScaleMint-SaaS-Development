/**
 * ScaleMint Webhook Security Module
 * Cryptographic HMAC-SHA256 signature verification & replay protection
 */

import crypto from 'crypto';

export interface WebhookVerificationOptions {
  payload: string; // Raw string body
  signatureHeader: string; // e.g. "t=1730000000,v1=abc123..." or hex signature
  secret: string;
  toleranceSeconds?: number; // Default 300 seconds (5 minutes)
}

export interface DepositWebhookPayload {
  eventId: string;
  depositId: string;
  userId: string;
  amountCents: number;
  currency: string;
  providerReference: string;
  status: 'confirmed' | 'failed' | 'reversed';
  timestamp: string;
}

/**
 * Verifies the HMAC-SHA256 signature of an inbound payment webhook.
 */
export function verifyWebhookSignature({
  payload,
  signatureHeader,
  secret,
  toleranceSeconds = 300,
}: WebhookVerificationOptions): { valid: boolean; error?: string } {
  if (!signatureHeader || !secret) {
    return { valid: false, error: 'Missing signature header or secret.' };
  }

  // Handle timestamped signatures format "t=<timestamp>,v1=<sig>" or raw hex
  let timestamp: string | undefined;
  let expectedSig: string = signatureHeader;

  if (signatureHeader.includes('t=') && signatureHeader.includes('v1=')) {
    const parts = signatureHeader.split(',');
    for (const part of parts) {
      const [key, val] = part.split('=');
      if (key.trim() === 't') timestamp = val.trim();
      if (key.trim() === 'v1') expectedSig = val.trim();
    }

    if (timestamp) {
      const ts = parseInt(timestamp, 10);
      const now = Math.floor(Date.now() / 1000);
      if (isNaN(ts) || Math.abs(now - ts) > toleranceSeconds) {
        return { valid: false, error: 'Webhook timestamp expired or outside tolerance window.' };
      }
    }
  }

  // Compute HMAC SHA-256
  const dataToSign = timestamp ? `${timestamp}.${payload}` : payload;
  const computedSig = crypto
    .createHmac('sha256', secret)
    .update(dataToSign, 'utf8')
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  const expectedBuffer = Buffer.from(expectedSig, 'utf8');
  const computedBuffer = Buffer.from(computedSig, 'utf8');

  if (expectedBuffer.length !== computedBuffer.length) {
    return { valid: false, error: 'Signature length mismatch.' };
  }

  const matches = crypto.timingSafeEqual(expectedBuffer, computedBuffer);
  if (!matches) {
    return { valid: false, error: 'Cryptographic signature mismatch.' };
  }

  return { valid: true };
}
