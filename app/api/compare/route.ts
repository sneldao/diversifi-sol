import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface PortfolioMetrics {
  totalValue: number;
  diversification: number;
  stability: number;
  yieldPotential: number;
  riskScore: number;
}

function calculateMetrics(tokens: Array<{ symbol: string; value: number; balance: number }>): PortfolioMetrics {
  const total = tokens.reduce((sum, t) => sum + t.value, 0);
  if (total === 0) {
    return { totalValue: 0, diversification: 0, stability: 0, yieldPotential: 0, riskScore: 100 };
  }

  // Diversification: more tokens = better (max at 5+)
  const tokenCount = tokens.length;
  const diversification = Math.min(100, tokenCount * 20);

  // Stability: stablecoin ratio
  const stablecoins = tokens.filter(t => ['USDC', 'USDT', 'cUSD', 'DAI'].some(s => t.symbol.includes(s)));
  const stableRatio = stablecoins.reduce((sum, t) => sum + t.value, 0) / total;
  const stability = Math.round(stableRatio * 100);

  // Yield potential: based on non-stable allocation
  const yieldPotential = Math.round((1 - stableRatio) * 80);

  // Risk: inverse of diversification + concentration
  const sorted = [...tokens].sort((a, b) => b.value - a.value);
  const concentration = sorted[0]?.value / total || 1;
  const riskScore = Math.round(100 - (diversification * 0.5 + (1 - concentration) * 50));

  return { totalValue: total, diversification, stability, yieldPotential, riskScore };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet1 = searchParams.get('wallet1');
  const wallet2 = searchParams.get('wallet2');
  const chain = searchParams.get('chain') || 'solana';

  if (!wallet1 || !wallet2) {
    return errorResponse('Two wallet addresses required: wallet1, wallet2', 400);
  }

  // Mock portfolios (in production, fetch from RPC)
  const portfolio1Tokens = [
    { symbol: 'SOL', value: 5000, balance: 50 },
    { symbol: 'USDC', value: 3000, balance: 3000 },
    { symbol: 'bSOL', value: 2000, balance: 18 },
  ];

  const portfolio2Tokens = [
    { symbol: 'SOL', value: 8000, balance: 80 },
    { symbol: 'USDC', value: 1000, balance: 1000 },
    { symbol: 'ONDO', value: 500, balance: 200 },
    { symbol: 'MP1', value: 500, balance: 500 },
  ];

  const metrics1 = calculateMetrics(portfolio1Tokens);
  const metrics2 = calculateMetrics(portfolio2Tokens);

  const comparison = {
    portfolio1: { wallet: wallet1, metrics: metrics1 },
    portfolio2: { wallet: wallet2, metrics: metrics2 },
    winner: metrics1.diversification > metrics2.diversification ? 'portfolio1' : 'portfolio2',
    insights: [
      metrics1.diversification > metrics2.diversification 
        ? `${wallet1.slice(0,6)} has better diversification`
        : `${wallet2.slice(0,6)} has better diversification`,
      metrics1.stability > metrics2.stability
        ? `${wallet1.slice(0,6)} has more stablecoins`
        : `${wallet2.slice(0,6)} has more stablecoins`,
    ],
  };

  return successResponse(comparison);
}
