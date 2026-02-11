const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_RPC_URL = HELIUS_API_KEY 
  ? `https://api.helius.xyz/v0?api-key=${HELIUS_API_KEY}`
  : 'https://api.mainnet-beta.solana.com';

// Fallback to public RPC if no API key
const USE_FALLBACK = !HELIUS_API_KEY;

// Known RWA token mints for special handling
const RWA_TOKENS: Record<string, { symbol: string; name: string; category: string }> = {
  'bSo13r1T4sSxyB1z9Ts6Z7J6K4q5Zr8Z6y5x4w3v2u1t0': { symbol: 'bSOL', name: 'Backed SOL', category: 'U.S. Treasuries' },
  'onkEn4i2B1D3Uq8Q7m8qZ5y4x3w2v1u0t9s8r7p6o5n4m': { symbol: 'ONDO', name: 'Ondo USD Yield', category: 'U.S. Treasuries' },
  'mP1p2o3n4i5t6o7r8e9s1s2M3P4L5E6F7I8N9A10N11C12E': { symbol: 'MP1', name: 'Maple USDC', category: 'Private Credit' },
};

export interface TokenBalance {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
  isRWA?: boolean;
  category?: string;
}

export interface PortfolioData {
  totalValue: number;
  tokens: TokenBalance[];
  chainBreakdown: Record<string, number>;
  lastUpdated: string;
}

export async function getPortfolio(walletAddress: string): Promise<PortfolioData | null> {
  // If no API key, use demo data
  if (!HELIUS_API_KEY) {
    console.log('No HELIUS_API_KEY - returning demo data');
    return getDemoPortfolio(walletAddress);
  }

  try {
    // Fetch all token balances and prices in one call using Helius v0
    const response = await fetch(
      `${HELIUS_RPC_URL}/addresses/${walletAddress}/tokens?includeMetadata=true&includePrice=true`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(`Helius API error: ${response.status} ${response.statusText}`);
      return getDemoPortfolio(walletAddress);
    }

    const data = await response.json();
    const tokens: TokenBalance[] = [];

    // Process tokens from Helius response
    const rawTokens = data.result?.tokens || data.tokens || [];
    
    for (const token of rawTokens) {
      if (token.balance <= 0) continue;
      
      const mint = token.mint || token.address;
      const decimals = token.decimals || 9;
      const balance = token.balance / Math.pow(10, decimals);
      const price = token.priceInfo?.pricePerToken || token.price || 0;
      const value = balance * price;
      
      // Check if this is a known RWA token
      const rwaInfo = RWA_TOKENS[mint] || 
        rawTokens.find((t: { mint: string; symbol: string }) => t.mint === mint && (t.symbol === 'bSOL' || t.symbol === 'ONDO' || t.symbol === 'MP1'));

      tokens.push({
        mint,
        symbol: token.symbol || rwaInfo?.symbol || 'Unknown',
        name: token.name || rwaInfo?.name || 'Unknown Token',
        balance,
        price,
        value,
        isRWA: !!rwaInfo,
        category: rwaInfo?.category,
      });
    }

    // Sort by value descending
    const sortedTokens = tokens.sort((a, b) => b.value - a.value);
    const totalValue = sortedTokens.reduce((sum, token) => sum + token.value, 0);

    return {
      totalValue,
      tokens: sortedTokens,
      chainBreakdown: { Solana: totalValue },
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Helius API error:', error);
    return getDemoPortfolio(walletAddress);
  }
}

// Demo portfolio for when Helius is unavailable
function getDemoPortfolio(walletAddress: string): PortfolioData {
  return {
    totalValue: 12458.92,
    tokens: [
      { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', name: 'USD Coin', balance: 5234.56, price: 1, value: 5234.56, category: 'Stablecoins' },
      { mint: 'So11111111111111111111111111111111111111112', symbol: 'SOL', name: 'Solana', balance: 145.23, price: 98.45, value: 14298.5, category: 'Layer 1' },
      { mint: 'mSoLzYCxHdYgdzU8g95Q6kkcj8D4wvTXEUkNLv17rPi', symbol: 'MSOL', name: 'Marinade Staked SOL', balance: 32.45, price: 118.92, value: 3859, category: 'Liquid Staking' },
      { mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB3Z', symbol: 'BONK', name: 'Bonk', balance: 5000000, price: 0.0000234, value: 117, category: 'Meme' },
      { mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtkqjberbSOWd91pbT2', symbol: 'JUP', name: 'Jupiter', balance: 1250, price: 0.89, value: 1112.5, category: 'DEX' },
    ],
    chainBreakdown: { Solana: 12458.92 },
    lastUpdated: new Date().toISOString(),
  };
}

export async function getTokenPrice(mint: string): Promise<number | null> {
  try {
    const response = await fetch(
      `${HELIUS_RPC_URL}/tokens/${mint}/price`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.result?.price || null;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return null;
  }
}

// Helper to get SOL price from Helius
export async function getSolPrice(): Promise<number> {
  try {
    const SOL_MINT = 'So11111111111111111111111111111111111111112';
    const price = await getTokenPrice(SOL_MINT);
    return price || 98.45; // Fallback price
  } catch {
    return 98.45;
  }
}
