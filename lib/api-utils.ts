import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // requests per window

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function getRateLimitInfo(ip: string): { count: number; remaining: number; resetTime: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(ip);
  
  if (!existing || now > existing.resetTime) {
    const resetTime = now + RATE_LIMIT_WINDOW;
    rateLimitStore.set(ip, { count: 1, resetTime });
    return { count: 1, remaining: RATE_LIMIT_MAX - 1, resetTime };
  }
  
  const remaining = Math.max(0, RATE_LIMIT_MAX - existing.count);
  return { ...existing, remaining };
}

export function isRateLimited(ip: string): boolean {
  const info = getRateLimitInfo(ip);
  return info.count >= RATE_LIMIT_MAX;
}

// Error response helper
export function errorResponse(message: string, status: number = 500, details?: Record<string, unknown>) {
  return NextResponse.json({
    error: {
      message,
      status,
      timestamp: new Date().toISOString(),
      ...(details && { details }),
    },
  }, { status });
}

// Success response helper
export function successResponse<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      ...(meta && { ...meta }),
      timestamp: new Date().toISOString(),
    },
  });
}

// API validation helpers
export function validateWalletAddress(wallet: string | null): string | null {
  if (!wallet) return null;
  // Solana wallet address validation (base58 encoded, 32-44 chars)
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
    return 'Invalid wallet address format';
  }
  return null;
}

export function validateApiKey(key: string | null): boolean {
  // Simple API key format validation
  if (!key) return false;
  // Allow keys starting with sk_ or pk_ or bare keys
  return key.length >= 8 && key.length <= 128;
}

// Clean old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now > data.resetTime + RATE_LIMIT_WINDOW * 2) {
      rateLimitStore.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW * 2); // Clean every 2 windows
