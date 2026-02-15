const API_KEYS = new Map<string, { name: string; rateLimit: number; scopes: string[]; createdAt: string }>();

export function createApiKey(name: string, rateLimit = 100, scopes = ['read']) {
  const key = `df_${Date.now()}_${Math.random().toString(36).slice(2, 16)}`;
  API_KEYS.set(key, { name, rateLimit, scopes, createdAt: new Date().toISOString() });
  return key;
}

export function getApiKeyInfo(key: string) {
  return API_KEYS.get(key);
}

export function listApiKeys() {
  return Array.from(API_KEYS.entries()).map(([k, v]) => ({ 
    key: k.slice(0, 10) + '...', 
    name: v.name, 
    scopes: v.scopes 
  }));
}

export function deleteApiKey(key: string) {
  return API_KEYS.delete(key);
}

export function validateApiKey(key: string | null): boolean {
  if (!key) return false;
  return API_KEYS.has(key);
}
