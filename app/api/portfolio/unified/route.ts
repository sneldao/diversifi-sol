import { NextRequest, NextResponse } from 'next/server';
import { getPortfolio } from '@/lib/helius';
import { getCeloPortfolio } from '@/lib/celo';
import { successResponse, errorResponse } from '@/lib/api-utils';

// Unified portfolio that aggregates both Solana and Celo
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const solanaWallet = searchParams.get('solana');
  const celoWallet = searchParams.get('celo');

  if (!solanaWallet && !celoWallet) {
    return errorResponse('At least one wallet required: solana= or celo=', 400);
  }

  try {
    const results: {
      solana?: {
        totalValue: number;
        tokens: unknown[];
        lastUpdated: string;
      };
      celo?: {
        totalValue: number;
        tokens: unknown[];
        lastUpdated: string;
      };
    } = {};

    // Fetch both in parallel
    const promises: Promise<void>[] = [];

    if (solanaWallet) {
      promises.push(
        (async () => {
          const solana = await getPortfolio(solanaWallet);
          if (solana) {
            results.solana = {
              totalValue: solana.totalValue,
              tokens: solana.tokens,
              lastUpdated: solana.lastUpdated,
            };
          }
        })()
      );
    }

    if (celoWallet) {
      promises.push(
        (async () => {
          const celo = await getCeloPortfolio(celoWallet);
          if (celo) {
            results.celo = {
              totalValue: celo.totalValue,
              tokens: celo.tokens,
              lastUpdated: celo.lastUpdated,
            };
          }
        })()
      );
    }

    await Promise.all(promises);

    // Calculate combined value
    const totalValue = (results.solana?.totalValue || 0) + (results.celo?.totalValue || 0);

    return successResponse({
      ...results,
      combinedTotal: totalValue,
      chains: Object.keys(results),
    }, { type: 'unified_portfolio' });
  } catch (error) {
    console.error('Unified portfolio error:', error);
    return errorResponse('Failed to fetch unified portfolio', 500);
  }
}
