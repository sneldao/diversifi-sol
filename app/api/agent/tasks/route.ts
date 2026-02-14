import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface Task {
  id: string;
  agentId: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: Record<string, unknown>;
  output?: unknown;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

const tasks = new Map<string, Task>();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { agentId, type, input } = body;

  if (!agentId || !type) {
    return errorResponse('Agent ID and task type required', 400);
  }

  const task: Task = {
    id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    agentId,
    type,
    status: 'pending',
    input: input || {},
  };

  tasks.set(task.id, task);

  // Simulate async execution
  executeTask(task.id);

  return successResponse({ taskId: task.id, status: 'pending' });
}

async function executeTask(taskId: string) {
  const task = tasks.get(taskId);
  if (!task) return;

  task.status = 'running';
  task.startedAt = new Date().toISOString();

  try {
    // Simulate task execution
    await new Promise(r => setTimeout(r, 500));
    
    task.status = 'completed';
    task.output = { success: true, message: 'Task executed' };
  } catch (error) {
    task.status = 'failed';
    task.error = String(error);
  }

  task.completedAt = new Date().toISOString();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('id');
  const agentId = searchParams.get('agentId');

  if (taskId) {
    const task = tasks.get(taskId);
    if (!task) return errorResponse('Task not found', 404);
    return successResponse({ task });
  }

  let filtered = Array.from(tasks.values());

  if (agentId) {
    filtered = filtered.filter(t => t.agentId === agentId);
  }

  return successResponse({ tasks: filtered.reverse().slice(0, 50) });
}
