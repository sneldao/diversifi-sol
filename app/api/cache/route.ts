import { successResponse } from '@/lib/api-utils';

// In-memory cache with TTL
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class ResponseCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private hits = 0;
  private misses = 0;

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.expiresAt) {
      this.hits++;
      return entry.data as T;
    }
    this.cache.delete(key);
    this.misses++;
    return null;
  }

  set<T>(key: string, data: T, ttlSeconds: number = 30): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  invalidate(pattern: string): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  getStats() {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? `${((this.hits / total) * 100).toFixed(1)}%` : '0%',
    };
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
}

const cache = new ResponseCache();

// Cache endpoint
export async function GET() {
  return successResponse({ 
    cache: cache.getStats(),
    keys: Array.from(cache['cache'].keys()).slice(0, 20),
  });
}

export async function DELETE() {
  cache.clear();
  return successResponse({ cleared: true });
}

export { cache };
