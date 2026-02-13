'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Zap, RefreshCw } from 'lucide-react';

interface TokenPrice {
  symbol: string;
  price: number;
  value: number;
}

interface PriceTickerProps {
  walletAddress: string | null;
}

export function PriceTicker({ walletAddress }: PriceTickerProps) {
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    if (!walletAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/portfolio?wallet=${walletAddress}`);
      if (!res.ok) throw new Error('Failed to fetch prices');
      
      const data = await res.json();
      if (data.success && data.data?.tokens) {
        // Get top tokens by value
        const tokens = data.data.tokens
          .sort((a: { value: number }, b: { value: number }) => b.value - a.value)
          .slice(0, 6)
          .map((t: { symbol: string; price: number; value: number }) => ({
            symbol: t.symbol,
            price: t.price || 0,
            value: t.value || 0,
          }));
        
        setPrices(tokens);
        setLastUpdate(new Date());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchPrices();
    }
  }, [walletAddress]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!walletAddress) return;
    
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [walletAddress]);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else if (price >= 0.01) {
      return `$${price.toFixed(4)}`;
    }
    return `$${price.toExponential(4)}`;
  };

  if (!walletAddress) {
    return (
      <div className="w-full py-2 px-4 bg-slate-900/40 border-y border-emerald-500/10">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Zap className="w-3 h-3" />
          <span>Connect wallet to see live prices</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-slate-900/60 backdrop-blur-sm border-y border-emerald-500/10">
      <div className="flex items-center gap-4 py-2 px-4">
        <div className="flex items-center gap-2 text-xs text-emerald-400 whitespace-nowrap">
          {isLoading ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Zap className="w-3 h-3" />
          )}
          <span>Live</span>
        </div>
        
        {error ? (
          <div className="text-xs text-red-400">{error}</div>
        ) : prices.length > 0 ? (
          <>
            <div className="flex gap-6 animate-ticker">
              {[...prices, ...prices].map((token, i) => (
                <div
                  key={`${token.symbol}-${i}`}
                  className="flex items-center gap-2 text-sm whitespace-nowrap"
                >
                  <span className="font-semibold text-white">{token.symbol}</span>
                  <span className="text-slate-300">{formatPrice(token.price)}</span>
                </div>
              ))}
            </div>
            
            <div className="text-xs text-slate-500 ml-auto whitespace-nowrap">
              {lastUpdate ? lastUpdate.toLocaleTimeString() : '...'}
            </div>
          </>
        ) : (
          <div className="text-xs text-slate-500">No tokens found</div>
        )}
      </div>
    </div>
  );
}
