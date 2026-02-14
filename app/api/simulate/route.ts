import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface Scenario {
  name: string;
  description: string;
  impact: {
    portfolioChange: number;
    riskChange: number;
    yieldChange: number;
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const portfolioValue = parseFloat(searchParams.get('value') || '10000');

  // Generate hypothetical scenarios
  const scenarios: Scenario[] = [
    {
      name: 'Bull Market +20%',
      description: '20% appreciation across all assets',
      impact: { portfolioChange: 20, riskChange: 10, yieldChange: 5 },
    },
    {
      name: 'Bear Market -30%',
      description: '30% market downturn',
      impact: { portfolioChange: -30, riskChange: 30, yieldChange: -10 },
    },
    {
      name: 'Stablecoin Shift',
      description: 'Move 50% to stablecoins',
      impact: { portfolioChange: 2, riskChange: -40, yieldChange: -15 },
    },
    {
      name: 'Aggressive DeFi',
      description: 'Move 40% to yield farming',
      impact: { portfolioChange: 15, riskChange: 25, yieldChange: 20 },
    },
    {
      name: 'Cross-Chain Bridge',
      description: 'Bridge 30% to Celo',
      impact: { portfolioChange: 5, riskChange: -15, yieldChange: 10 },
    },
    {
      name: 'Staking Rewards',
      description: 'Stake all SOL to bSOL',
      impact: { portfolioChange: 7, riskChange: 5, yieldChange: 12 },
    },
  ];

  const results = scenarios.map(scenario => ({
    ...scenario,
    projectedValue: Math.round(portfolioValue * (1 + scenario.impact.portfolioChange / 100)),
    riskLevel: scenario.impact.riskChange > 20 ? 'high' : scenario.impact.riskChange > 10 ? 'medium' : 'low',
  }));

  return successResponse({
    currentValue: portfolioValue,
    scenarios: results,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { currentAllocations, targetAllocations, amount } = body;

  if (!currentAllocations || !targetAllocations) {
    return errorResponse('Current and target allocations required', 400);
  }

  // Simulate the transition
  const changes: Array<{ token: string; from: number; to: number; amount: number }> = [];

  for (const [token, target] of Object.entries(targetAllocations)) {
    const current = currentAllocations[token] || 0;
    const diff = target - current;
    
    if (Math.abs(diff) > 1) {
      changes.push({
        token,
        from: current,
        to: target,
        amount: amount ? (diff / 100) * amount : 0,
      });
    }
  }

  return successResponse({
    changes,
    summary: `${changes.length} token adjustments needed`,
    estimatedTime: changes.length > 3 ? '~10 minutes' : '~2 minutes',
    gasEstimate: changes.length * 0.001,
  });
}
