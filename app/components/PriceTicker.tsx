'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent: number;
}

const INITIAL_PRICES: PriceData[] = [
  { symbol: 'SOL', price: 98.45, change24h: 2.34, changePercent: 2.44 },
  { symbol: 'BTC', price: 43250.00, change24h: 850.00, changePercent: 2.01 },
  { symbol: 'ETH', price: 2280.50, change24h: -45.20, changePercent: -1.94 },
  { symbol: 'USDC', price: 1.00, change24h: 0.00, changePercent: 0.00 },
  { symbol: 'JUP', price: 0.89, change24h: 0.05, changePercent: 5.95 },
  { symbol: 'BONK', price: 0.0000234, change24h: 0.0000012, changePercent: 5.41 },
];

export function PriceTicker() {
  const [prices, setPrices] = useState<PriceData[]>(INITIAL_PRICES);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(coin => ({
        ...coin,
        price: coin.price * (1 + (Math.random() - 0.5) * 0.002), // ±0.1% change
        change24h: coin.change24h + (Math.random() - 0.5) * 0.5,
      })));
      setLastUpdate(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number, symbol: string) => {
    if (price < 0.01) {
      return price.toFixed(8);
    } else if (price < 1) {
      return price.toFixed(4);
    }
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatChange = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <div className="w-full overflow-hidden bg-slate-900/60 backdrop-blur-sm border-y border-emerald-500/10">
      <div className="flex items-center gap-6 py-2 px-4">
        <div className="flex items-center gap-2 text-xs text-emerald-400 whitespace-nowrap">
          <Zap className="w-3 h-3 animate-pulse" />
          <span>Live</span>
        </div>
        
        <div className="flex gap-8 animate-ticker">
          {[...prices, ...prices].map((coin, i) => (
            <motion.div
              key={`${coin.symbol}-${i}`}
              className="flex items-center gap-2 text-sm whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="font-semibold text-white">{coin.symbol}</span>
              <span className="text-slate-300">${formatPrice(coin.price, coin.symbol)}</span>
              <span className={`flex items-center gap-0.5 ${
                coin.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {coin.changePercent >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {formatChange(coin.changePercent)}
              </span>
            </motion.div>
          ))}
        </div>
        
        <div className="text-xs text-slate-500 ml-auto whitespace-nowrap">
          Updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
