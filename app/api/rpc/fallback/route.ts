import { successResponse } from '@/lib/api-utils';

// Fallback RPC endpoints
const FALLBACK_RPCS = {
  solana: [
    { url: 'https://api.mainnet-beta.solana.com', priority: 1 },
    { url: 'https://solana-api.projectserum.com', priority: 2 },
    { url: 'https://rpc.ankr.com/solana', priority: 3 },
  ],
  celo: [
    { url: 'https://forno.celo.org', priority: 1 },
    { url: 'https://celo-mainnet.g.alchemy.com/v2/demo', priority: 2 },
    { url: 'https://rpc.ankr.com/celo', priority: 3 },
  ],
};

export async function GET() {
  return successResponse({
    solana: FALLBACK_RPCS.solana.map(r => ({ url: r.url, status: 'unknown' })),
    celo: FALLBACK_RPCS.celo.map(r => ({ url: r.url, status: 'unknown' })),
  });
}

// Get best available RPC
export async function POST(request: Request) {
  const { chain } = await request.json();
  
  if (!chain || !FALLBACK_RPCS[chain as keyof typeof FALLBACK_RPCS]) {
    return Response.json({ error: 'Invalid chain' }, { status: 400 });
  }

  const rpcs = FALLBACK_RPCS[chain as keyof typeof FALLBACK_RPCS];
  
  // Test each RPC in priority order
  for (const rpc of rpcs) {
    try {
      const start = Date.now();
      const response = await fetch(rpc.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getHealth' }),
        signal: AbortSignal.timeout(3000),
      });
      
      const latency = Date.now() - start;
      
      if (response.ok) {
        return successResponse({
          url: rpc.url,
          latency: `${latency}ms`,
          status: 'healthy',
        });
      }
    } catch (error) {
      console.log(`RPC ${rpc.url} failed:`, error);
    }
  }

  return Response.json({ error: 'All RPCs failed', status: 503 });
}
