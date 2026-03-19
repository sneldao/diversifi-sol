import { NextRequest, NextResponse } from 'next/server';
import { getSwapQuote, getBasePortfolio, getTokenAddress, getBaseGasPrice } from '@/lib/base';
import { successResponse, errorResponse } from '@/lib/api-utils';

// Demo wallet with some Base assets for showcase
const DEMO_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f0fAb1';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fromToken = searchParams.get('from') || 'USDC';
  const toToken = searchParams.get('to') || 'ETH';
  const amount = parseFloat(searchParams.get('amount') || '100');
  const wallet = searchParams.get('wallet') || DEMO_WALLET;

  // Validate amount
  if (amount <= 0 || amount > 10000) {
    return errorResponse('Amount must be between 0 and 10000', 400);
  }

  // Get token addresses
  const fromAddress = getTokenAddress(fromToken);
  const toAddress = getTokenAddress(toToken);

  if (!fromAddress || !toAddress) {
    return errorResponse('Invalid token', 400, { from: fromToken, to: toToken });
  }

  try {
    // Get swap quote from 0x
    const quote = await getSwapQuote(fromAddress, toAddress, amount, 18);
    
    if (!quote) {
      return errorResponse('Failed to get swap quote', 503, { 
        from: fromToken, 
        to: toToken, 
        amount 
      });
    }

    // Get current gas price
    const gasPrice = await getBaseGasPrice();
    const gasPriceGwei = parseInt(gasPrice, 16) / 1e9;
    const estimatedGasCost = (parseInt(quote.tx.gas) * parseInt(gasPrice, 16)) / 1e18;

    return successResponse({
      quote: {
        fromToken,
        toToken,
        amountIn: amount,
        amountOut: quote.outputAmount,
        priceImpact: quote.priceImpact,
        estimatedGas: parseInt(quote.tx.gas),
        gasPrice: gasPriceGwei,
        gasCostUSD: estimatedGasCost * 3200, // ETH price estimate
        buyTokenAddress: quote.buyTokenAddress,
        sellTokenAddress: quote.sellTokenAddress,
      },
      tx: {
        to: quote.tx.to,
        data: quote.tx.data.slice(0, 100) + '...', // Truncate for display
        value: quote.tx.value,
        gas: quote.tx.gas,
      },
      route: quote.path,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Swap API error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// Execute swap (would require wallet signature in production)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromToken, toToken, amount, wallet } = body;

    if (!fromToken || !toToken || !amount) {
      return errorResponse('Missing required fields: fromToken, toToken, amount', 400);
    }

    const fromAddress = getTokenAddress(fromToken);
    const toAddress = getTokenAddress(toToken);

    if (!fromAddress || !toAddress) {
      return errorResponse('Invalid token', 400);
    }

    // Get quote
    const quote = await getSwapQuote(fromAddress, toAddress, amount, 18);

    if (!quote) {
      return errorResponse('Failed to execute swap - could not get quote', 503);
    }

    // In production, this would:
    // 1. Sign the transaction with user's wallet
    // 2. Send via eth_sendRawTransaction
    // 3. Return txHash
    
    // For demo, return the quote with pending status
    return successResponse({
      status: 'ready_to_execute',
      fromToken,
      toToken,
      amountIn: amount,
      amountOut: quote.outputAmount,
      tx: {
        to: quote.tx.to,
        data: quote.tx.data,
        value: quote.tx.value,
        gas: quote.tx.gas,
      },
      note: 'Wallet connection required to sign and execute this transaction',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Swap execute error:', error);
    return errorResponse('Failed to execute swap', 500);
  }
}
