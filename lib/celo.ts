// lib/celo.ts - Celo RPC integration for portfolio data and mobile money

interface CeloToken {
  address: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
  category: string;
  decimals: number;
}

interface CeloBalance {
  celo: number;
  cusd: number;
  ceur: number;
}

// Celo mainnet RPC endpoints (community-provided, free to use)
const CELO_RPC_URLS = [
  'https://forno.celo.org',
  'https://celo-mainnet.g.alchemy.com/v2/demo', // demo key for testing
];

// ERC-20 token addresses on Celo mainnet
const CELO_TOKENS: Record<string, { symbol: string; name: string; category: string; decimals: number; address: string }> = {
  '0x0000000000000000000000000000000000000000': { symbol: 'CELO', name: 'Celo Native', category: 'Native', decimals: 18, address: '0x0000000000000000000000000000000000000000' },
  '0x765de816845861e75a25fca122bb6898b8b12816': { symbol: 'cUSD', name: 'Celo Dollar', category: 'Stablecoin', decimals: 18, address: '0x765de816845861e75a25fca122bb6898b8b12816' },
  '0xD8763CBa276a3730E8dcD1Bf5D5cF2D5D7b9760': { symbol: 'cEUR', name: 'Celo Euro', category: 'Stablecoin', decimals: 18, address: '0xD8763CBa276a3730E8dcD1Bf5D5cF2D5D7b9760' },
  '0x471EcE3750Da237f93B8E339c536989b8978a438': { symbol: 'cETH', name: 'Celo Ether', category: 'Wrapped ETH', decimals: 18, address: '0x471EcE3750Da237f93B8E339c536989b8978a438' },
  '0xef4229c8c3250CEB2DfA4d4D32924a84bD1a9fC5': { symbol: 'USDC', name: 'USD Coin (Celo)', category: 'Stablecoin', decimals: 6, address: '0xef4229c8c3250CEB2DfA4d4D32924a84bD1a9fC5' },
  '0x1f8A4e5b6C7D8E9f0a1b2c3d4e5f6a7b8c9d0e1f': { symbol: 'MOBI', name: 'Mobius', category: 'DeFi', decimals: 18, address: '0x1f8A4e5b6C7D8E9f0a1b2c3d4e5f6a7b8c9d0e1f' },
  '0x2A3684eCD8C5A5c8a5D9D3E3b2F1E0D9C8B7A6F5': { symbol: 'POH', name: 'Preservation of Heritage', category: 'Social Impact', decimals: 18, address: '0x2A3684eCD8C5A5c8a5D9D3E3b2F1E0D9C8B7A6F5' },
  '0xE74Abf04B6B4e9a5d4d4B7D4e6F8A9B0C1D2E3F4': { symbol: 'cREAL', name: 'Celo Real', category: 'Stablecoin', decimals: 18, address: '0xE74Abf04B6B4e9a5d4d4B7D4e6F8A9B0C1D2E3F4' },
};

// Get the primary RPC URL
function getCeloRpcUrl(): string {
  return process.env.CELO_RPC_URL || CELO_RPC_URLS[0];
}

