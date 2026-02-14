import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface AuditEntry {
  id: string;
  userId?: string;
  apiKey?: string;
  ip: string;
  method: string;
  path: string;
  status: number;
  latency: number;
  timestamp: string;
  details?: Record<string, unknown>;
}

const auditLog: AuditEntry[] = [];

export function logAudit(entry: Omit<AuditEntry, 'id' | 'timestamp'>) {
  const fullEntry: AuditEntry = {
    ...entry,
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  auditLog.push(fullEntry);
  
  // Keep last 10000 entries
  if (auditLog.length > 10000) {
    auditLog.splice(0, auditLog.length - 10000);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const limit = parseInt(searchParams.get('limit') || '100');

  let filtered = auditLog;

  if (userId) {
    filtered = filtered.filter(e => e.userId === userId);
  }

  return successResponse({ 
    entries: filtered.reverse().slice(0, limit),
    total: auditLog.length 
  });
}

// Middleware to auto-log requests
export function withAudit(handler: (req: NextRequest) => Promise<NextResponse>, req: NextRequest): NextResponse {
  const start = Date.now();
  
  // @ts-ignore - this would be called after handler
  return handler(req).then(response => {
    logAudit({
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      method: req.method,
      path: req.url,
      status: response.status,
      latency: Date.now() - start,
    });
    return response;
  });
}
