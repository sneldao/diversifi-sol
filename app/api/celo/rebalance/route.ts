import { NextRequest, NextResponse } from 'next/server';
import { getCeloPortfolio, estimateGas, getCeloGasPrice } from '@/lib/celo';
import { registerAgent, getCrossBorderQuote, initiateMobileMoneyWithdrawal } from '@/lib/erc8004';
import { successResponse, errorResponse, validateApiKey } from '@/lib/api-utils';

interface RebalanceRequest {
  wallet: string;
  targetAllocations: Record<string, number>; // token symbol -> percentage
  agentName?: string;
  agentCapabilities?: string[];
  mobileMoneyWithdrawal?: {
    provider: string;
    phoneNumber: string;
    amount: number;
  };
}

// Validate rebalance request
function validateRebalanceRequest(body: RebalanceRequest): string | null {
  if (!body.wallet) return 'Wallet address is required';
  if (!/^0x[a-fA-F0-9]{40}$/.test(body.wallet)) return 'Invalid wallet address';
  if (!body.targetAllocations) return 'Target allocations required';
  
  // Validate allocations sum to 100%
  const total = Object.values(body.targetAllocations).reduce((sum, pct) => sum + pct, 0);
  if (Math.abs(total - 100) > 0.1) {
    return 'Allocations must sum to 100%';
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body: RebalanceRequest = await request.json();
    
    // Validate request
    const validationError = validateRebalanceRequest(body);
    if (validationError) {
      return errorResponse(validationError, 400);
    }

    const { wallet, targetAllocations, agentName, mobileMoneyWithdrawal } = body;

    // Register agent if provided
    let agentId: string | undefined;
    if (agentName) {
      const agent = await registerAgent(
        agentName,
        'DiversiFi autonomous wealth guardian',
        ['portfolio_management', 'rebalancing', 'mobile_money', 'cross_border']
      );
      agentId = agent.agentId;
    }

    // Get current portfolio
    const portfolio = await getCeloPortfolio(wallet);
    if (!portfolio) {
      return errorResponse('Failed to fetch current portfolio', 503);
    }

    // Calculate rebalancing actions
    const actions: Array<{
      type: 'swap' | 'mobile_money';
      fromToken: string;
      toToken: string;
      amount: number;
      estimatedValue: number;
      gasEstimate?: number;
    }> = [];

    // Calculate current vs target allocations
    const currentAllocations: Record<string, number> = {};
    for (const token of portfolio.tokens) {
      if (portfolio.totalValue > 0) {
        currentAllocations[token.symbol] = (token.value / portfolio.totalValue) * 100;
      }
    }

    // Determine required swaps
    for (const [symbol, targetPct] of Object.entries(targetAllocations) as [string, number][]) {
      const currentPct = currentAllocations[symbol] || 0;
      const diff = targetPct - currentPct;
      
      if (Math.abs(diff) < 1) continue; // Skip minor adjustments
      
      const diffValue = (diff / 100) * portfolio.totalValue;
      
      if (diff > 0) {
        // Need to buy this token
        // Find token to sell from (largest over-allocated)
        const overAllocated = Object.entries(currentAllocations)
          .filter(([s, p]) => {
            const t = Object.entries(targetAllocations).find(([ts]) => ts === s);
            return t && p > (t[1] || 0);
          })
          .sort((a, b) => b[1] - a[1]);
        
        if (overAllocated.length > 0) {
          actions.push({
            type: 'swap',
            fromToken: overAllocated[0][0],
            toToken: symbol,
            amount: Math.abs(diffValue),
            estimatedValue: Math.abs(diffValue),
          });
        }
      }
    }

    // Handle mobile money withdrawal if requested
    if (mobileMoneyWithdrawal) {
      const { provider, phoneNumber, amount } = mobileMoneyWithdrawal;
      
      // Get cross-border quote
      const quote = await getCrossBorderQuote('USD', 'KES', amount);
      
      // Initiate withdrawal
      const txn = await initiateMobileMoneyWithdrawal(
        agentId || 'diversifi-agent',
        provider,
        phoneNumber,
        amount
      );
      
      actions.push({
        type: 'mobile_money',
        fromToken: 'cUSD',
        toToken: `${provider} (${phoneNumber})`,
        amount: quote.total,
        estimatedValue: amount,
      });
    }

    // Estimate gas for swaps
    const gasPrice = await getCeloGasPrice();

    // Build response
    const rebalancePlan = {
      currentPortfolio: portfolio,
      targetAllocations,
      currentAllocations,
      actions,
      agentId,
      gasPrice: gasPrice.gasPrice,
      estimatedGasCost: '0.001', // CELO estimate
      requiresApproval: actions.reduce((sum, a) => sum + a.estimatedValue, 0) > 100,
      message: actions.length === 0 
        ? 'Portfolio already balanced within threshold'
        : `${actions.length} action(s) required to rebalance`,
    };

    return successResponse(rebalancePlan, {
      type: 'rebalance_plan',
      maxTransactionValue: actions.reduce((sum, a) => sum + a.estimatedValue, 0),
    });

  } catch (error) {
    console.error('Celo Rebalance API error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// GET endpoint for rebalance quotes
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const amount = searchParams.get('amount');

  if (!from || !to || !amount) {
    return errorResponse('Missing required params: from, to, amount', 400);
  }

  try {
    const quote = await getCrossBorderQuote(from, to, parseFloat(amount));
    return successResponse(quote);
  } catch (error) {
    return errorResponse('Failed to get quote', 500);
  }
}