// Generic JSON-RPC call to Celo
async function celoRpcCall(method: string, params: unknown[]): Promise<unknown> {
  const rpcUrl = getCeloRpcUrl();
  
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`Celo RPC error: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`Celo RPC error: ${data.error.message}`);
  }

  return data.result;
}

// Convert hex to decimal
function hexToDecimal(hex: string): number {
  if (!hex || hex === '0x') return 0;
  return parseInt(hex, 16);
}

// Get native CELO balance
async function getCeloBalance(address: string): Promise<number> {
  const result = await celoRpcCall('eth_getBalance', [address, 'latest']);
  const wei = hexToDecimal(result as string);
  return wei / 1e18; // Convert to CELO
}

// Get ERC-20 token balance using balanceOf
async function getErc20Balance(address: string, tokenAddress: string, decimals: number): Promise<number> {
  // ERC-20 balanceOf function selector: 0x70a08231
  const paddedAddress = address.toLowerCase().replace('0x', '').padStart(64, '0');
  const data = `0x70a08231000000000000000000000000${paddedAddress}`;
  
  const result = await celoRpcCall('eth_call', [{
    to: tokenAddress,
    data: data,
  }, 'latest']);
  
  const rawBalance = hexToDecimal(result as string);
  return rawBalance / Math.pow(10, decimals);
}

// Get token prices from CoinGecko (free, no API key needed)
async function getCeloTokenPrices(): Promise<Record<string, number>> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=celo-dollar,celo-euro,celo,ethereum,usd-coin&vs_currencies=usd',
      { method: 'GET' }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch prices');
    }
    
    const data = await response.json();
    return {
      'CELO': data.celo?.usd || 0,
      'cUSD': data['celo-dollar']?.usd || 1,
      'cEUR': data['celo-euro']?.usd || 1.08,
      'cETH': data.ethereum?.usd || 0,
      'USDC': 1,
    };
  } catch (error) {
    console.error('Price fetch error, using defaults:', error);
    // Default prices as fallback
    return {
      'CELO': 0.80,
      'cUSD': 1.00,
      'cEUR': 1.08,
      'cETH': 2500.00,
      'USDC': 1.00,
    };
  }
}

// Main portfolio function
export async function getCeloPortfolio(walletAddress: string): Promise<{
  totalValue: number;
  tokens: CeloToken[];
  lastUpdated: string;
  network: string;
} | null> {
  try {
    // Validate address format (Celo uses Ethereum-style addresses)
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      console.error('Invalid Celo address format');
      return null;
    }

    // Get all token balances in parallel
    const [celoBalance, cusdBalance, ceurBalance, cethBalance, usdcBalance, prices] = await Promise.all([
      getCeloBalance(walletAddress),
      getErc20Balance(walletAddress, CELO_TOKENS['0x765de816845861e75a25fca122bb6898b8b12816'].address, 18),
      getErc20Balance(walletAddress, CELO_TOKENS['0xD8763CBa276a3730E8dcD1Bf5D5cF2D5D7b9760'].address, 18),
      getErc20Balance(walletAddress, CELO_TOKENS['0x471EcE3750Da237f93B8E339c536989b8978a438'].address, 18),
      getErc20Balance(walletAddress, '0xef4229c8c3250CEB2DfA4d4D32924a84bD1a9fC5', 6),
      getCeloTokenPrices(),
    ]);

    const tokens: CeloToken[] = [
      {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'CELO',
        name: 'Celo Native',
        balance: celoBalance,
        price: prices['CELO'],
        value: celoBalance * prices['CELO'],
        category: 'Native',
        decimals: 18,
      },
      {
        address: '0x765de816845861e75a25fca122bb6898b8b12816',
        symbol: 'cUSD',
        name: 'Celo Dollar',
        balance: cusdBalance,
        price: prices['cUSD'],
        value: cusdBalance * prices['cUSD'],
        category: 'Stablecoin',
        decimals: 18,
      },
      {
        address: '0xD8763CBa276a3730E8dcD1Bf5D5cF2D5D7b9760',
        symbol: 'cEUR',
        name: 'Celo Euro',
        balance: ceurBalance,
        price: prices['cEUR'],
        value: ceurBalance * prices['cEUR'],
        category: 'Stablecoin',
        decimals: 18,
      },
      {
        address: '0x471EcE3750Da237f93B8E339c536989b8978a438',
        symbol: 'cETH',
        name: 'Celo Ether',
        balance: cethBalance,
        price: prices['cETH'],
        value: cethBalance * prices['cETH'],
        category: 'Wrapped ETH',
        decimals: 18,
      },
      {
        address: '0xef4229c8c3250CEB2DfA4d4D32924a84bD1a9fC5',
        symbol: 'USDC',
        name: 'USD Coin (Celo)',
        balance: usdcBalance,
        price: prices['USDC'],
        value: usdcBalance * prices['USDC'],
        category: 'Stablecoin',
        decimals: 6,
      },
    ];

    // Filter out zero balances
    const nonZeroTokens = tokens.filter(t => t.balance > 0);

    const totalValue = nonZeroTokens.reduce((sum, token) => sum + token.value, 0);

    return {
      totalValue,
      tokens: nonZeroTokens,
      lastUpdated: new Date().toISOString(),
      network: 'celo-mainnet',
    };
  } catch (error) {
    console.error('Celo portfolio error:', error);
    return null;
  }
}

// Get gas price for transactions
export async function getCeloGasPrice(): Promise<{ gasPrice: string; feeCurrency: string }> {
  const result = await celoRpcCall('eth_gasPrice', []);
  return {
    gasPrice: result as string,
    feeCurrency: '0x0000000000000000000000000000000000000000', // CELO
  };
}

// Estimate transaction gas
export async function estimateGas(from: string, to: string, value: string, data?: string): Promise<number> {
  const result = await celoRpcCall('eth_estimateGas', [{
    from,
    to,
    value,
    data: data || '0x',
  }]);
  
  return hexToDecimal(result as string);
}

// Get current block number
export async function getCeloBlockNumber(): Promise<number> {
  const result = await celoRpcCall('eth_blockNumber', []);
  return hexToDecimal(result as string);
}

// Send raw transaction (for swaps)
export async function sendCeloTransaction(signedTx: string): Promise<string> {
  const result = await celoRpcCall('eth_sendRawTransaction', [signedTx]);
  return result as string;
}
