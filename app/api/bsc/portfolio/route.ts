import { NextRequest, NextResponse } from 'next/server';
import { getBscPortfolio } from '@/lib/bsc';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return errorResponse('Wallet address is required', 400, { field: 'wallet' });
  }

  // Validate BSC address format (Ethereum-style: 0x...)
  if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return errorResponse(
      'Invalid BSC address format. Expected: 0x followed by 40 hex characters',
      400,
      { field: 'wallet', hint: 'Example: 0x1234567890abcdef1234567890abcdef12345678' }
    );
  }

  try {
    const portfolio = await getBscPortfolio(wallet);

    if (!portfolio) {
      return errorResponse(
        'Failed to fetch BSC portfolio data',
        503,
        { service: 'bsc-rpc', wallet: wallet.slice(0, 10) + '...' }
      );
    }

    return successResponse(portfolio, {
      network: 'bsc',
      chainId: 56,
      description: 'BNB Smart Chain - Multi-chain DeFi hub',
    });
  } catch (error) {
    console.error('BSC Portfolio API error:', error);
    return errorResponse(
      'Internal server error',
      500,
      { component: 'bsc-portfolio-route' }
    );
  }
}
