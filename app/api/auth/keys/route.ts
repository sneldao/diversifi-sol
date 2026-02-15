import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';
import { createApiKey, getApiKeyInfo, listApiKeys, deleteApiKey } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, rateLimit = 100, scopes = ['read'] } = body;

  if (!name) return errorResponse('API key name required', 400);

  const key = createApiKey(name, rateLimit, scopes);

  return successResponse({ 
    apiKey: key,
    message: 'Save this key - it will not be shown again' 
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (key) {
    const info = getApiKeyInfo(key);
    if (!info) return errorResponse('Invalid API key', 401);
    return successResponse({ valid: true, info: { name: info.name, scopes: info.scopes } });
  }

  return successResponse({ keys: listApiKeys() });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (!key) return errorResponse('API key required', 400);

  const deleted = deleteApiKey(key);
  return successResponse({ deleted });
}
