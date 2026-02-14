import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

// Image optimization endpoint
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const width = parseInt(searchParams.get('width') || '800');
  const quality = parseInt(searchParams.get('quality') || '80');
  const format = searchParams.get('format') || 'webp';

  if (!url) {
    return errorResponse('Image URL required', 400);
  }

  // In production, use Next.js Image component or imgproxy
  // This is a placeholder that returns the original with params
  return successResponse({
    originalUrl: url,
    optimizedUrl: `${url}?w=${width}&q=${quality}&fmt=${format}`,
    params: { width, quality, format },
    message: 'In production, this would return optimized image',
  });
}

// Lazy loading indicator endpoint
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { items, page, pageSize } = body;

  if (!items || !Array.isArray(items)) {
    return errorResponse('Items array required', 400);
  }

  const p = page || 1;
  const size = pageSize || 20;
  const start = (p - 1) * size;
  const end = start + size;

  const paginated = items.slice(start, end);
  const hasMore = end < items.length;

  return successResponse({
    data: paginated,
    pagination: {
      page: p,
      pageSize: size,
      total: items.length,
      totalPages: Math.ceil(items.length / size),
      hasMore,
    },
  });
}
