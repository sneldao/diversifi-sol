import { NextRequest, NextResponse } from 'next/server';
import { PREMIUM_FEATURES } from '@/lib/mpp';

// This endpoint demonstrates x402 (Payment Required) for MPP
// For Synthesis - Agent Services bounty

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const feature = searchParams.get('feature');
  const payment = searchParams.get('payment');

  // If no feature specified, return available features
  if (!feature) {
    return NextResponse.json({
      success: true,
      data: {
        message: 'DiversiFi MPP Payment Gateway',
        description: 'Premium features available via Machine Payments Protocol',
        supported_methods: ['tempo'],
        features: PREMIUM_FEATURES,
        note: 'Send payment credential in "payment" param to unlock premium features',
      },
      meta: {
        protocol: 'MPP (HTTP 402)',
        version: '1.0',
        chain: 'Tempo',
      },
    });
  }

  // Validate feature
  if (!PREMIUM_FEATURES[feature as keyof typeof PREMIUM_FEATURES]) {
    return NextResponse.json(
      {
        error: {
          message: 'Unknown feature',
          code: 'UNKNOWN_FEATURE',
          available_features: Object.keys(PREMIUM_FEATURES),
        },
      },
      { status: 400 }
    );
  }

  const featureInfo = PREMIUM_FEATURES[feature as keyof typeof PREMIUM_FEATURES];

  // If no payment provided, return 402 Payment Required
  if (!payment) {
    return NextResponse.json(
      {
        error: {
          message: 'Payment required',
          code: 'PAYMENT_REQUIRED',
          status: 402,
          methods: ['tempo'],
          amount: featureInfo.price,
          currency: 'USD',
          description: featureInfo.description,
          instructions: 'Use Tempo wallet or mppx to pay and include credential',
          doc: 'https://mpp.dev/quickstart/agent',
        },
      },
      { status: 402 }
    );
  }

  // In production: verify payment credential
  // For demo: accept any payment parameter
  if (payment && payment.length > 10) {
    // Payment verified - return premium content
    const premiumContent: Record<string, any> = {
      'advanced-signals': {
        signals: [
          { token: 'ETH', direction: 'bullish', confidence: 87, reason: 'Net inflow +$2.4M, MA cross' },
          { token: 'DEGEN', direction: 'momentum', confidence: 92, reason: 'Social spike 340%, volume surge' },
          { token: 'cbBTC', direction: 'arbitrage', confidence: 78, reason: 'CEX-DEX spread 0.4%' },
        ],
        generated_at: new Date().toISOString(),
        valid_for_seconds: 3600,
      },
      'premium-analysis': {
        portfolio_value: 12450,
        diversification_score: 82,
        risk_score: 42,
        recommendations: [
          { action: 'rebalance', reason: 'ETH at 68%, above 65% threshold', potential_yield: '+3.2% APY' },
          { action: 'stablecoin_buffer', reason: 'No stablecoin exposure', potential_yield: '+5.1% APY' },
        ],
        ai_insights: 'Portfolio well-structured. Consider adding stablecoins for volatility dampening.',
      },
      'autonomous-execution': {
        status: 'enabled',
        rules: [
          { trigger: 'ETH > 70%', action: 'swap_eth_usdc', percentage: 10 },
          { trigger: 'gas < 5 gwei', action: 'execute_pending', max_slippage: 0.5 },
          { trigger: 'yield_gap > 2%', action: 'rebalance_yield', priority: 'high' },
        ],
        last_execution: new Date(Date.now() - 3600000).toISOString(),
      },
      'api-access': {
        endpoints: [
          { path: '/api/portfolio', rate_limit: '100/hour' },
          { path: '/api/signals', rate_limit: '1000/hour' },
          { path: '/api/execute', rate_limit: '10/hour' },
        ],
        api_key: 'df_live_xxxxxxxxxxxxx',
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        feature,
        name: featureInfo.name,
        content: premiumContent[feature] || { message: 'Premium content unlocked' },
        payment_verified: true,
        receipt: {
          id: `rcpt_${Date.now()}`,
          feature,
          amount: featureInfo.price,
          currency: 'USD',
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  // Invalid payment
  return NextResponse.json(
    {
      error: {
        message: 'Invalid payment credential',
        code: 'INVALID_PAYMENT',
      },
    },
    { status: 401 }
  );
}
