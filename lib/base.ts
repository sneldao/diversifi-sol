// lib/base.ts - Base RPC integration for portfolio data
// Base = Ethereum L2 (Chain ID: 8453)

interface BaseToken {
  address: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
  decimals: number;
}

// Base mainnet RPC
const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';

// Token addresses on Base (mainnet)
const BASE_TOKENS: Record<string, { symbol: string; name: string; decimals: number }> = {
  '0x4200000000000000000000000000000000000006': { symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
  '0x0000000000000000000000000000000000000000': { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  '0x4ed4e862860bed51a9570b96d89af5e1b0efefed': { symbol: 'DEGEN', name: 'Degen', decimals: 18 },
  '0xac1bd2486aafd5e7fae45d9e1b6be4f946ba0e9a': { symbol: 'DAI', name: 'Dai', decimals: 18 },
  '0x125ca6b72f2d1998ae1be2d9d04ed6d377e7b0b3': { symbol: 'cbBTC', name: 'Coinbase Wrapped BTC', decimals: 8 },
};

async function baseRpcCall(method: string, params: unknown[]): Promise<unknown> {
  const response = await fetch(BASE_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

function hexToDecimal(hex: string): number {
  if (!hex || hex === '0x') return 0;
  return parseInt(hex, 16);
}

export async function getBaseBalance(address: string): Promise<number> {
  const result = await baseRpcCall('eth_getBalance', [address, 'latest']);
  const wei = hexToDecimal(result as string);
  return wei / 1e18;
}

export async function getErc20Balance(address: string, tokenAddress: string, decimals: number): Promise<number> {
  const paddedAddress = address.toLowerCase().replace('0x', '').padStart(64, '0');
  const data = `0x70a08231000000000000000000000000${paddedAddress}`;
  
  const result = await baseRpcCall('eth_call', [{ to: tokenAddress, data }, 'latest']);
  const rawBalance = hexToDecimal(result as string);
  return rawBalance / Math.pow(10, decimals);
}

async function getBaseTokenPrices(): Promise<Record<string, number>> {
  try {
    // Use CoinGecko for prices
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd-coin,dai,degen,coinbase-wrapped-btc&vs_currencies=usd'
    );
    const data = await response.json();
    return {
      'ETH': data['ethereum']?.usd || 3200,
      'WETH': data['ethereum']?.usd || 3200,
      'USDC': data['usd-coin']?.usd || 1,
      'DAI': data.dai?.usd || 1,
      'DEGEN': data.degen?.usd || 0.02,
      'cbBTC': data['coinbase-wrapped-btc']?.usd || 85000,
    };
  } catch {
    // Fallback prices
    return { 'ETH': 3200, 'WETH': 3200, 'USDC': 1, 'DAI': 1, 'DEGEN': 0.02, 'cbBTC': 85000 };
  }
}

export async function getBasePortfolio(walletAddress: string): Promise<{
  totalValue: number;
  tokens: BaseToken[];
  lastUpdated: string;
  network: string;
} | null> {
  try {
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return null;
    }

    // Fetch native ETH and common ERC20 tokens
    const [ethBalance, usdcBalance, degenBalance, prices] = await Promise.all([
      getBaseBalance(walletAddress),
      getErc20Balance(walletAddress, '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 6),
      getErc20Balance(walletAddress, '0x4ed4e862860bed51a9570b96d89af5e1b0efefed', 18),
      getBaseTokenPrices(),
    ]);

    const tokens: BaseToken[] = [
      {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'ETH',
        name: 'Ethereum',
        balance: ethBalance,
        price: prices['ETH'],
        value: ethBalance * prices['ETH'],
        decimals: 18,
      },
      {
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        symbol: 'USDC',
        name: 'USD Coin',
        balance: usdcBalance,
        price: prices['USDC'],
        value: usdcBalance * prices['USDC'],
        decimals: 6,
      },
      {
        address: '0x4ed4e862860bed51a9570b96d89af5e1b0efefed',
        symbol: 'DEGEN',
        name: 'Degen',
        balance: degenBalance,
        price: prices['DEGEN'],
        value: degenBalance * prices['DEGEN'],
        decimals: 18,
      },
    ];

    const nonZeroTokens = tokens.filter(t => t.balance > 0.0001); // Filter dust
    const totalValue = nonZeroTokens.reduce((sum, t) => sum + t.value, 0);

    return {
      totalValue,
      tokens: nonZeroTokens,
      lastUpdated: new Date().toISOString(),
      network: 'base-mainnet',
    };
  } catch (error) {
    console.error('Base portfolio error:', error);
    return null;
  }
}

export async function getBaseGasPrice(): Promise<string> {
  const result = await baseRpcCall('eth_gasPrice', []);
  return result as string;
}

export async function getBaseBlockNumber(): Promise<number> {
  const result = await baseRpcCall('eth_blockNumber', []);
  return hexToDecimal(result as string);
}

// Swap functions using 0x API for Base DEX aggregation
// Supports: Uniswap V3, Camelot, BaseSwap, Swapbased

const BASE_CHAIN_ID = 8453;
const ZERO_EX_API = 'https://api.0x.org';

// Token addresses on Base
const NATIVE_ETH = '0x0000000000000000000000000000000000000000';
const WETH = '0x4200000000000000000000000000000000000006';

interface SwapQuote {
  path: string[];
  outputAmount: number;
  priceImpact: number;
  buyTokenAddress: string;
  sellTokenAddress: string;
  gasEstimate: number;
  tx: {
    to: string;
    data: string;
    value: string;
    gas: string;
  };
}

export async function getSwapQuote(
  fromToken: string,
  toToken: string,
  amountIn: number,
  _decimals: number // kept for API but we normalize ourselves
): Promise<SwapQuote | null> {
  try {
    // Normalize token addresses (handle ETH -> WETH for 0x)
    const sellToken = fromToken === NATIVE_ETH ? WETH : fromToken;
    const buyToken = toToken === NATIVE_ETH ? WETH : toToken;

    // Convert amount to wei (18 decimals)
    const amountInWei = (amountIn * 1e18).toString();
    
    // Use 0x API for quote
    const url = new URL(`${ZERO_EX_API}/swap/v1/quote`);
    url.searchParams.set('sellToken', sellToken);
    url.searchParams.set('buyToken', buyToken);
    url.searchParams.set('sellAmount', amountInWei);
    url.searchParams.set('chainId', BASE_CHAIN_ID.toString());
    url.searchParams.set('slippagePercentage', '0.005'); // 0.5% slippage

    const response = await fetch(url.toString(), {
      headers: { '0x-api-key': '' } // No API key for basic usage
    });

    if (!response.ok) {
      console.log(`0x quote error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    return {
      path: [sellToken, buyToken],
      outputAmount: parseFloat(data.buyAmount || '0') / 1e18,
      priceImpact: parseFloat(data.priceImpact || '0') * 100,
      buyTokenAddress: buyToken,
      sellTokenAddress: sellToken,
      gasEstimate: parseInt(data.gas || '150000'),
      tx: {
        to: data.to,
        data: data.data,
        value: data.value || '0',
        gas: data.gas || '150000'
      }
    };
  } catch (error) {
    console.error('Swap quote error:', error);
    return null;
  }
}

export async function executeSwap(
  _wallet: string,
  fromToken: string,
  toToken: string,
  amountIn: number,
  slippage: number = 0.5
): Promise<{ txHash: string | null; quote: SwapQuote | null }> {
  // First get a quote
  const quote = await getSwapQuote(fromToken, toToken, amountIn, 18);
  
  if (!quote) {
    return { txHash: null, quote: null };
  }

  console.log(`�Swap Quote:`);
  console.log(`   Sell: ${amountIn} ${fromToken}`);
  console.log(`   Buy: ~${quote.outputAmount.toFixed(6)} ${toToken}`);
  console.log(`   Price Impact: ${quote.priceImpact.toFixed(2)}%`);
  console.log(`   Gas Estimate: ${quote.gasEstimate}`);

  // Return the quote with tx data - actual execution would require signing
  // In a real implementation, this would use viem/wagmi to sign and send
  return { 
    txHash: null, // Would be populated after signing
    quote 
  };
}

// Helper: Get token decimals
export function getTokenDecimals(symbol: string): number {
  const tokens: Record<string, number> = {
    'ETH': 18, 'WETH': 18, 'USDC': 6, 'USDT': 6,
    'DAI': 18, 'DEGEN': 18, 'cbBTC': 8
  };
  return tokens[symbol] || 18;
}

// Helper: Get token address by symbol
export function getTokenAddress(symbol: string): string | null {
  const addresses: Record<string, string> = {
    'ETH': NATIVE_ETH,
    'WETH': WETH,
    'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    'DAI': '0xac1bd2486aafd5e7fae45d9e1b6be4f946ba0e9a',
    'DEGEN': '0x4ed4e862860bed51a9570b96d89af5e1b0efefed',
    'cbBTC': '0x125ca6b72f2d1998ae1be2d9d04ed6d377e7b0b3'
  };
  return addresses[symbol] || null;
}
