// lib/security/sanitization.ts - Input sanitization and validation

// Sanitize user input to prevent XSS
export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Validate and sanitize wallet address
export function sanitizeWalletAddress(address: string | null, chain: 'solana' | 'celo'): string | null {
  if (!address) return null;
  
  const sanitized = sanitizeInput(address.trim());
  
  if (chain === 'solana') {
    // Solana: base58, 32-44 chars
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(sanitized)) {
      return null;
    }
  } else {
    // Celo: ethereum-style
    if (!/^0x[a-fA-F0-9]{40}$/.test(sanitized)) {
      return null;
    }
  }
  
  return sanitized;
}

// Sanitize URL to prevent SSRF
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    
    // Block private IPs
    const hostname = parsed.hostname;
    if (hostname === 'localhost' || 
        hostname.startsWith('127.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('172.16.') ||
        hostname.startsWith('0.')) {
      return null;
    }
    
    return url;
  } catch {
    return null;
  }
}

// Sanitize amount to prevent floating point errors
export function sanitizeAmount(amount: number, decimals: number = 8): number {
  return Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// Validate API key format
export function validateApiKeyFormat(key: string): boolean {
  // Allow alphanumeric keys, min 16 chars
  return /^[a-zA-Z0-9_-]{16,}$/.test(key);
}

// Sanitize HTML for display
export function sanitizeHtml(html: string): string {
  // Allow only safe tags
  const allowedTags = ['b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'p', 'br'];
  const allowedAttrs = { 'a': ['href', 'title'] };
  
  // Simple implementation - in production use DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
}

// Rate limit key generation (prevent injection)
export function sanitizeRateLimitKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 100);
}
