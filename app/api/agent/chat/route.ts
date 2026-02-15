import { NextRequest, NextResponse } from 'next/server';
import { getPortfolio } from '@/lib/helius';
import { getCeloPortfolio } from '@/lib/celo';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Simple intent detection (in production, use LLM)
function detectIntent(message: string): { intent: string; entities: Record<string, string> } {
  const lower = message.toLowerCase();
  const entities: Record<string, string> = {};

  // Detect chains
  if (lower.includes('solana') || lower.includes('sol')) entities.chain = 'solana';
  if (lower.includes('celo')) entities.chain = 'celo';
  if (lower.includes('both') || lower.includes('all')) entities.chain = 'both';

  // Detect intents
  if (lower.includes('portfolio') || lower.includes('balance') || lower.includes('hold')) {
    entities.intent = 'portfolio';
  } else if (lower.includes('rebalance') || lower.includes('adjust')) {
    entities.intent = 'rebalance';
  } else if (lower.includes('price') || lower.includes('worth') || lower.includes('value')) {
    entities.intent = 'price';
  } else if (lower.includes('swap') || lower.includes('trade') || lower.includes('buy')) {
    entities.intent = 'swap';
  } else if (lower.includes('alert') || lower.includes('notify')) {
    entities.intent = 'alert';
  } else if (lower.includes('bridge') || lower.includes('transfer')) {
    entities.intent = 'bridge';
  } else {
    entities.intent = 'general';
  }

  return { intent: entities.intent, entities };
}

function generateResponse(intent: string, entities: Record<string, string>, portfolio?: {
  totalValue: number;
  tokens: Array<{ symbol: string; value: number; balance: number }>;
}): string {
  switch (intent) {
    case 'portfolio':
      if (!portfolio) return 'Please provide a wallet address to check portfolio.';
      const tokens = portfolio.tokens.slice(0, 5).map(t => `${t.symbol}: $${t.value.toFixed(2)}`).join(', ');
      return `Your ${entities.chain || 'portfolio'} total is $${portfolio.totalValue.toFixed(2)}. Top holdings: ${tokens}`;

    case 'price':
      if (!portfolio) return 'Please provide a wallet address.';
      return `Your portfolio value is $${portfolio.totalValue.toFixed(2)} across ${portfolio.tokens.length} tokens.`;

    case 'rebalance':
      return 'To rebalance your portfolio, POST to /api/rebalance with your target allocations. Example: { targetAllocations: { SOL: 50, USDC: 50 } }';

    case 'swap':
      return 'For swaps, use /api/rebalance which handles token exchanges via Jupiter (Solana) or native swaps (Celo).';

    case 'alert':
      return 'Create alerts via POST /api/alerts with { wallet, chain, token, condition, threshold }';

    case 'bridge':
      return 'Cross-chain bridges available via /api/bridge?from=solana&to=celo&token=USDC&amount=100';

    default:
      return `I understand you're asking about ${intent}. Try: "portfolio", "rebalance", "price", "swap", "alert", or "bridge".`;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { message, wallet, chain } = body;

  if (!message) {
    return errorResponse('Message is required', 400);
  }

  try {
    // Detect intent
    const { intent, entities } = detectIntent(message);

    // Fetch portfolio if needed
    let portfolio;
    if (wallet && ['portfolio', 'price'].includes(intent)) {
      if (chain === 'celo' || entities.chain === 'celo') {
        portfolio = await getCeloPortfolio(wallet) as { totalValue: number; tokens: Array<{ symbol: string; value: number; balance: number }> } | undefined;
      } else if (chain === 'solana' || entities.chain === 'solana') {
        portfolio = await getPortfolio(wallet) as { totalValue: number; tokens: Array<{ symbol: string; value: number; balance: number }> } | undefined;
      } else {
        // Both chains
        const [solana, celo] = await Promise.all([
          getPortfolio(wallet),
          getCeloPortfolio(wallet),
        ]);
        portfolio = {
          totalValue: (solana?.totalValue || 0) + (celo?.totalValue || 0),
          tokens: [...(solana?.tokens || []), ...(celo?.tokens || [])] as Array<{ symbol: string; value: number; balance: number }>,
        };
      }
    }

    // Generate response
    const response = generateResponse(intent, entities, portfolio);

    return successResponse({
      message: response,
      intent,
      entities,
      suggestions: ['Show my portfolio', 'Rebalance to 50/50', 'Set price alert for SOL'],
    });
  } catch (error) {
    console.error('Chat error:', error);
    return errorResponse('Failed to process message', 500);
  }
}
