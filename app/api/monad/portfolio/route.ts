import { NextRequest, NextResponse } from 'next/server';
import { getMonadPortfolio } from '@/lib/monad';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return errorResponse('Wallet address required', 400);
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return errorResponse('Invalid Monad address format', 400);
  }

  try {
    const portfolio = await getMonadPortfolio(wallet);
    if (!portfolio) {
      return errorResponse('Failed to fetch Monad portfolio', 503);
    }

    return successResponse(portfolio, {
      network: 'monad',
      chainId: 143,
      description: 'Monad Mainnet - High-performance EVM',
    });
  } catch (error) {
    console.error('Monad Portfolio error:', error);
    return errorResponse('Internal server error', 500);
  }
}
