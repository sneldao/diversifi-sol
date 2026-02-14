import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface AgentContext {
  agentId: string;
  wallet: string;
  chain: 'solana' | 'celo';
  preferences: {
    riskTolerance: 'low' | 'medium' | 'high';
    rebalanceThreshold: number;
    autoStake: boolean;
    notifyOnDrift: boolean;
  };
  sessionCount: number;
  lastActive: string;
  totalTrades: number;
  successfulTrades: number;
}

const contexts = new Map<string, AgentContext>();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { agentId, wallet, chain, preferences } = body;

  if (!agentId || !wallet) {
    return errorResponse('Agent ID and wallet required', 400);
  }

  const context: AgentContext = {
    agentId,
    wallet,
    chain: chain || 'solana',
    preferences: {
      riskTolerance: preferences?.riskTolerance || 'medium',
      rebalanceThreshold: preferences?.rebalanceThreshold || 10,
      autoStake: preferences?.autoStake || false,
      notifyOnDrift: preferences?.notifyOnDrift || true,
    },
    sessionCount: 1,
    lastActive: new Date().toISOString(),
    totalTrades: 0,
    successfulTrades: 0,
  };

  contexts.set(agentId, context);

  return successResponse({ context }, { type: 'context_created' });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');

  if (agentId) {
    const context = contexts.get(agentId);
    if (!context) {
      return errorResponse('Context not found', 404);
    }
    return successResponse({ context });
  }

  return successResponse({ contexts: Array.from(contexts.values()) });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { agentId, ...updates } = body;

  if (!agentId) {
    return errorResponse('Agent ID required', 400);
  }

  const context = contexts.get(agentId);
  if (!context) {
    return errorResponse('Context not found', 404);
  }

  // Update fields
  if (updates.preferences) {
    context.preferences = { ...context.preferences, ...updates.preferences };
  }
  if (updates.wallet) context.wallet = updates.wallet;
  if (updates.chain) context.chain = updates.chain;
  if (updates.lastActive) context.lastActive = updates.lastActive;
  if (updates.totalTrades !== undefined) context.totalTrades = updates.totalTrades;
  if (updates.successfulTrades !== undefined) context.successfulTrades = updates.successfulTrades;
  
  context.sessionCount++;

  return successResponse({ context });
}
