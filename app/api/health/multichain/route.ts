import { NextRequest, NextResponse } from 'next/server';
import { getPortfolio } from '@/lib/helius';
import { getCeloPortfolio, getCeloBlockNumber } from '@/lib/celo';
import { successResponse, errorResponse } from '@/lib/api-utils';

// Health check for both Solana and Celo
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const solanaWallet = searchParams.get('solana');
  const celoWallet = searchParams.get('celo');

  const results: {
    solana?: {
      status: 'healthy' | 'degraded' | 'down';
      blockNumber?: number;
      portfolio?: { totalValue: number; tokenCount: number };
      error?: string;
    };
    celo?: {
      status: 'healthy' | 'degraded' | 'down';
      blockNumber?: number;
      portfolio?: { totalValue: number; tokenCount: number };
      error?: string;
    };
    overall: 'healthy' | 'degraded' | 'down';
  } = { overall: 'healthy' };

  // Check Solana
  if (solanaWallet) {
    try {
      const portfolio = await getPortfolio(solanaWallet);
      results.solana = {
        status: portfolio ? 'healthy' : 'degraded',
        portfolio: portfolio ? {
          totalValue: portfolio.totalValue,
          tokenCount: portfolio.tokens.length,
        } : undefined,
      };
    } catch (error) {
      results.solana = {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      results.overall = 'degraded';
    }
  }

  // Check Celo
  if (celoWallet) {
    try {
      const [portfolio, blockNumber] = await Promise.all([
        getCeloPortfolio(celoWallet),
        getCeloBlockNumber().catch(() => 0),
      ]);
      results.celo = {
        status: portfolio ? 'healthy' : 'degraded',
        blockNumber,
        portfolio: portfolio ? {
          totalValue: portfolio.totalValue,
          tokenCount: portfolio.tokens.length,
        } : undefined,
      };
    } catch (error) {
      results.celo = {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      results.overall = 'degraded';
    }
  }

  // If both are down
  if ((solanaWallet && results.solana?.status === 'down') && 
      (celoWallet && results.celo?.status === 'down')) {
    results.overall = 'down';
  }

  const statusCode = results.overall === 'healthy' ? 200 : results.overall === 'degraded' ? 200 : 503;
  
  return NextResponse.json({
    success: results.overall !== 'down',
    ...results,
    timestamp: new Date().toISOString(),
  }, { status: statusCode });
}
