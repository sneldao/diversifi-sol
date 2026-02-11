import { NextResponse } from 'next/server';
import { getPortfolio } from '@/lib/helius';
import { successResponse, errorResponse, validateWalletAddress } from '@/lib/api-utils';

// Logging configuration
const logLevel = process.env.LOG_LEVEL || 'info';

function log(level: string, message: string, data?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data }),
  };
  
  switch (level) {
    case 'error':
      console.error(JSON.stringify(logEntry));
      break;
    case 'warn':
      console.warn(JSON.stringify(logEntry));
      break;
    case 'debug':
      if (logLevel === 'debug') {
        console.debug(JSON.stringify(logEntry));
      }
      break;
    default:
      console.log(JSON.stringify(logEntry));
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  // Validate wallet parameter
  const walletError = validateWalletAddress(wallet);
  if (walletError) {
    log('warn', 'Invalid wallet address', { wallet: wallet?.slice(0, 8) });
    return errorResponse(walletError, 400, { field: 'wallet' });
  }

  if (!wallet) {
    return errorResponse('Wallet address is required', 400, { field: 'wallet' });
  }

  try {
    log('info', 'Fetching portfolio for health check', { wallet: wallet.slice(0, 8) });
    
    const portfolio = await getPortfolio(wallet);

    if (!portfolio) {
      log('warn', 'Helius returned null portfolio', { wallet: wallet.slice(0, 8) });
      return errorResponse(
        'Failed to fetch portfolio data from Helius',
        503,
        { service: 'helius' }
      );
    }

    // Calculate health score based on:
    // 1. Diversification (token count and distribution)
    // 2. Liquidity (percentage in stablecoins)
    // 3. Concentration (largest position size)

    const tokens = portfolio.tokens;
    const totalValue = portfolio.totalValue;

    // Calculate diversification score (0-100)
    const topTokens = tokens.slice(0, 5);
    const concentration = topTokens.reduce((sum, t) => sum + t.value, 0) / totalValue;
    const diversificationScore = Math.max(0, 100 - (concentration * 100 - 30) * 2);

    // Calculate liquidity score (stablecoin ratio)
    const stablecoins = ['USDC', 'USDT', 'DAI', 'USDD'];
    const stablecoinValue = tokens
      .filter(t => stablecoins.some(s => t.symbol.toUpperCase().includes(s)))
      .reduce((sum, t) => sum + t.value, 0);
    const liquidityScore = (stablecoinValue / totalValue) * 100;

    // Calculate overall health score
    const healthScore = Math.round(
      diversificationScore * 0.4 + 
      liquidityScore * 0.4 + 
      (100 - Math.min(concentration * 100, 100)) * 0.2
    );

    // Generate insights
    const insights: string[] = [];
    
    if (healthScore < 50) {
      insights.push('⚠️ Consider diversifying your portfolio across more assets');
    } else if (healthScore < 75) {
      insights.push('👍 Good diversification, but room for improvement');
    } else {
      insights.push('✨ Excellent portfolio diversification!');
    }

    if (stablecoinValue / totalValue < 0.2) {
      insights.push('💧 Low stablecoin allocation - consider adding some stable yield options');
    }

    if (concentration > 0.8) {
      insights.push('🎯 High concentration in top assets - consider rebalancing');
    }

    log('info', 'Health check completed', { 
      wallet: wallet.slice(0, 8), 
      score: healthScore 
    });

    return successResponse({
      score: Math.min(100, Math.max(0, healthScore)),
      diversificationScore: Math.round(diversificationScore),
      liquidityScore: Math.round(liquidityScore),
      concentrationScore: Math.round(100 - concentration * 100),
      insights,
    });
  } catch (error) {
    log('error', 'Health check failed', { 
      wallet: wallet?.slice(0, 8),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return errorResponse(
      'Internal server error',
      500,
      { component: 'health-route' }
    );
  }
}
