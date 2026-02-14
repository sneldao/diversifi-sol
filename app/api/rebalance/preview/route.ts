import { NextRequest, NextResponse } from 'next/server';
import { getPortfolio } from '@/lib/helius';
import { getCeloPortfolio, estimateGas } from '@/lib/celo';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface PreviewRequest {
  wallet: string;
  chain: 'solana' | 'celo';
  actions: Array<{
    type: 'swap' | 'send' | 'receive';
    fromToken?: string;
    toToken?: string;
    amount: number;
    toAddress?: string;
  }>;
}

// Simulate transaction outcome without executing
async function simulateTransaction(
  wallet: string,
  chain: 'solana' | 'celo',
  actions: PreviewRequest['actions']
) {
  const portfolio = chain === 'solana' 
    ? await getPortfolio(wallet) 
    : await getCeloPortfolio(wallet);

  if (!portfolio) {
    return { valid: false, error: 'Failed to fetch portfolio' };
  }

  const results: Array<{
    action: PreviewRequest['actions'][0];
    outcome: 'success' | 'failed' | 'warning';
    details: string;
    expectedBalanceChange?: { token: string; delta: number };
  }> = [];

  for (const action of actions) {
    // Check sufficient balance
    const fromToken = portfolio.tokens.find(t => 
      t.symbol.toLowerCase() === action.fromToken?.toLowerCase()
    );

    if (action.type === 'swap' && fromToken && action.amount > fromToken.balance) {
      results.push({
        action,
        outcome: 'failed',
        details: `Insufficient ${action.fromToken} balance. Have ${fromToken.balance}, need ${action.amount}`,
      });
      continue;
    }

    // Simulate gas costs
    let gasEstimate = chain === 'celo' ? 0.001 : 0.000005;
    const gasToken = chain === 'celo' ? 'CELO' : 'SOL';
    const nativeBalance = portfolio.tokens.find(t => t.symbol === gasToken);

    if (nativeBalance && nativeBalance.balance < gasEstimate) {
      results.push({
        action,
        outcome: 'warning',
        details: `Insufficient ${gasToken} for gas. Need ~${gasEstimate}, have ${nativeBalance.balance}`,
      });
      continue;
    }

    // Success outcome
    results.push({
      action,
      outcome: 'success',
      details: `Swap ${action.amount} ${action.fromToken} → ${action.toToken}`,
      expectedBalanceChange: {
        token: action.toToken || '',
        delta: action.amount * 0.997, // Assume 0.3% slippage
      },
    });
  }

  return {
    valid: results.every(r => r.outcome === 'success'),
    portfolio: {
      totalValue: portfolio.totalValue,
      tokens: portfolio.tokens.map(t => ({ symbol: t.symbol, value: t.value })),
    },
    results,
    summary: {
      totalActions: actions.length,
      successful: results.filter(r => r.outcome === 'success').length,
      failed: results.filter(r => r.outcome === 'failed').length,
      warnings: results.filter(r => r.outcome === 'warning').length,
    },
  };
}

export async function POST(request: NextRequest) {
  const body: PreviewRequest = await request.json();

  if (!body.wallet || !body.chain || !body.actions?.length) {
    return errorResponse('Missing required: wallet, chain, actions', 400);
  }

  if (!['solana', 'celo'].includes(body.chain)) {
    return errorResponse('Chain must be solana or celo', 400);
  }

  try {
    const preview = await simulateTransaction(body.wallet, body.chain, body.actions);

    if (preview.error) {
      return errorResponse(preview.error, 400);
    }

    return successResponse(preview, { type: 'transaction_preview' });
  } catch (error) {
    console.error('Preview error:', error);
    return errorResponse('Failed to simulate transaction', 500);
  }
}

// GET - Get default slippage settings
export async function GET() {
  return successResponse({
    defaultSlippage: 0.5, // 0.5%
    maxSlippage: 5, // 5%
    minBalance: {
      solana: 0.01, // Keep 0.01 SOL for gas
      celo: 0.01, // Keep 0.01 CELO for gas
    },
  });
}
