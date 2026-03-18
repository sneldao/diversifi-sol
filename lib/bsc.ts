// lib/bsc.ts - BSC/BNB Chain RPC integration for portfolio data and UBI

interface BscToken {
  address: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
  category: string;
  decimals: number;
}

// BSC mainnet RPC endpoints (public, free to use)
const BSC_RPC_URLS = [
  'https://bsc-dataseed1.binance.org',
  'https://bsc-dataseed2.binance.org',
  'https://bsc-dataseed3.binance.org',
  'https://bsc-dataseed4.binance.org',
];

// BSC Testnet
const BSC_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545';

// Common BEP-20 token addresses on BSC mainnet
const BSC_TOKENS: Record<string, { symbol: string; name: string; category: string; decimals: number; address: string }> = {
  // Native BNB
  '0x0000000000000000000000000000000000000000': { symbol: 'BNB', name: 'BNB Native', category: 'Native', decimals: 18, address: '0x0000000000000000000000000000000000000000' },
  // Stablecoins
  '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d': { symbol: 'USDC', name: 'USD Coin', category: 'Stablecoin', decimals: 18, address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' },
  '0x55d398326f99059fF775485246999027B3197955': { symbol: 'USDT', name: 'Tether USD', category: 'Stablecoin', decimals: 18, address: '0x55d398326f99059fF775485246999027B3197955' },
  '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56': { symbol: 'BUSD', name: 'Binance USD', category: 'Stablecoin', decimals: 18, address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56' },
  '0x1AF3F329e8BE154074D4209e23fD1FEC79e1C92a': { symbol: 'DAI', name: 'Dai Stablecoin', category: 'Stablecoin', decimals: 18, address: '0x1AF3F329e8BE154074D4209e23fD1FEC79e1C92a' },
  // DeFi
  '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82': { symbol: 'CAKE', name: 'PancakeSwap Token', category: 'DeFi', decimals: 18, address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82' },
  '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c': { symbol: 'WBNB', name: 'Wrapped BNB', category: 'Wrapper', decimals: 18, address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' },
  // BSC-specific
  '0x7083609fCE4d1d8Dc0C979CCb0e58281fC5D0C83': { symbol: 'FIL', name: 'Filecoin', category: 'Storage', decimals: 18, address: '0x7083609fCE4d1d8Dc0C979CCb0e58281fC5D0C83' },
  '0xF8A0BF9cfF492B582FF2c256D01A0F6cBCF5Dc81': { symbol: 'DOT', name: 'Polkadot', category: 'Layer-1', decimals: 18, address: '0xF8A0BF9cfF492B582FF2c256D01A0F6cBCF5Dc81' },
  '0xBf5140A22537968CFd74a37aC9d3A5d5d9D5d5D5': { symbol: 'ETH', name: 'Ethereum', category: 'Layer-1', decimals: 18, address: '0xBf5140A22537968CFd74a37aC9d3A5d5d9D5d5D5' },
};

// Get RPC URL
function getBscRpcUrl(): string {
  return process.env.BSC_RPC_URL || BSC_RPC_URLS[0];
}

// Generic JSON-RPC call to BSC
async function bscRpcCall(method: string, params: unknown[]): Promise<unknown> {
  const rpcUrl = getBscRpcUrl();
  
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
    throw new Error(`BSC RPC error: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`BSC RPC error: ${data.error.message}`);
  }

  return data.result;
}

// Convert hex to decimal
function hexToDecimal(hex: string): number {
  if (!hex || hex === '0x') return 0;
  return parseInt(hex, 16);
}

// Get native BNB balance
export async function getBscBalance(address: string): Promise<number> {
  const result = await bscRpcCall('eth_getBalance', [address, 'latest']);
  const wei = hexToDecimal(result as string);
  return wei / 1e18; // Convert to BNB
}

// Get BEP-20 token balance using balanceOf
export async function getBep20Balance(address: string, tokenAddress: string, decimals: number): Promise<number> {
  // BEP-20 balanceOf function selector: 0x70a08231
  const paddedAddress = address.toLowerCase().replace('0x', '').padStart(64, '0');
  const data = `0x70a08231000000000000000000000000${paddedAddress}`;
  
  const result = await bscRpcCall('eth_call', [{
    to: tokenAddress,
    data: data,
  }, 'latest']);
  
  const rawBalance = hexToDecimal(result as string);
  return rawBalance / Math.pow(10, decimals);
}

// Get token prices from CoinGecko (free, no API key needed)
export async function getBscTokenPrices(): Promise<Record<string, number>> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,tether,usd-coin,binance-usd,dai,pancakeswap-token,filecoin,ethereum,polkadot&vs_currencies=usd',
      { method: 'GET' }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch prices');
    }
    
    const data = await response.json();
    return {
      'BNB': data.binancecoin?.usd || 0,
      'USDT': data.tether?.usd || 1,
      'USDC': data['usd-coin']?.usd || 1,
      'BUSD': data['binance-usd']?.usd || 1,
      'DAI': data.dai?.usd || 1,
      'CAKE': data['pancakeswap-token']?.usd || 0,
      'FIL': data.filecoin?.usd || 0,
      'ETH': data.ethereum?.usd || 0,
      'DOT': data.polkadot?.usd || 0,
    };
  } catch (error) {
    console.error('Price fetch error, using defaults:', error);
    // Default prices as fallback
    return {
      'BNB': 320.00,
      'USDT': 1.00,
      'USDC': 1.00,
      'BUSD': 1.00,
      'DAI': 1.00,
      'CAKE': 2.50,
      'FIL': 5.00,
      'ETH': 2500.00,
      'DOT': 7.00,
    };
  }
}

// Main portfolio function
export async function getBscPortfolio(walletAddress: string): Promise<{
  totalValue: number;
  tokens: BscToken[];
  lastUpdated: string;
  network: string;
} | null> {
  try {
    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      console.error('Invalid BSC address format');
      return null;
    }

    // Get all token balances in parallel
    const [bnbBalance, usdcBalance, usdtBalance, busdBalance, daiBalance, cakeBalance, prices] = await Promise.all([
      getBscBalance(walletAddress),
      getBep20Balance(walletAddress, BSC_TOKENS['0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'].address, 18),
      getBep20Balance(walletAddress, BSC_TOKENS['0x55d398326f99059fF775485246999027B3197955'].address, 18),
      getBep20Balance(walletAddress, BSC_TOKENS['0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'].address, 18),
      getBep20Balance(walletAddress, BSC_TOKENS['0x1AF3F329e8BE154074D4209e23fD1FEC79e1C92a'].address, 18),
      getBep20Balance(walletAddress, BSC_TOKENS['0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82'].address, 18),
      getBscTokenPrices(),
    ]);

    const tokens: BscToken[] = [
      {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'BNB',
        name: 'BNB Native',
        balance: bnbBalance,
        price: prices['BNB'],
        value: bnbBalance * prices['BNB'],
        category: 'Native',
        decimals: 18,
      },
      {
        address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        symbol: 'USDC',
        name: 'USD Coin',
        balance: usdcBalance,
        price: prices['USDC'],
        value: usdcBalance * prices['USDC'],
        category: 'Stablecoin',
        decimals: 18,
      },
      {
        address: '0x55d398326f99059fF775485246999027B3197955',
        symbol: 'USDT',
        name: 'Tether USD',
        balance: usdtBalance,
        price: prices['USDT'],
        value: usdtBalance * prices['USDT'],
        category: 'Stablecoin',
        decimals: 18,
      },
      {
        address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
        symbol: 'BUSD',
        name: 'Binance USD',
        balance: busdBalance,
        price: prices['BUSD'],
        value: busdBalance * prices['BUSD'],
        category: 'Stablecoin',
        decimals: 18,
      },
      {
        address: '0x1AF3F329e8BE154074D4209e23fD1FEC79e1C92a',
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        balance: daiBalance,
        price: prices['DAI'],
        value: daiBalance * prices['DAI'],
        category: 'Stablecoin',
        decimals: 18,
      },
      {
        address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
        symbol: 'CAKE',
        name: 'PancakeSwap Token',
        balance: cakeBalance,
        price: prices['CAKE'],
        value: cakeBalance * prices['CAKE'],
        category: 'DeFi',
        decimals: 18,
      },
    ];

    // Filter out zero balances
    const nonZeroTokens = tokens.filter(t => t.balance > 0);

    const totalValue = nonZeroTokens.reduce((sum, token) => sum + token.value, 0);

    return {
      totalValue,
      tokens: nonZeroTokens,
      lastUpdated: new Date().toISOString(),
      network: 'bsc-mainnet',
    };
  } catch (error) {
    console.error('BSC portfolio error:', error);
    return null;
  }
}

// Get gas price for transactions
export async function getBscGasPrice(): Promise<{ gasPrice: string; gwei: number }> {
  const result = await bscRpcCall('eth_gasPrice', []);
  const gwei = hexToDecimal(result as string) / 1e9;
  return {
    gasPrice: result as string,
    gwei,
  };
}

// Estimate transaction gas
export async function estimateBscGas(from: string, to: string, value: string, data?: string): Promise<number> {
  const result = await bscRpcCall('eth_estimateGas', [{
    from,
    to,
    value,
    data: data || '0x',
  }]);
  
  return hexToDecimal(result as string);
}

// Get current block number
export async function getBscBlockNumber(): Promise<number> {
  const result = await bscRpcCall('eth_blockNumber', []);
  return hexToDecimal(result as string);
}

// Get chain ID
export async function getBscChainId(): Promise<number> {
  const result = await bscRpcCall('eth_chainId', []);
  return hexToDecimal(result as string);
}

// UBI-related functions

// Check if an address is eligible for UBI
export interface UbiEligibility {
  eligible: boolean;
  chain: string;
  claimed: boolean;
  pending: boolean;
}

// Mock UBI distribution contract
const UBI_CONTRACT_ADDRESS = '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';

export async function checkUbiEligibility(address: string, chain: string): Promise<UbiEligibility> {
  // In production, this would query an on-chain contract
  // For now, return mock data based on address format
  
  const hasValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address);
  
  return {
    eligible: hasValidAddress,
    chain,
    claimed: false, // Would check contract
    pending: false,
  };
}

// Claim UBI on BSC
export async function claimUbi(address: string): Promise<{ success: boolean; txHash?: string; amount?: number }> {
  // In production, this would submit an on-chain transaction
  // For now, return mock success
  
  console.log(`UBI claim initiated for address ${address} on BSC`);
  
  return {
    success: true,
    txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
    amount: 100, // Mock UBI amount in tokens
  };
}

// Get UBI status across chains
export async function getUbiStatus(address: string): Promise<{
  totalClaimed: number;
  chains: { chain: string; claimed: boolean; amount: number }[];
}> {
  // Mock multi-chain UBI status
  return {
    totalClaimed: 300,
    chains: [
      { chain: 'solana', claimed: true, amount: 100 },
      { chain: 'celo', claimed: true, amount: 100 },
      { chain: 'bsc', claimed: false, amount: 100 },
    ],
  };
}
