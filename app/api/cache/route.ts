import { successResponse } from '@/lib/api-utils';
import { cache } from '@/lib/cache';

export async function GET() {
  return successResponse({ 
    cache: cache.getStats(),
    keys: cache.keys().slice(0, 20),
  });
}

export async function DELETE() {
  cache.clear();
  return successResponse({ cleared: true });
}
