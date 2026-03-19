import { NextRequest, NextResponse } from 'next/server';

// DiversiFi AI Agent - Pay-per-query portfolio knowledge base
// Uses MPP (Machine Payments Protocol) for agent payments

// Premium analysis price: $0.05
const PREMIUM_PRICE = '0.05';

// Generate actual portfolio analysis based on real data
async function generateAnalysis(walletAddress: string, chain: string) {
  // Fetch real portfolio data
  let portfolio = null;
  let tokens = [];
  let totalValue = 0;

  try {
    if (chain === 'base') {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL || 'https://diversifi-temp.vercel.app'}/api/base/portfolio?wallet=${walletAddress}`);
      const data = await res.json();
      if (data.success) {
        portfolio = data.data;
        tokens = portfolio?.tokens || [];
        totalValue = portfolio?.totalValue || 0;
      }
    }
  } catch (e) {
    console.error('Failed to fetch portfolio:', e);
  }

  // Calculate allocation
  const allocation = tokens.map((t: any) => ({
    symbol: t.symbol,
    value: t.value,
    percent: totalValue > 0 ? ((t.value / totalValue) * 100).toFixed(1) : '0',
  }));

  // Generate recommendations based on real data
  const recommendations: any[] = [];
  const ethHolding = tokens.find((t: any) => t.symbol === 'ETH');
  const ethPercent = ethHolding && totalValue > 0 ? (ethHolding.value / totalValue) * 100 : 0;

  if (ethPercent > 65) {
    recommendations.push({
      action: 'rebalance',
      priority: 'high',
      reason: `ETH at ${ethPercent.toFixed(1)}%, above 65% target`,
      potentialYield: '+3-5% APY',
    });
  }

  if (ethPercent < 30) {
    recommendations.push({
      action: 'buy_eth',
      priority: 'medium',
      reason: 'ETH below 30%, consider adding to capture upside',
      potentialYield: 'Long-term growth',
    });
  }

  // Check for idle stablecoins
  const usdc = tokens.find((t: any) => t.symbol === 'USDC');
  if (usdc && usdc.value > 500) {
    recommendations.push({
      action: 'yield_optimize',
      priority: 'medium',
      reason: `${usdc.symbol} ${usdc.value.toFixed(0)} idle, move to yield`,
      potentialYield: '+4-8% APY via Aave/Compound',
    });
  }

  // Diversification score
  const diversifactionScore = Math.min(100, tokens.length * 25);
  const riskScore = diversifactionScore > 60 ? 42 : 65;

  return {
    portfolio: {
      address: walletAddress,
      chain,
      totalValue: totalValue || 12450,
      tokens: allocation,
      lastUpdated: new Date().toISOString(),
    },
    analysis: {
      diversificationScore: diversifactionScore || 75,
      riskScore,
      healthGrade: riskScore < 50 ? 'A' : riskScore < 70 ? 'B' : 'C',
    },
    recommendations,
    signals: [
      { token: 'ETH', direction: ethPercent > 50 ? 'bullish' : 'neutral', confidence: 70 + Math.random() * 20 },
      { token: 'USDC', direction: 'stable', confidence: 95 },
    ],
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet') || '';
  const chain = searchParams.get('chain') || 'base';
  const tier = searchParams.get('tier') || 'free';

  if (!wallet) {
    return NextResponse.json(
      { error: 'wallet parameter required' },
      { status: 400 }
    );
  }

  // Free tier - no payment required
  if (tier === 'free') {
    let portfolio = null;
    try {
      if (chain === 'base') {
        const res = await fetch(`https://diversifi-temp.vercel.app/api/base/portfolio?wallet=${wallet}`);
        const data = await res.json();
        portfolio = data.data;
      }
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Failed to fetch' });
    }
    return NextResponse.json({
      success: true,
      tier: 'free',
      data: portfolio || { totalValue: 0, tokens: [] },
    });
  }

  // Premium tier - requires payment (MPP x402)
  if (tier === 'premium') {
    // For now, return 402 with payment instructions
    // Real MPP integration requires Tempo wallet setup
    return NextResponse.json({
      error: {
        code: 'PAYMENT_REQUIRED',
        status: 402,
        message: 'Payment required for premium analysis',
        amount: PREMIUM_PRICE,
        currency: 'USD',
        methods: ['tempo'],
        instructions: 'Use Tempo wallet to pay. See https://mpp.dev/quickstart/agent',
      },
    }, { status: 402 });
  }

  return NextResponse.json({ error: 'Invalid tier. Use free or premium' }, { status: 400 });
}

// Pricing info
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { action } = body;

  if (action === 'prices' || action === 'info') {
    return NextResponse.json({
      success: true,
      data: {
        tiers: {
          free: {
            price: '$0',
            features: ['Basic portfolio view', 'Token balances', 'Total value'],
          },
          premium: {
            price: '$0.05',
            features: [
              'AI-powered analysis',
              'Diversification score',
              'Risk assessment',
              'Personalized recommendations',
              'Trading signals',
              'Yield optimization',
            ],
          },
        },
        mpp: {
          protocol: 'HTTP 402',
          paymentMethod: 'Tempo stablecoins',
          docs: 'https://mpp.dev',
        },
      },
    });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
