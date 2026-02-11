'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface YieldOpportunity {
  protocol: string;
  token: string;
  apy: number;
  tvl: number;
  risk: 'low' | 'medium' | 'high';
  chain: string;
}

interface YieldListProps {
  opportunities: YieldOpportunity[];
  isLoading?: boolean;
}

export function YieldList({ opportunities, isLoading }: YieldListProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-6">
        <h3 className="text-emerald-400 text-sm font-medium mb-4">Top Yield Opportunities</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-emerald-500/10 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return null;
    }
  };

  const getRiskBg = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-emerald-500/20 border-emerald-500/30';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'high': return 'bg-red-500/20 border-red-500/30';
      default: return 'bg-slate-800/50 border-slate-700/50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-emerald-400 text-sm font-medium">Top Yield Opportunities</h3>
        <TrendingUp className="w-4 h-4 text-emerald-400" />
      </div>
      
      <div className="space-y-3">
        {opportunities.map((opp, index) => (
          <motion.div
            key={`${opp.protocol}-${opp.token}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'p-4 rounded-xl border transition-all hover:scale-[1.02]',
              getRiskBg(opp.risk)
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{opp.protocol}</span>
                <span className="text-slate-400 text-sm">/ {opp.token}</span>
              </div>
              <div className="flex items-center gap-2">
                {getRiskIcon(opp.risk)}
                <span className={cn(
                  'text-lg font-bold',
                  opp.apy > 10 ? 'text-emerald-400' : 'text-white'
                )}>
                  {opp.apy.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>TVL: {formatCurrency(opp.tvl)}</span>
              <span className="capitalize">{opp.chain}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
