import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface ScheduledRebalance {
  id: string;
  wallet: string;
  chain: 'solana' | 'celo';
  schedule: 'daily' | 'weekly' | 'monthly';
  allocations: Record<string, number>;
  threshold: number; // % drift to trigger
  enabled: boolean;
  nextRun: string;
  lastRun?: string;
  createdAt: string;
}

// In-memory store (use database in production)
const schedules = new Map<string, ScheduledRebalance>();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { wallet, chain, schedule, allocations, threshold = 10 } = body;

  if (!wallet || !chain || !schedule || !allocations) {
    return errorResponse('Missing required: wallet, chain, schedule, allocations', 400);
  }

  const id = `schedule_${Date.now()}`;
  const now = new Date();
  let nextRun: Date;

  switch (schedule) {
    case 'daily':
      nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'weekly':
      nextRun = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      nextRun = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      return errorResponse('Invalid schedule. Use daily, weekly, or monthly', 400);
  }

  const rebalance: ScheduledRebalance = {
    id,
    wallet,
    chain,
    schedule,
    allocations,
    threshold,
    enabled: true,
    nextRun: nextRun.toISOString(),
    createdAt: now.toISOString(),
  };

  schedules.set(id, rebalance);

  return successResponse(rebalance, { type: 'schedule_created' });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  if (wallet) {
    const walletSchedules = Array.from(schedules.values()).filter(s => s.wallet === wallet);
    return successResponse({ schedules: walletSchedules });
  }

  return successResponse({ schedules: Array.from(schedules.values()) });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return errorResponse('Schedule ID required', 400);
  }

  const deleted = schedules.delete(id);
  return successResponse({ deleted });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, enabled, threshold } = body;

  if (!id) {
    return errorResponse('Schedule ID required', 400);
  }

  const schedule = schedules.get(id);
  if (!schedule) {
    return errorResponse('Schedule not found', 404);
  }

  if (enabled !== undefined) schedule.enabled = enabled;
  if (threshold !== undefined) schedule.threshold = threshold;

  schedules.set(id, schedule);
  return successResponse(schedule);
}
