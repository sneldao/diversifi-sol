import { NextRequest, NextResponse } from 'next/server';
import { getTokenPrice } from '@/lib/jupiter';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface BridgeQuote {
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken: string;
  amount: number;
  estimatedReceive: number;
  bridgeFee: number;
  networkFee: number;
  totalFee: number;
  estimatedTime: string;
  route: string[];
}

// Supported bridge routes (simplified - in production use Wormhole, Allbridge, etc.)
const BRIDGE_TOKENS: Record<string, { solana: string; celo: string }> = {
  'USDC': { solana: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', celo: '0xef4229c8c3250CEB2DfA4d4D32924a84bD1a9fC5' },
  'USDT': { solana: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', celo: '0x88eeC57223EA925d61D5d8b4aE0F18Fe6A59D4E0' },
  'ETH': { solana: 'FeGn77djgDU2HnBbtCw2qKXYmD9T2QeBVVD1XcmxJ4A', celo: '0x471EcE3750Da237f93B8E339c536989b8978a438' },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fromChain = searchParams.get('from'); // 'solana' or 'celo'
  const toChain = searchParams.get('to');
  const token = searchParams.get('token'); // 'USDC', 'USDT', 'ETH'
  const amount = parseFloat(searchParams.get('amount') || '0');

  if (!fromChain || !toChain || !token || !amount) {
    return errorResponse('Missing params: from, to, token, amount', 400);
  }

  if (!['solana', 'celo'].includes(fromChain) || !['solana', 'celo'].includes(toChain)) {
    return errorResponse('Chain must be solana or celo', 400);
  }

  if (fromChain === toChain) {
    return errorResponse('Cannot bridge to same chain', 400);
  }

  const tokenConfig = BRIDGE_TOKENS[token.toUpperCase()];
  if (!tokenConfig) {
    return errorResponse(`Token ${token} not supported. Available: USDC, USDT, ETH`, 400);
  }

  try {
    // Get prices (simplified - would fetch real prices)
    let fromPrice = 1, toPrice = 1;
    
    if (token.toUpperCase() === 'USDC' || token.toUpperCase() === 'USDT') {
      fromPrice = 1;
      toPrice = 1;
    } else if (token.toUpperCase() === 'ETH Would') {
      // fetch real ETH price
      fromPrice = 2500;
      toPrice = 2500;
    }

    // Calculate bridge quote
    const bridgeFee = amount * 0.003; // 0.3% bridge fee
    const networkFee = fromChain === 'solana' ? 0.00025 : 0.01; // SOL or CELO gas
    const totalFee = bridgeFee + networkFee;
    const estimatedReceive = amount - totalFee;

    const quote: BridgeQuote = {
      fromChain,
      toChain,
      fromToken: token,
      toToken: token,
      amount,
      estimatedReceive,
      bridgeFee,
      networkFee,
      totalFee,
      estimatedTime: '5-15 minutes',
      route: [
        `Burn ${token} on ${fromChain}`,
        'Bridge via Wormhole/Allbridge',
        `Mint ${token} on ${toChain}`,
      ],
    };

    return successResponse(quote, { type: 'bridge_quote' });
  } catch (error) {
    console.error('Bridge quote error:', error);
    return errorResponse('Failed to get bridge quote', 500);
  }
}

// POST - Execute bridge (would require signing)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { fromChain, toChain, token, amount, wallet } = body;

  if (!fromChain || !toChain || !token || !amount || !wallet) {
    return errorResponse('Missing required fields', 400);
  }

  // In production, this would:
  // 1. Create bridge transaction
  // 2. Sign with wallet
  // 3. Submit to bridge network
  // 4. Monitor for completion

  return successResponse({
    status: 'pending',
    message: 'Bridge transaction would be initiated',
    txId: `bridge_${Date.now()}`,
    estimatedTime: '5-15 minutes',
  });
}
