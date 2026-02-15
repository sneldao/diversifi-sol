import { NextRequest, NextResponse } from 'next/server';
import { getMonadPortfolio, getMonadGasPrice } from '@/lib/monad';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, targetAllocations } = body;

    if (!wallet || !targetAllocations) {
      return errorResponse('Wallet and targetAllocations required', 400);
    }

    const portfolio = await getMonadPortfolio(wallet);
    if (!portfolio) {
      return errorResponse('Failed to fetch portfolio', 503);
    }

    // Calculate rebalancing actions
    const actions: Array<{ fromToken: string; toToken: string; amount: number }> = [];
    const currentAllocations: Record<string, number> = {};
    
    for (const token of portfolio.tokens) {
      if (portfolio.totalValue > 0) {
        currentAllocations[token.symbol] = (token.value / portfolio.totalValue) * 100;
      }
    }

    for (const [symbol, targetPct] of Object.entries(targetAllocations) as [string, number][]) {
      const currentPct = currentAllocations[symbol] || 0;
      const diff = targetPct - currentPct;
      
      if (Math.abs(diff) > 5) {
        const diffValue = (diff / 100) * portfolio.totalValue;
        const overAllocated = Object.entries(currentAllocations)
          .find(([s, p]) => p > (targetAllocations[s] || 0));
        
        if (overAllocated) {
          actions.push({
            fromToken: overAllocated[0],
            toToken: symbol,
            amount: Math.abs(diffValue),
          });
        }
      }
    }

    const gasPrice = await getMonadGasPrice();

    return successResponse({
      currentPortfolio: portfolio,
      targetAllocations,
      currentAllocations,
      actions,
      gasPrice,
      requiresApproval: actions.reduce((sum, a) => sum + a.amount, 0) > 100,
    });
  } catch (error) {
    return errorResponse('Internal server error', 500);
  }
}
