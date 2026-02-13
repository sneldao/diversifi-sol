import { NextResponse } from 'next/server';
import { getPortfolio } from '@/lib/helius';
import { successResponse, errorResponse, validateWalletAddress } from '@/lib/api-utils';

// Target allocation for RWA portfolio
const TARGET_ALLOCATION = {
  bSOL: 0.40,  // 40% liquid staking
  ONDO: 0.30,  // 30% US Treasury
  MP1: 0.30,   // 30% USDC stable
};

const RWA_TOKENS = ['bSOL', 'ONDO', 'MP1'];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    // Validate wallet
    const walletError = validateWalletAddress(wallet);
    if (walletError) {
      return errorResponse(walletError, 400, { field: 'wallet' });
    }

    if (!wallet) {
      return errorResponse('Wallet address is required', 400, { field: 'wallet' });
    }

    // Fetch real portfolio
    const portfolio = await getPortfolio(wallet);

    if (!portfolio) {
      return errorResponse(
        'Failed to fetch portfolio data from Helius',
        503,
        { service: 'helius', wallet: wallet.slice(0, 8) + '...' }
      );
    }

    // Analyze current allocation
    const tokens = portfolio.tokens;
    const totalValue = portfolio.totalValue;

    // Calculate current allocation for RWA tokens
    const rwaTokens = tokens.filter(t => 
      RWA_TOKENS.some(rwa => t.symbol.toUpperCase().includes(rwa))
    );

    const currentAllocation = rwaTokens.map(token => ({
      symbol: token.symbol,
      value: token.value,
      percentage: totalValue > 0 ? token.value / totalValue : 0,
    }));

    // Calculate drift from target
    const rebalancingSuggestions = rwaTokens.map(token => {
      const symbol = Object.keys(TARGET_ALLOCATION).find(
        key => token.symbol.toUpperCase().includes(key)
      );
      
      const target = symbol ? TARGET_ALLOCATION[symbol as keyof typeof TARGET_ALLOCATION] : 0;
      const current = totalValue > 0 ? token.value / totalValue : 0;
      const drift = current - target;
      const valueDiff = drift * totalValue;

      return {
        symbol: token.symbol,
        currentPercentage: Math.round(current * 100),
        targetPercentage: Math.round(target * 100),
        driftPercentage: Math.round(drift * 100),
        valueDiff: Math.round(valueDiff * 100) / 100,
        action: valueDiff > 0.01 ? 'SELL' : valueDiff < -0.01 ? 'BUY' : 'HOLD',
      };
    });

    // Sort by drift (largest rebalances first)
    rebalancingSuggestions.sort((a, b) => Math.abs(b.valueDiff) - Math.abs(a.valueDiff));

    // Generate actionable suggestions
    const suggestions = rebalancingSuggestions
      .filter(s => s.action !== 'HOLD')
      .map(s => {
        if (s.action === 'SELL') {
          return `Reduce ${s.symbol} by ${Math.abs(s.valueDiff).toFixed(2)} USDC (${Math.abs(s.driftPercentage)}% overweight)`;
        } else {
          return `Increase ${s.symbol} by ${Math.abs(s.valueDiff).toFixed(2)} USDC (${Math.abs(s.driftPercentage)}% underweight)`;
        }
      });

    // Calculate overall portfolio health
    const totalDrift = rebalancingSuggestions.reduce(
      (sum, s) => sum + Math.abs(s.driftPercentage), 0
    );
    
    const needsRebalancing = totalDrift > 5; // Rebalance if total drift > 5%

    return successResponse({
      portfolio: {
        totalValue: totalValue,
        tokenCount: tokens.length,
        lastUpdated: portfolio.lastUpdated,
      },
      allocation: {
        current: currentAllocation,
        target: TARGET_ALLOCATION,
      },
      rebalancing: {
        needsRebalancing,
        totalDrift: Math.round(totalDrift),
        suggestions,
        trades: rebalancingSuggestions.filter(s => s.action !== 'HOLD'),
      },
    });

  } catch (error) {
    console.error('[Rebalancing API] Error:', error);
    return errorResponse(
      'Internal server error',
      500,
      { component: 'rebalancing-api' }
    );
  }
}
