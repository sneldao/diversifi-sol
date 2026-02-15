import { NextRequest, NextResponse } from 'next/server';
import { successResponse } from '@/lib/api-utils';
import { getAuditLog, logAudit } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const limit = parseInt(searchParams.get('limit') || '100');

  let filtered = getAuditLog();

  if (userId) {
    filtered = filtered.filter(e => e.userId === userId);
  }

  return successResponse({ 
    entries: filtered.reverse().slice(0, limit),
    total: getAuditLog().length 
  });
}
