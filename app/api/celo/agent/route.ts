import { NextRequest, NextResponse } from 'next/server';
import { registerAgent, verifyAgent, MOBILE_MONEY_PROVIDERS } from '@/lib/erc8004';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface RegisterAgentRequest {
  name: string;
  description: string;
  capabilities: string[];
}

// POST - Register a new agent
export async function POST(request: NextRequest) {
  try {
    const body: RegisterAgentRequest = await request.json();
    
    if (!body.name) {
      return errorResponse('Agent name is required', 400);
    }

    const agent = await registerAgent(
      body.name,
      body.description || 'Autonomous agent',
      body.capabilities || ['portfolio_management']
    );

    return successResponse(agent, {
      type: 'erc8004_identity',
      standard: 'ERC-8004',
      description: 'AI Agent Identity registered on Celo',
    });
  } catch (error) {
    console.error('Agent registration error:', error);
    return errorResponse('Failed to register agent', 500);
  }
}

// GET - Verify an agent or get capabilities
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  const action = searchParams.get('action');

  // Return mobile money providers if requested
  if (action === 'providers') {
    return successResponse({
      providers: MOBILE_MONEY_PROVIDERS,
      description: 'Supported mobile money providers for cross-border payments',
    });
  }

  // Verify agent if ID provided
  if (agentId) {
    const result = await verifyAgent(agentId);
    
    if (!result.valid) {
      return errorResponse('Invalid agent ID', 400);
    }

    return successResponse(result.identity, {
      type: 'erc8004_verification',
      standard: 'ERC-8004',
    });
  }

  // Return error if no params
  return errorResponse('Missing required params: agentId or action=providers', 400);
}
