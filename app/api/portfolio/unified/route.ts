import { NextRequest, NextResponse } from 'next/server';
import { getPortfolio } from '@/lib/helius';
import { getCeloPortfolio } from '@/lib/celo';
import { getMonadPortfolio } from '@/lib/monad';
import { getBasePortfolio } from '@/lib/base';
import { successResponse, errorResponse } from '@/lib/api-utils';

// Unified portfolio: Solana + Celo + Monad + Base
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const solanaWallet = searchParams.get('solana');
  const celoWallet = searchParams.get('celo');
  const monadWallet = searchParams.get('monad');
  const baseWallet = searchParams.get('base');

  if (!solanaWallet && !celoWallet && !monadWallet && !baseWallet) {
    return errorResponse('At least one wallet required: solana=, celo=, monad=, or base=', 400);
  }

  try {
    const results: Record<string, { totalValue: number; tokens: unknown[]; lastUpdated: string }> = {};
    const promises: Promise<void>[] = [];

    if (solanaWallet) {
      promises.push((async () => {
        const solana = await getPortfolio(solanaWallet);
        if (solana) results.solana = { totalValue: solana.totalValue, tokens: solana.tokens as unknown[], lastUpdated: solana.lastUpdated };
      })());
    }

    if (celoWallet) {
      promises.push((async () => {
        const celo = await getCeloPortfolio(celoWallet);
        if (celo) results.celo = { totalValue: celo.totalValue, tokens: celo.tokens as unknown[], lastUpdated: celo.lastUpdated };
      })());
    }

    if (monadWallet) {
      promises.push((async () => {
        const monad = await getMonadPortfolio(monadWallet);
        if (monad) results.monad = { totalValue: monad.totalValue, tokens: monad.tokens as unknown[], lastUpdated: monad.lastUpdated };
      })());
    }

    if (baseWallet) {
      if (!/^0x[a-fA-F0-9]{40}$/.test(baseWallet)) {
        return errorResponse('Invalid EVM wallet address for Base', 400, { field: 'base' });
      }
      promises.push((async () => {
        const base = await getBasePortfolio(baseWallet);
        if (base) results.base = { totalValue: base.totalValue, tokens: base.tokens as unknown[], lastUpdated: base.lastUpdated };
      })());
    }

    await Promise.all(promises);

    const totalValue = Object.values(results).reduce((sum, r) => sum + r.totalValue, 0);

    return successResponse({
      ...results,
      combinedTotal: totalValue,
      chains: Object.keys(results),
    }, { type: 'unified_portfolio', supportedChains: ['solana', 'celo', 'monad', 'base'] });
  } catch (error) {
    console.error('Unified portfolio error:', error);
    return errorResponse('Failed to fetch unified portfolio', 500);
  }
}
