// Request coalescing - dedupe identical concurrent requests
const pendingRequests = new Map<string, Promise<unknown>>();

export async function coalesce<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 5000
): Promise<T> {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }

  const promise = fetcher().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);

  setTimeout(() => {
    pendingRequests.delete(key);
  }, ttlMs);

  return promise;
}

export function getPendingRequestsSize() {
  return pendingRequests.size;
}
