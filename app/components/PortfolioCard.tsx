'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';

interface Token {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
}

interface PortfolioCardProps {
  tokens: Token[];
  totalValue: number;
  isLoading?: boolean;
}

export function PortfolioCard({ tokens, totalValue, isLoading }: PortfolioCardProps) {
  const change = 5.23; // Mock 24h change
  const isPositive = change >= 0;

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-emerald-500/10 rounded w-24 mb-4" />
          <div className="h-10 bg-emerald-500/10 rounded w-48 mb-2" />
          <div className="h-3 bg-emerald-500/10 rounded w-20" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-emerald-400 text-sm font-medium">Portfolio Value</h3>
        <div className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
          isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
        )}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {formatPercentage(change)}
        </div>
      </div>
      
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="text-4xl font-bold text-white mb-2"
      >
        {formatCurrency(totalValue)}
      </motion.div>
      
      <p className="text-slate-400 text-sm">
        {tokens.length} asset{tokens.length !== 1 ? 's' : ''} across chains
      </p>

      {/* Asset breakdown */}
      <div className="mt-6 space-y-3">
        {tokens.slice(0, 5).map((token, index) => (
          <motion.div
            key={token.mint}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white">
                {token.symbol.slice(0, 2)}
              </div>
              <div>
                <p className="text-white font-medium">{token.symbol}</p>
                <p className="text-slate-400 text-xs">{token.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">{formatCurrency(token.value)}</p>
              <p className="text-slate-400 text-xs">{token.balance.toFixed(4)} {token.symbol}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
