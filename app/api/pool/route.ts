import { successResponse } from '@/lib/api-utils';

// Request coalescing - dedupe identical concurrent requests
const pendingRequests = new Map<string, Promise<unknown>>();

export async function coalesce<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 5000
): Promise<T> {
  // Check if there's already a pending request
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }

  // Create new request
  const promise = fetcher().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);

  // Auto-cleanup after TTL
  setTimeout(() => {
    pendingRequests.delete(key);
  }, ttlMs);

  return promise;
}

// Connection pool simulation
class ConnectionPool {
  private available = 10;
  private inUse = 0;
  private waitQueue: Array<() => void> = [];

  async acquire(): Promise<void> {
    if (this.available > 0) {
      this.available--;
      this.inUse++;
      return;
    }

    return new Promise(resolve => {
      this.waitQueue.push(resolve);
    });
  }

  release(): void {
    this.inUse--;
    if (this.waitQueue.length > 0) {
      this.available++;
      const next = this.waitQueue.shift();
      if (next) {
        this.inUse++;
        next();
      }
    }
  }

  getStats() {
    return {
      available: this.available,
      inUse: this.inUse,
      waitQueue: this.waitQueue.length,
    };
  }
}

const rpcPool = new ConnectionPool();
const dbPool = new ConnectionPool();

export async function GET() {
  return successResponse({
    rpc: rpcPool.getStats(),
    database: dbPool.getStats(),
    pendingRequests: pendingRequests.size,
  });
}

export { rpcPool, dbPool };
