// lib/performance/optimizations.ts - Performance optimization utilities

// Lazy load import
export async function lazy<T>(module: () => Promise<{ default: T }>): Promise<T> {
  const mod = await module();
  return mod.default;
}

// Memoization with TTL
function memoizeWithTTL<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ttlMs: number
): T {
  const cache = new Map<string, { value: unknown; expires: number }>();
  
  return ((...args: unknown[]) => {
    const key = JSON.stringify(args);
    const entry = cache.get(key);
    
    if (entry && Date.now() < entry.expires) {
      return entry.value;
    }
    
    const result = fn(...args);
    cache.set(key, { value: result, expires: Date.now() + ttlMs });
    
    return result;
  }) as T;
}

// Batch async operations
export async function batch<T>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<unknown>
): Promise<unknown[]> {
  const results: unknown[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const result = await processor(batch);
    results.push(result);
  }
  
  return results;
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

// Throttle function
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let lastRun = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun >= limitMs) {
      lastRun = now;
      fn(...args);
    }
  };
}

// Chunk array for processing
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Parallel with concurrency limit
export async function parallel<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];
  
  for (const task of tasks) {
    const p = Promise.resolve(task()).then(result => {
      results.push(result);
    });
    
    executing.push(p);
    
    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(e => e === p), 1);
    }
  }
  
  await Promise.all(executing);
  return results;
}
