// lib/monad.ts - Monad RPC integration for portfolio data
// Monad is EVM-compatible (Chain ID: 143)

interface MonadToken {
  address: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
  decimals: number;
}

// Monad mainnet RPC
const MONAD_RPC_URL = process.env.MONAD_RPC_URL || 'https://rpc.monad.xyz';

// Token addresses on Monad
const MONAD_TOKENS: Record<string, { symbol: string; name: string; decimals: number }> = {
  '0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A': { symbol: 'WMON', name: 'Wrapped MON', decimals: 18 },
  '0x0000000000000000000000000000000000000000': { symbol: 'MON', name: 'Monad Native', decimals: 18 },
  '0xa4151B158B490e14C132C6d199B3C80116E6F10B': { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  '0x5f0154D6C8f5B1c1a7F9D72C70b3c8C3b2b3c1a': { symbol: 'USDT', name: 'Tether', decimals: 6 },
  '0x09d6B1D0f73dC39b9E84B2c3d2f5C8b5c5a5a5a': { symbol: 'DAI', name: 'Dai', decimals: 18 },
};

async function monadRpcCall(method: string, params: unknown[]): Promise<unknown> {
  const response = await fetch(MONAD_RPC_URL, {
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

export async function getMonadBalance(address: string): Promise<number> {
  const result = await monadRpcCall('eth_getBalance', [address, 'latest']);
  const wei = hexToDecimal(result as string);
  return wei / 1e18;
}

export async function getErc20Balance(address: string, tokenAddress: string, decimals: number): Promise<number> {
  const paddedAddress = address.toLowerCase().replace('0x', '').padStart(64, '0');
  const data = `0x70a08231000000000000000000000000${paddedAddress}`;
  
  const result = await monadRpcCall('eth_call', [{ to: tokenAddress, data }, 'latest']);
  const rawBalance = hexToDecimal(result as string);
  return rawBalance / Math.pow(10, decimals);
}

async function getMonadTokenPrices(): Promise<Record<string, number>> {
  try {
    // Use CoinGecko for prices
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=wrapped-monad,usd-coin,tether,dai&vs_currencies=usd'
    );
    const data = await response.json();
    return {
      'WMON': data['wrapped-monad']?.usd || 0.15,
      'MON': data['wrapped-monad']?.usd || 0.15,
      'USDC': data['usd-coin']?.usd || 1,
      'USDT': data['tether']?.usd || 1,
      'DAI': data.dai?.usd || 1,
    };
  } catch {
    return { 'MON': 0.15, 'USDC': 1, 'USDT': 1, 'DAI': 1 };
  }
}

export async function getMonadPortfolio(walletAddress: string): Promise<{
  totalValue: number;
  tokens: MonadToken[];
  lastUpdated: string;
  network: string;
} | null> {
  try {
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return null;
    }

    const [monBalance, usdcBalance, usdtBalance, prices] = await Promise.all([
      getMonadBalance(walletAddress),
      getErc20Balance(walletAddress, '0xa4151B158B490e14C132C6d199B3C80116E6F10B', 6),
      getErc20Balance(walletAddress, '0x5f0154D6C8f5B1c1a7F9D72C70b3c8C3b2b3c1a', 6),
      getMonadTokenPrices(),
    ]);

    const tokens: MonadToken[] = [
      {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'MON',
        name: 'Monad Native',
        balance: monBalance,
        price: prices['MON'],
        value: monBalance * prices['MON'],
        decimals: 18,
      },
      {
        address: '0xa4151B158B490e14C132C6d199B3C80116E6F10B',
        symbol: 'USDC',
        name: 'USD Coin',
        balance: usdcBalance,
        price: prices['USDC'],
        value: usdcBalance * prices['USDC'],
        decimals: 6,
      },
      {
        address: '0x5f0154D6C8f5B1c1a7F9D72C70b3c8C3b2b3c1a',
        symbol: 'USDT',
        name: 'Tether',
        balance: usdtBalance,
        price: prices['USDT'],
        value: usdtBalance * prices['USDT'],
        decimals: 6,
      },
    ];

    const nonZeroTokens = tokens.filter(t => t.balance > 0);
    const totalValue = nonZeroTokens.reduce((sum, t) => sum + t.value, 0);

    return {
      totalValue,
      tokens: nonZeroTokens,
      lastUpdated: new Date().toISOString(),
      network: 'monad-mainnet',
    };
  } catch (error) {
    console.error('Monad portfolio error:', error);
    return null;
  }
}

export async function getMonadGasPrice(): Promise<string> {
  const result = await monadRpcCall('eth_gasPrice', []);
  return result as string;
}

export async function getMonadBlockNumber(): Promise<number> {
  const result = await monadRpcCall('eth_blockNumber', []);
  return hexToDecimal(result as string);
}
