import { NextResponse } from 'next/server';
import { getYieldOpportunities } from '@/lib/jupiter';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET() {
  try {
    // Server-side only - API keys are protected
    const yields = await getYieldOpportunities();

    // Sort by APY descending
    yields.sort((a, b) => b.apy - a.apy);

    return successResponse({ opportunities: yields });
  } catch (error) {
    console.error('Yields API error:', error);
    return errorResponse(
      'Failed to fetch yield opportunities',
      500,
      { component: 'yields-route' }
    );
  }
}
