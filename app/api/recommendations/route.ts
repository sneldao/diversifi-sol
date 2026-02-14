import { NextRequest, NextResponse } from 'next/server';
import { generateRecommendations } from '@/lib/recommendations';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');
  const chain = searchParams.get('chain') as 'solana' | 'celo' || 'solana';

  if (!wallet) {
    return errorResponse('Wallet address required', 400);
  }

  try {
    const recommendations = await generateRecommendations(wallet, chain);
    return successResponse({ recommendations });
  } catch (error) {
    return errorResponse('Failed to generate recommendations', 500);
  }
}
