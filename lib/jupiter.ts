const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY;
const BIRDEYE_BASE_URL = 'https://api.birdeye.so';

export interface YieldOpportunity {
  protocol: string;
  token: string;
  apy: number;
  tvl: number;
  risk: 'low' | 'medium' | 'high';
  chain: string;
}

export async function getYieldOpportunities(): Promise<YieldOpportunity[]> {
  try {
    const response = await fetch(
      `${BIRDEYE_BASE_URL}/v1/defi/yield?chain=solana`,
      {
        method: 'GET',
        headers: {
          'X-API-KEY': BIRDEYE_API_KEY || '',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch yields');
    }

    const data = await response.json();
    
    // Transform and return yield opportunities
    interface PoolData {
      protocol?: string;
      tokenName?: string;
      symbol?: string;
      apy?: number;
      tvl?: number;
      risk?: 'low' | 'medium' | 'high';
      chain?: string;
    }
    return (data.data?.pools || []).slice(0, 10).map((pool: PoolData) => ({
      protocol: pool.protocol || 'Unknown',
      token: pool.tokenName || pool.symbol || 'Unknown',
      apy: pool.apy || 0,
      tvl: pool.tvl || 0,
      risk: pool.risk || 'medium',
      chain: pool.chain || 'Solana',
    }));
  } catch (error) {
    console.error('Birdeye API error:', error);
    // Return mock data as fallback
    return getMockYieldOpportunities();
  }
}

export async function getTokenPrice(token: string): Promise<number | null> {
  try {
    const response = await fetch(
      `${BIRDEYE_BASE_URL}/v1/defi/price?token=${token}`,
      {
        method: 'GET',
        headers: {
          'X-API-KEY': BIRDEYE_API_KEY || '',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data?.value || null;
  } catch (error) {
    console.error('Error fetching token price from Birdeye:', error);
    return null;
  }
}

function getMockYieldOpportunities(): YieldOpportunity[] {
  return [
    { protocol: 'Solend', token: 'USDC', apy: 8.5, tvl: 45000000, risk: 'low', chain: 'Solana' },
    { protocol: 'Mango Markets', token: 'USDC', apy: 12.3, tvl: 28000000, risk: 'medium', chain: 'Solana' },
    { protocol: 'Tulip', token: 'USDC', apy: 15.7, tvl: 12000000, risk: 'high', chain: 'Solana' },
    { protocol: 'Saber', token: 'USDC-USDT', apy: 6.2, tvl: 89000000, risk: 'low', chain: 'Solana' },
    { protocol: 'Raydium', token: 'RAY', apy: 24.5, tvl: 15000000, risk: 'high', chain: 'Solana' },
    { protocol: 'Orca', token: 'USDC', apy: 9.8, tvl: 22000000, risk: 'low', chain: 'Solana' },
    { protocol: ' Mercurial', token: 'USDC', apy: 7.4, tvl: 18000000, risk: 'low', chain: 'Solana' },
    { protocol: 'Drift', token: 'USDC', apy: 11.2, tvl: 35000000, risk: 'medium', chain: 'Solana' },
    { protocol: 'Friktion', token: 'USDC', apy: 14.8, tvl: 8000000, risk: 'medium', chain: 'Solana' },
    { protocol: 'Shadow', token: 'USDC', apy: 18.9, tvl: 6000000, risk: 'high', chain: 'Solana' },
  ];
}
