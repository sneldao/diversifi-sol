import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface QueuedJob {
  id: string;
  type: 'rebalance' | 'alert' | 'bridge' | 'swap';
  payload: Record<string, unknown>;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'normal' | 'high';
  retries: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: unknown;
}

// In-memory queue (use Redis in production)
const jobQueue: QueuedJob[] = [];
const maxRetries = 3;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, payload, priority = 'normal' } = body;

  if (!type || !payload) {
    return errorResponse('Job type and payload required', 400);
  }

  const job: QueuedJob = {
    id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    payload,
    status: 'queued',
    priority,
    retries: 0,
    createdAt: new Date().toISOString(),
  };

  // Insert based on priority
  const priorityOrder = { high: 0, normal: 1, low: 2 };
  const insertIndex = jobQueue.findIndex(j => priorityOrder[j.priority] > priorityOrder[priority]);
  
  if (insertIndex === -1) {
    jobQueue.push(job);
  } else {
    jobQueue.splice(insertIndex, 0, job);
  }

  return successResponse({ jobId: job.id, status: 'queued' }, { type: 'job_queued' });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('id');
  const status = searchParams.get('status');

  if (jobId) {
    const job = jobQueue.find(j => j.id === jobId);
    if (!job) {
      return errorResponse('Job not found', 404);
    }
    return successResponse({ job });
  }

  let jobs = jobQueue;
  
  if (status) {
    jobs = jobs.filter(j => j.status === status);
  }

  return successResponse({
    jobs,
    queueLength: jobQueue.length,
    pending: jobQueue.filter(j => j.status === 'queued').length,
    processing: jobQueue.filter(j => j.status === 'processing').length,
  });
}

// Internal: Process next job (called by cron/worker)
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { jobId, status, result } = body;

  if (!jobId) {
    return errorResponse('Job ID required', 400);
  }

  const jobIndex = jobQueue.findIndex(j => j.id === jobId);
  if (jobIndex === -1) {
    return errorResponse('Job not found', 404);
  }

  const job = jobQueue[jobIndex];
  job.status = status;
  
  if (status === 'processing') {
    job.startedAt = new Date().toISOString();
  } else if (status === 'completed' || status === 'failed') {
    job.completedAt = new Date().toISOString();
    job.result = result;
    
    if (status === 'failed' && job.retries < maxRetries) {
      job.retries++;
      job.status = 'queued';
    }
  }

  return successResponse({ job });
}
