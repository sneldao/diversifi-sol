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

export function getMetrics() {
  return metrics;
}
