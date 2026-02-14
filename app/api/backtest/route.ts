import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

// Historical price data (mock - in production use CoinGecko/Coingecko API)
const historicalPrices: Record<string, Record<string, number>> = {
  '2024-01': { SOL: 95, USDC: 1, bSOL: 100, ONDO: 1.2, cUSD: 1, CELO: 0.75 },
  '2024-02': { SOL: 105, USDC: 1, bSOL: 112, ONDO: 1.5, cUSD: 1, CELO: 0.85 },
  '2024-03': { SOL: 125, USDC: 1, bSOL: 135, ONDO: 2.1, cUSD: 1, CELO: 0.92 },
  '2024-04': { SOL: 145, USDC: 1, bSOL: 158, ONDO: 2.8, cUSD: 1, CELO: 0.88 },
  '2024-05': { SOL: 138, USDC: 1, bSOL: 150, ONDO: 2.4, cUSD: 1, CELO: 0.78 },
  '2024-06': { SOL: 155, USDC: 1, bSOL: 170, ONDO: 3.2, cUSD: 1, CELO: 0.82 },
  '2024-07': { SOL: 175, USDC: 1, bSOL: 192, ONDO: 4.1, cUSD: 1, CELO: 0.75 },
  '2024-08': { SOL: 165, USDC: 1, bSOL: 180, ONDO: 3.5, cUSD: 1, CELO: 0.68 },
  '2024-09': { SOL: 145, USDC: 1, bSOL: 158, ONDO: 2.9, cUSD: 1, CELO: 0.62 },
  '2024-10': { SOL: 168, USDC: 1, bSOL: 185, ONDO: 3.8, cUSD: 1, CELO: 0.71 },
  '2024-11': { SOL: 195, USDC: 1, bSOL: 215, ONDO: 4.5, cUSD: 1, CELO: 0.78 },
  '2024-12': { SOL: 210, USDC: 1, bSOL: 232, ONDO: 5.2, cUSD: 1, CELO: 0.85 },
};

interface BacktestResult {
  strategy: string;
  initialValue: number;
  finalValue: number;
  totalReturn: number;
  annualReturn: number;
  maxDrawdown: number;
  volatility: number;
  sharpeRatio: number;
  monthlyData: Array<{ month: string; value: number; return: number }>;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const strategy = searchParams.get('strategy') || 'balanced';
  const initialAmount = parseFloat(searchParams.get('initial') || '10000');

  // Simulate different strategies
  const strategies: Record<string, number[]> = {
    'aggressive': [0.6, 0.2, 0.1, 0.1], // 60% alts, 20% stable, 10% stable, 10% gas
    'balanced': [0.4, 0.3, 0.2, 0.1],   // 40% alts, 30% stable, 20% stable, 10% gas
    'conservative': [0.2, 0.5, 0.25, 0.05], // 20% alts, 50% stable, 25% stable, 5% gas
    'solana-only': [0.85, 0.1, 0.05, 0],    // 85% SOL, 10% stable, 5% stable
    'celo-only': [0, 0.6, 0.35, 0.05],       // 60% CELO, 35% cUSD, 5% gas
  };

  const allocation = strategies[strategy] || strategies.balanced;
  const months = Object.keys(historicalPrices);
  
  let portfolioValue = initialAmount;
  let peakValue = initialAmount;
  let maxDrawdown = 0;
  const monthlyData: Array<{ month: string; value: number; return: number }> = [];
  const returns: number[] = [];

  for (let i = 1; i < months.length; i++) {
    const prevMonth = months[i - 1];
    const currMonth = months[i];
    
    // Calculate portfolio value change
    const solChange = (historicalPrices[currMonth].SOL - historicalPrices[prevMonth].SOL) / historicalPrices[prevMonth].SOL;
    const stableChange = 0; // Stablecoins don't change
    const bsolChange = (historicalPrices[currMonth].bSOL - historicalPrices[prevMonth].bSOL) / historicalPrices[prevMonth].bSOL;
    const celoChange = (historicalPrices[currMonth].CELO - historicalPrices[prevMonth].CELO) / historicalPrices[prevMonth].CELO;

    const monthReturn = 
      allocation[0] * solChange +
      allocation[1] * stableChange +
      allocation[2] * bsolChange +
      allocation[3] * celoChange;

    const newValue = portfolioValue * (1 + monthReturn);
    returns.push(monthReturn);

    portfolioValue = newValue;
    peakValue = Math.max(peakValue, newValue);
    const drawdown = (peakValue - newValue) / peakValue;
    maxDrawdown = Math.max(maxDrawdown, drawdown);

    monthlyData.push({
      month: currMonth,
      value: Math.round(portfolioValue * 100) / 100,
      return: Math.round(monthReturn * 10000) / 100,
    });
  }

  // Calculate metrics
  const totalReturn = ((portfolioValue - initialAmount) / initialAmount) * 100;
  const annualReturn = totalReturn / (months.length / 12);
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);
  const volatility = stdDev * Math.sqrt(12) * 100;
  const sharpeRatio = (annualReturn - 5) / volatility; // Assume 5% risk-free rate

  const result: BacktestResult = {
    strategy,
    initialValue: initialAmount,
    finalValue: Math.round(portfolioValue * 100) / 100,
    totalReturn: Math.round(totalReturn * 100) / 100,
    annualReturn: Math.round(annualReturn * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 10000) / 100,
    volatility: Math.round(volatility * 100) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    monthlyData,
  };

  return successResponse(result);
}
