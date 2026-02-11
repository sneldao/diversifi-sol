import { NextResponse } from 'next/server';

// Health check response
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    api: {
      status: 'up' | 'down';
      latency?: number;
      error?: string;
    };
    helius: {
      status: 'up' | 'down' | 'unknown';
      latency?: number;
      error?: string;
    };
    birdeye: {
      status: 'up' | 'down' | 'unknown';
      latency?: number;
      error?: string;
    };
  };
}

export async function GET() {
  const start = Date.now();
  const checks: HealthStatus['checks'] = {
    api: { status: 'up' },
    helius: { status: 'unknown' },
    birdeye: { status: 'unknown' },
  };

  // Check Helius RPC
  try {
    const heliusStart = Date.now();
    const heliusUrl = process.env.HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const response = await fetch(heliusUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getClusterNodes',
      }),
      signal: AbortSignal.timeout(5000),
    });
    checks.helius = {
      status: response.ok ? 'up' : 'down',
      latency: Date.now() - heliusStart,
    };
  } catch (error) {
    checks.helius = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Check Birdeye API
  try {
    const birdeyeStart = Date.now();
    const birdeyeKey = process.env.BIRDEYE_API_KEY;
    if (birdeyeKey) {
      const response = await fetch('https://public-api.birdeye.so/public/solana/info', {
        headers: { 'x-api-key': birdeyeKey },
        signal: AbortSignal.timeout(5000),
      });
      checks.birdeye = {
        status: response.ok ? 'up' : 'down',
        latency: Date.now() - birdeyeStart,
      };
    }
  } catch (error) {
    checks.birdeye = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Calculate overall status
  const allUp = Object.values(checks).every(c => c.status === 'up');
  const hasDown = Object.values(checks).some(c => c.status === 'down');
  
  let status: HealthStatus['status'] = 'healthy';
  if (hasDown) {
    status = 'degraded';
    // Only unhealthy if API itself is down
    if (checks.api.status === 'down') {
      status = 'unhealthy';
    }
  }

  const healthStatus: HealthStatus = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    checks,
  };

  return NextResponse.json(healthStatus, {
    status: status === 'unhealthy' ? 503 : 200,
  });
}
