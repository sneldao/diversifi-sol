import { NextRequest, NextResponse } from 'next/server';
import { registerAgent, verifyAgent } from '@/lib/erc8004';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, capabilities } = body;

    if (!name) {
      return errorResponse('Agent name required', 400);
    }

    const agent = await registerAgent(
      name,
      description || 'DiversiFi on Monad',
      capabilities || ['portfolio_management', 'rebalancing']
    );

    return successResponse(agent, {
      type: 'erc8004_identity',
      standard: 'ERC-8004',
      chain: 'monad',
    });
  } catch (error) {
    return errorResponse('Failed to register agent', 500);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');

  if (agentId) {
    const result = await verifyAgent(agentId);
    if (!result.valid) {
      return errorResponse('Invalid agent ID', 400);
    }
    return successResponse(result.identity);
  }

  return errorResponse('agentId required', 400);
}
