import { NextRequest, NextResponse } from 'next/server';

// Agent-friendly portfolio data endpoint
// Returns structured JSON optimized for AI agent consumption

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet') || 'demo';
  const format = searchParams.get('format') || 'json';

  try {
    // Fetch portfolio data (in production, this would call Helius/Birdeye)
    const portfolioData = {
      status: 'success',
      timestamp: new Date().toISOString(),
      wallet: wallet,
      data: {
        totalValue: 12458.92,
        currency: 'USD',
        tokens: [
          { symbol: 'USDC', balance: 5234.56, value: 5234.56, price: 1.0, allocation: 0.42 },
          { symbol: 'SOL', balance: 145.23, value: 14298.50, price: 98.45, allocation: 0.45 },
          { symbol: 'MSOL', balance: 32.45, value: 3859.00, price: 118.92, allocation: 0.12 },
        ],
        healthScore: 72,
        bestApy: 24.5,
        apyProtocol: 'Raydium',
        risks: [
          { type: 'concentration', severity: 'medium', message: '45% in SOL' },
          { type: 'volatility', severity: 'low', message: 'Portfolio variance within acceptable range' },
        ],
      },
      metadata: {
        guardianId: `GRD-${wallet.slice(0, 8).toUpperCase()}`,
        deployedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
      },
    };

    // Return structured data for agents
    if (format === 'agent') {
      return NextResponse.json({
        ...portfolioData,
        actions: [
          {
            action: 'rebalance',
            description: 'Reduce SOL concentration by 15%',
            expectedImpact: 'improves health score by 8 points',
          },
          {
            action: 'yield_optimize',
            description: 'Move 50% of USDC to Tulip Protocol',
            expectedImpact: 'increase APY from 0% to 15.7%',
          },
        ],
        recommendations: [
          'Consider adding more stablecoin exposure',
          'Review MSOL staking rewards',
          'Monitor BONK volatility',
        ],
      });
    }

    return NextResponse.json(portfolioData);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch portfolio data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
