import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface AgentLog {
  id: string;
  agentId: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  action: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

const logs: AgentLog[] = [];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { agentId, level, action, details } = body;

  if (!agentId || !action) {
    return errorResponse('Agent ID and action required', 400);
  }

  const log: AgentLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    agentId,
    level: level || 'info',
    action,
    details,
    timestamp: new Date().toISOString(),
  };

  logs.push(log);

  // Keep last 1000 logs
  if (logs.length > 1000) {
    logs.splice(0, logs.length - 1000);
  }

  return successResponse({ logId: log.id });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  const level = searchParams.get('level');
  const limit = parseInt(searchParams.get('limit') || '50');

  let filtered = logs;

  if (agentId) {
    filtered = filtered.filter(l => l.agentId === agentId);
  }

  if (level) {
    filtered = filtered.filter(l => l.level === level);
  }

  filtered = filtered.slice(-limit);

  return successResponse({ logs: filtered.reverse() });
}
