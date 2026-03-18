import { NextRequest, NextResponse } from 'next/server';
import { getMultiChainUbiStatus, SUPPORTED_CHAINS, UBI_CONFIG } from '@/lib/ubi';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  const walletsParam = searchParams.get('wallets');

  // Return supported chains if no agentId
  if (!agentId) {
    return successResponse({
      supportedChains: SUPPORTED_CHAINS.map((chain) => ({
        chain,
        name: UBI_CONFIG[chain as keyof typeof UBI_CONFIG].name,
        ubiToken: UBI_CONFIG[chain as keyof typeof UBI_CONFIG].ubiToken,
        claimAmount: UBI_CONFIG[chain as keyof typeof UBI_CONFIG].claimAmount,
      })),
      description: 'Multi-chain UBI framework for AI agents',
    });
  }

  if (!walletsParam) {
    return errorResponse('Missing required param: wallets (JSON string)', 400);
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
