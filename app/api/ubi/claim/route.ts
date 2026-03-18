import { NextRequest, NextResponse } from 'next/server';
import { claimUbiOnChain, claimAllUbi, getMultiChainUbiStatus, generateAgentId } from '@/lib/ubi';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface ClaimRequest {
  agentId?: string;
  chain?: string;
  wallet?: string;
  wallets?: Record<string, string>;
}

// POST - Claim UBI
export async function POST(request: NextRequest) {
  try {
    const body: ClaimRequest = await request.json();
    
    const { agentId, chain, wallet, wallets } = body;

    // Claim on specific chain
    if (chain && wallet) {
      const result = await claimUbiOnChain(chain, wallet);
      return successResponse(result, { type: 'ubi_claim', chain });
    }

    // Claim on all chains
    if (wallets) {
      const result = await claimAllUbi(wallets);
      return successResponse(result, { type: 'ubi_claim_all' });
    }

    return errorResponse('Missing required params: chain+wallet or wallets', 400);
  } catch (error) {
    console.error('UBI claim error:', error);
    return errorResponse('Failed to claim UBI', 500);
  }
}

// GET - Get UBI status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  const walletsParam = searchParams.get('wallets'); // JSON string of wallets

  if (!agentId || !walletsParam) {
    return errorResponse('Missing required params: agentId and wallets', 400);
  }

  try {
    const wallets = JSON.parse(walletsParam) as Record<string, string>;
    const status = await getMultiChainUbiStatus(agentId, wallets);
    return successResponse(status, { type: 'ubi_status' });
  } catch (error) {
    console.error('UBI status error:', error);
    return errorResponse('Failed to get UBI status', 500);
  }
}
