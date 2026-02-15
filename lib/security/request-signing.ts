// lib/security/request-signing.ts - Request signing for API authentication

import { createHmac, randomBytes } from 'crypto';

const SIGNATURE_EXPIRY = 300000; // 5 minutes

interface SignedRequest {
  signature: string;
  timestamp: number;
  nonce: string;
}

// Generate API request signature
export function signRequest(
  payload: string,
  secret: string
): SignedRequest {
  const timestamp = Date.now();
  const nonce = randomBytes(16).toString('hex');
  
  const signature = createHmac('sha256', secret)
    .update(`${timestamp}.${nonce}.${payload}`)
    .digest('hex');
  
  return { signature, timestamp, nonce };
}

// Verify request signature
export function verifySignature(
  payload: string,
  secret: string,
  signed: SignedRequest
): boolean {
  // Check timestamp to prevent replay attacks
  if (Date.now() - signed.timestamp > SIGNATURE_EXPIRY) {
    return false;
  }
  
  const expected = createHmac('sha256', secret)
    .update(`${signed.timestamp}.${signed.nonce}.${payload}`)
    .digest('hex');
  
  return expected === signed.signature;
}

// Generate webhook signature
export function signWebhook(
  payload: string,
  secret: string
): string {
  return createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string,
  secret: string,
  signature: string
): boolean {
  const expected = signWebhook(payload, secret);
  return signature === expected;
}

// Hash sensitive data
export function hashData(data: string): string {
  return createHmac('sha256', process.env.HASH_SECRET || 'default')
    .update(data)
    .digest('hex');
}
