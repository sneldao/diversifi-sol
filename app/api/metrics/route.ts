import { NextResponse } from 'next/server';
import { successResponse } from '@/lib/api-utils';
import { getMetrics } from '@/lib/metrics';

export async function GET() {
  const metrics = getMetrics();
  const uptime = Date.now() - metrics.startTime;
  
  return successResponse({
    uptime: `${Math.round(uptime / 1000 / 60)} minutes`,
    requests: {
      total: metrics.requests.total,
      successRate: metrics.requests.total > 0 
        ? `${((metrics.requests.success / metrics.requests.total) * 100).toFixed(1)}%`
        : '0%',
      errors: metrics.requests.errors,
      byEndpoint: metrics.requests.byEndpoint,
    },
    latency: {
      avg: `${(metrics.latency.sum / metrics.latency.count || 0).toFixed(0)}ms`,
      p50: `${metrics.latency.p50.toFixed(0)}ms`,
      p95: `${metrics.latency.p95.toFixed(0)}ms`,
      p99: `${metrics.latency.p99.toFixed(0)}ms`,
    },
    blockchain: {
      solana: metrics.blockchain.solana,
      celo: metrics.blockchain.celo,
    },
    cache: {
      hitRate: `${metrics.cache.hitRate.toFixed(1)}%`,
      hits: metrics.cache.hits,
      misses: metrics.cache.misses,
    },
    rateLimited: metrics.rateLimited,
  });
}
