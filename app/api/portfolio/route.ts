import { NextRequest, NextResponse } from 'next/server';
import { getPortfolio } from '@/lib/helius';
import { getBasePortfolio } from '@/lib/base';
import { getMonadPortfolio } from '@/lib/monad';
import { successResponse, errorResponse, validateWalletAddress } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');
  const network = searchParams.get('network') || 'solana';

  // Validate wallet parameter
  const walletError = validateWalletAddress(wallet);
  if (walletError) {
    return errorResponse(walletError, 400, { field: 'wallet' });
  }

  if (!wallet) {
    return errorResponse('Wallet address is required', 400, { field: 'wallet' });
  }

  try {
    let portfolio = null;

    // Route to appropriate chain handler
    switch (network.toLowerCase()) {
      case 'solana':
        portfolio = await getPortfolio(wallet);
        break;
      case 'base':
        if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
          return errorResponse('Invalid EVM wallet address for Base', 400, { field: 'wallet' });
        }
        portfolio = await getBasePortfolio(wallet);
        break;
      case 'monad':
        if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
          return errorResponse('Invalid EVM wallet address for Monad', 400, { field: 'wallet' });
        }
        portfolio = await getMonadPortfolio(wallet);
        break;
      default:
        return errorResponse(`Unsupported network: ${network}`, 400, { field: 'network', supported: ['solana', 'base', 'monad'] });
    }

    if (!portfolio) {
      return errorResponse(
        `Failed to fetch portfolio data from ${network}`,
        503,
        { network, wallet: wallet.slice(0, 8) + '...' }
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
