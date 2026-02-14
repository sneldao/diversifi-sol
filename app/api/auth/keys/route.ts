import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

const API_KEYS = new Map<string, { name: string; rateLimit: number; scopes: string[]; createdAt: string }>();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, rateLimit = 100, scopes = ['read'] } = body;

  if (!name) return errorResponse('API key name required', 400);

  const key = `df_${Date.now()}_${Math.random().toString(36).slice(2, 16)}`;
  
  API_KEYS.set(key, { name, rateLimit, scopes, createdAt: new Date().toISOString() });

  return successResponse({ 
    apiKey: key,
    message: 'Save this key - it will not be shown again' 
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (key) {
    const info = API_KEYS.get(key);
    if (!info) return errorResponse('Invalid API key', 401);
    return successResponse({ valid: true, info: { name: info.name, scopes: info.scopes } });
  }

  return successResponse({ 
    keys: Array.from(API_KEYS.entries()).map(([k, v]) => ({ 
      key: k.slice(0, 10) + '...', 
      name: v.name, 
      scopes: v.scopes 
    })) 
  });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (!key) return errorResponse('API key required', 400);

  const deleted = API_KEYS.delete(key);
  return successResponse({ deleted });
}

// Validate API key middleware
export function validateApiKey(key: string | null): boolean {
  if (!key) return false;
  return API_KEYS.has(key);
}
