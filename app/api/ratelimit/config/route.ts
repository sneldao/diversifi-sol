import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

// Rate limit configuration (can be adjusted at runtime)
let config = {
  global: { windowMs: 60000, maxRequests: 100 },
  perWallet: { windowMs: 60000, maxRequests: 30 },
  perIP: { windowMs: 60000, maxRequests: 100 },
  burst: { windowMs: 1000, maxRequests: 10 },
};

export async function GET() {
  return successResponse({ config });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, windowMs, maxRequests } = body;

  if (!type || windowMs === undefined || !maxRequests) {
    return errorResponse('Type, windowMs, and maxRequests required', 400);
  }

  const configType = type as keyof typeof config;
  if (!config[configType]) {
    return errorResponse(`Unknown type. Available: ${Object.keys(config).join(', ')}`, 400);
  }

  config[configType] = { windowMs, maxRequests };
  return successResponse({ config });
}

export async function DELETE() {
  // Reset to defaults
  config = {
    global: { windowMs: 60000, maxRequests: 100 },
    perWallet: { windowMs: 60000, maxRequests: 30 },
    perIP: { windowMs: 60000, maxRequests: 100 },
    burst: { windowMs: 1000, maxRequests: 10 },
  };
  return successResponse({ config, message: 'Reset to defaults' });
}
