import { successResponse } from '@/lib/api-utils';
import { getPendingRequestsSize } from '@/lib/pool';

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
    pendingRequests: getPendingRequestsSize(),
  });
}
