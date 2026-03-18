import { NextRequest, NextResponse } from 'next/server';
import { getBasePortfolio } from '@/lib/base';
import { successResponse, errorResponse, validateWalletAddress } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  // Validate wallet parameter (Base uses EVM addresses)
  const walletError = validateWalletAddress(wallet);
  if (walletError) {
    return errorResponse(walletError, 400, { field: 'wallet' });
  }

  if (!wallet) {
    return errorResponse('Wallet address is required', 400, { field: 'wallet' });
  }

  // Ensure it's an EVM address
  if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return errorResponse('Invalid EVM wallet address', 400, { field: 'wallet' });
  }

  try {
    const portfolio = await getBasePortfolio(wallet);

    if (!portfolio) {
      return errorResponse(
        'Failed to fetch Base portfolio data',
        503,
        { network: 'base', wallet: wallet.slice(0, 8) + '...' }
      );
    }

    return successResponse(portfolio);
  } catch (error) {
    console.error('Base Portfolio API error:', error);
    return errorResponse(
      'Internal server error',
      500,
      { component: 'base-portfolio-route' }
    );
  }
}
