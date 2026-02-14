import { NextRequest, NextResponse } from 'next/server';
import { getCeloPortfolio } from '@/lib/celo';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return errorResponse('Wallet address is required', 400, { field: 'wallet' });
  }

  // Validate Celo address format (Ethereum-style: 0x...)
  if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return errorResponse(
      'Invalid Celo address format. Expected: 0x followed by 40 hex characters',
      400,
      { field: 'wallet', hint: 'Example: 0x1234567890abcdef1234567890abcdef12345678' }
    );
  }

  try {
    const portfolio = await getCeloPortfolio(wallet);

    if (!portfolio) {
      return errorResponse(
        'Failed to fetch Celo portfolio data',
        503,
        { service: 'celo-rpc', wallet: wallet.slice(0, 10) + '...' }
      );
    }

    return successResponse(portfolio, {
      network: 'celo',
      chainId: 42220,
      description: 'Celo Mainnet - Mobile-first blockchain for financial inclusion',
    });
  } catch (error) {
    console.error('Celo Portfolio API error:', error);
    return errorResponse(
      'Internal server error',
      500,
      { component: 'celo-portfolio-route' }
    );
  }
}
