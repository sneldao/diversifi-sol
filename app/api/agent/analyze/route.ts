import { NextRequest, NextResponse } from 'next/server';
import { handlePremiumAnalysis, handleFreeAnalysis } from '@/lib/mpp-server';

// DiversiFi AI Agent - Pay-per-query portfolio knowledge base
// Uses MPP (Machine Payments Protocol) for agent payments

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet') || '';
  const chain = searchParams.get('chain') || 'base';
  const tier = searchParams.get('tier') || 'free';

  // Validate wallet
  if (!wallet) {
    return NextResponse.json(
      { error: 'wallet parameter required' },
      { status: 400 }
    );
  }

  // Free tier - no payment required
  if (tier === 'free') {
    const result = await handleFreeAnalysis(wallet, chain);
    return NextResponse.json(result);
  }

  // Premium tier - requires payment (MPP x402)
  if (tier === 'premium') {
    // Create a proper Request object for mppx
    const req = new Request(request.url, {
      method: 'GET',
      headers: Object.fromEntries(request.headers.entries()),
    });

    const result = await handlePremiumAnalysis(req);
    return result;
  }

  return NextResponse.json(
    { error: 'Invalid tier. Use free or premium' },
    { status: 400 }
  );
}

// Pricing info endpoint
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  if (action === 'prices') {
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
              'Yield optimization suggestions',
            ],
          },
        },
        acceptedPayments: ['Tempo (testnet)', 'Stripe (coming soon)'],
        mpp: {
          protocol: 'HTTP 402',
          paymentMethod: 'Tempo stablecoins',
        },
      },
    });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
