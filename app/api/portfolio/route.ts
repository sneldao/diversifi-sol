import { NextRequest, NextResponse } from 'next/server';
import { getPortfolio } from '@/lib/helius';
import { successResponse, errorResponse, validateWalletAddress } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  // Validate wallet parameter
  const walletError = validateWalletAddress(wallet);
  if (walletError) {
    return errorResponse(walletError, 400, { field: 'wallet' });
  }

  if (!wallet) {
    return errorResponse('Wallet address is required', 400, { field: 'wallet' });
  }

  try {
    // Server-side only - API keys are protected
    const portfolio = await getPortfolio(wallet);

    if (!portfolio) {
      return errorResponse(
        'Failed to fetch portfolio data from Helius',
        503,
        { service: 'helius', wallet: wallet.slice(0, 8) + '...' }
      );
    }

    return successResponse(portfolio);
  } catch (error) {
    console.error('Portfolio API error:', error);
    return errorResponse(
      'Internal server error',
      500,
      { component: 'portfolio-route' }
    );
  }
}
