import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting at edge
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // requests per window

// Use edge-compatible storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimitInfo(ip: string): { count: number; remaining: number; resetTime: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(ip);
  
  if (!existing || now > existing.resetTime) {
    const resetTime = now + RATE_LIMIT_WINDOW;
    rateLimitStore.set(ip, { count: 1, resetTime });
    return { count: 1, remaining: RATE_LIMIT_MAX - 1, resetTime };
  }
  
  existing.count++;
  const remaining = Math.max(0, RATE_LIMIT_MAX - existing.count);
  return { ...existing, remaining };
}

export function middleware(request: NextRequest) {
  const ip = request.ip ?? 'unknown';
  const path = request.nextUrl.pathname;
  
  // Skip rate limiting for non-API routes
  if (!path.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Skip rate limiting for health check
  if (path === '/api/health-check') {
    return NextResponse.next();
  }
  
  const { count, remaining, resetTime } = getRateLimitInfo(ip);
  
  // Add rate limit headers
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetTime / 1000)));
  
  // Check if rate limited
  if (count > RATE_LIMIT_MAX) {
    return new NextResponse(JSON.stringify({
      error: {
        message: 'Rate limit exceeded',
        status: 429,
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
      },
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
      },
    });
  }
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
