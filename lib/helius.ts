// lib/helius.ts - Helius RPC integration for Solana portfolio data

interface HeliusToken {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
  category: string;
}

// Get Helius API key from environment
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

// Build proper Helius RPC URL (API key as query param)
const getHeliusUrl = (path: string) => {
  if (!HELIUS_API_KEY) {
    return null;
  }
  return `https://api.helius.xyz/v0${path}?api-key=${HELIUS_API_KEY}`;
};

// RWA token definitions
const RWA_TOKENS: Record<string, { symbol: string; name: string; category: string }> = {
  'bSo13r1T4sSxyB1z9Ts6Z7J6K4q5Zr8Z6y5x4w3v2u1t0': { symbol: 'bSOL', name: 'Backed SOL', category: 'U.S. Treasuries' },
  'onkEn4i2B1D3Uq8Q7m8qZ5y4x3w2v1u0t9s8r7p6o5n4m': { symbol: 'ONDO', name: 'Ondo USD Yield', category: 'U.S. Treasuries' },
  'mP1p2o3n4i5t6o7r8e9s1s2M3P4L5E6F7I8N9A10N11C12E': { symbol: 'MP1', name: 'Maple USDC', category: 'Private Credit' },
};

export async function getPortfolio(walletAddress: string): Promise<{
  totalValue: number;
  tokens: HeliusToken[];
  lastUpdated: string;
} | null> {
  try {
    // If no Helius API key, return demo data
    if (!HELIUS_API_KEY) {
      console.log('No HELIUS_API_KEY - returning demo data');
      return {
        totalValue: 12458.92,
        tokens: [
          { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', name: 'USD Coin', balance: 5234.56, price: 1, value: 5234.56, category: 'Stablecoins' },
          { mint: 'So11111111111111111111111111111111111111112', symbol: 'SOL', name: 'Solana', balance: 145.23, price: 98.45, value: 14298.50, category: 'Layer 1' },
          { mint: 'mSoLzYCxHdYgdzU8g95Q6kkcj8D4wvTXEUkNLv17rPi', symbol: 'MSOL', name: 'Marinade Staked SOL', balance: 32.45, price: 118.92, value: 3859.00, category: 'Liquid Staking' },
        ],
        lastUpdated: new Date().toISOString(),
      };
    }

    const tokenUrl = getHeliusUrl(`/addresses/${walletAddress}/tokens`);
    
    if (!tokenUrl) {
      return null;
    }

    const response = await fetch(tokenUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Helius API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (!data.result) {
      console.error('Helius API error: No result in response');
      return null;
    }

    // Process tokens from Helius response
    const rawTokens = data.result.tokens || [];
    
    const tokens: HeliusToken[] = rawTokens.map((token: { mint: string; symbol?: string; name?: string; balance: number }) => {
      const rwaInfo = RWA_TOKENS[token.mint] || 
        rawTokens.find((t: { mint: string; symbol: string }) => t.mint === token.mint && (t.symbol === 'bSOL' || t.symbol === 'ONDO' || t.symbol === 'MP1'));

      return {
        mint: token.mint,
        symbol: token.symbol || rwaInfo?.symbol || 'Unknown',
        name: token.name || rwaInfo?.name || 'Unknown Token',
        balance: token.balance,
        price: token.price || 0,
        value: (token.balance || 0) * (token.price || 0),
        category: rwaInfo?.category || 'Other',
      };
    });

    const totalValue = tokens.reduce((sum, token) => sum + token.value, 0);

    return {
      totalValue,
      tokens,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Helius API error:', error);
    return null;
  }
}

export async function getTokenPrice(mint: string): Promise<number | null> {
  try {
    const priceUrl = getHeliusUrl(`/tokens/${mint}`);
    
    if (!priceUrl) {
      return null;
    }

    const response = await fetch(priceUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Helius price API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.result?.price || null;
  } catch (error) {
    console.error('Helius price API error:', error);
    return null;
  }
}
