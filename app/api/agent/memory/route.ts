import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface MemoryEntry {
  id: string;
  agentId: string;
  type: 'preference' | 'trade' | 'decision' | 'error' | 'insight';
  content: string;
  metadata?: Record<string, unknown>;
  importance: number;
  createdAt: string;
}

const memoryStore = new Map<string, MemoryEntry[]>();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { agentId, type, content, metadata, importance = 5 } = body;

  if (!agentId || !type || !content) {
    return errorResponse('Agent ID, type, and content required', 400);
  }

  const entry: MemoryEntry = {
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    agentId,
    type,
    content,
    metadata,
    importance,
    createdAt: new Date().toISOString(),
  };

  if (!memoryStore.has(agentId)) {
    memoryStore.set(agentId, []);
  }
  memoryStore.get(agentId)!.push(entry);

  // Keep only last 100 entries
  const entries = memoryStore.get(agentId)!;
  if (entries.length > 100) {
    entries.sort((a, b) => b.importance - a.importance);
    memoryStore.set(agentId, entries.slice(0, 100));
  }

  return successResponse({ entry });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  const type = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!agentId) {
    return errorResponse('Agent ID required', 400);
  }

  let entries = memoryStore.get(agentId) || [];

  if (type) {
    entries = entries.filter(e => e.type === type);
  }

  entries = entries.slice(-limit);

  // Get insights (high importance entries)
  const insights = entries
    .filter(e => e.importance >= 8)
    .map(e => e.content);

  return successResponse({ entries, insights });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  const before = searchParams.get('before');

  if (!agentId) {
    return errorResponse('Agent ID required', 400);
  }

  const entries = memoryStore.get(agentId) || [];
  
  if (before) {
    const filtered = entries.filter(e => new Date(e.createdAt) > new Date(before));
    memoryStore.set(agentId, filtered);
  } else {
    memoryStore.delete(agentId);
  }

  return successResponse({ deleted: true });
}
