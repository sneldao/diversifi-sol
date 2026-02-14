import { NextResponse } from 'next/server';
import { successResponse } from '@/lib/api-utils';

// In-memory metrics (use Prometheus/statsd in production)
const metrics = {
  requests: { total: 0, success: 0, errors: 0, byEndpoint: {} as Record<string, number> },
  latency: { sum: 0, count: 0, p50: 0, p95: 0, p99: 0 },
  blockchain: {
    solana: { calls: 0, errors: 0, avgLatency: 0 },
    celo: { calls: 0, errors: 0, avgLatency: 0 },
  },
  cache: { hits: 0, misses: 0, hitRate: 0 },
  rateLimited: 0,
  startTime: Date.now(),
};

export function recordRequest(endpoint: string, success: boolean, latencyMs: number) {
  metrics.requests.total++;
  if (success) metrics.requests.success++;
  else metrics.requests.errors++;
  
  metrics.requests.byEndpoint[endpoint] = (metrics.requests.byEndpoint[endpoint] || 0) + 1;
  
  metrics.latency.sum += latencyMs;
  metrics.latency.count++;
  
  // Calculate percentiles (simplified)
  if (metrics.latency.count % 100 === 0) {
    metrics.latency.p50 = metrics.latency.sum / metrics.latency.count;
    metrics.latency.p95 = metrics.latency.p50 * 1.5;
    metrics.latency.p99 = metrics.latency.p50 * 2;
  }
}

export function recordBlockchainCall(chain: 'solana' | 'celo', latencyMs: number, error: boolean) {
  metrics.blockchain[chain].calls++;
  if (error) metrics.blockchain[chain].errors++;
  
  const prev = metrics.blockchain[chain].avgLatency;
  const count = metrics.blockchain[chain].calls;
  metrics.blockchain[chain].avgLatency = (prev * (count - 1) + latencyMs) / count;
}

export function recordCacheHit(hit: boolean) {
  if (hit) metrics.cache.hits++;
  else metrics.cache.misses++;
  
  const total = metrics.cache.hits + metrics.cache.misses;
  metrics.cache.hitRate = total > 0 ? (metrics.cache.hits / total) * 100 : 0;
}

export function recordRateLimit() {
  metrics.rateLimited++;
}

export async function GET() {
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
