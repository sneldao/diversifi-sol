import { NextRequest, NextResponse } from 'next/server';
import { 
  MOBILE_MONEY_PROVIDERS,
  initiateMobileMoneyWithdrawal,
  getTransactionStatus,
  getCrossBorderQuote
} from '@/lib/erc8004';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface MobileMoneyRequest {
  agentId: string;
  provider: string;
  phoneNumber: string;
  amount: number;
  currency?: string;
  fromToken?: string; // Crypto token to convert (e.g., 'cUSD')
}

// Validate phone number format (basic validation)
function validatePhoneNumber(phone: string, country: string): boolean {
  // Basic validation - in production would use country-specific regex
  if (!phone || phone.length < 8) return false;
  
  // Remove common formatting
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^\+?[0-9]{8,15}$/.test(cleaned);
}

export async function POST(request: NextRequest) {
  try {
    const body: MobileMoneyRequest = await request.json();
    
    const { agentId, provider, phoneNumber, amount, currency = 'USD', fromToken = 'cUSD' } = body;

    // Validate required fields
    if (!agentId) return errorResponse('Agent ID is required', 400);
    if (!provider) return errorResponse('Provider is required', 400);
    if (!phoneNumber) return errorResponse('Phone number is required', 400);
    if (!amount || amount <= 0) return errorResponse('Valid amount is required', 400);

    // Validate provider
    const validProvider = MOBILE_MONEY_PROVIDERS.find(
      p => p.name.toLowerCase().includes(provider.toLowerCase())
    );
    if (!validProvider) {
      return errorResponse(
        `Unknown provider. Available: ${MOBILE_MONEY_PROVIDERS.map(p => p.name).join(', ')}`,
        400
      );
    }

    // Get cross-border quote
    const quote = await getCrossBorderQuote(fromToken, validProvider.currency, amount);

    // Initiate withdrawal
    const transaction = await initiateMobileMoneyWithdrawal(
      agentId,
      validProvider.name,
      phoneNumber,
      amount,
      currency
    );

    return successResponse({
      transaction,
      quote,
      provider: validProvider,
      message: `Withdrawal initiated via ${validProvider.name}. Convert ${amount} ${fromToken} to ${validProvider.currency}`,
    }, {
      type: 'mobile_money_withdrawal',
      provider: validProvider.name,
      estimatedTime: quote.estimatedTime,
    });

  } catch (error) {
    console.error('Mobile money API error:', error);
    return errorResponse('Failed to process mobile money withdrawal', 500);
  }
}

// GET - Check transaction status or get providers
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const transactionId = searchParams.get('transactionId');

  if (transactionId) {
    const status = await getTransactionStatus(transactionId);
    return successResponse({
      transactionId,
      status,
      lastChecked: new Date().toISOString(),
    });
  }

  // Return providers if no transaction ID
  return successResponse({
    providers: MOBILE_MONEY_PROVIDERS,
    description: 'Supported mobile money providers for cross-border crypto-to-fiat withdrawals',
    supportedCountries: ['Kenya', 'Ghana', 'Senegal', 'Pan-Africa'],
  });
}
