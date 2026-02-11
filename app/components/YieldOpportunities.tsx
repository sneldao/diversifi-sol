'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowRight, Zap, Shield, TrendingUp, ExternalLink } from 'lucide-react';

interface YieldOpportunity {
  protocol: string;
  token: string;
  apy: number;
  tvl: number;
  risk: 'low' | 'medium' | 'high';
  chain: string;
}

interface YieldOpportunitiesProps {
  opportunities: YieldOpportunity[];
  portfolioValue?: number;
}

export function YieldOpportunities({ opportunities, portfolioValue = 0 }: YieldOpportunitiesProps) {
  const [selected, setSelected] = useState<string | null>(null);

  // Sort by APY descending
  const sortedOpps = [...opportunities].sort((a, b) => b.apy - a.apy);

  const formatTVL = (tvl: number) => {
    if (tvl >= 1000000) return `$${(tvl / 1000000).toFixed(1)}M`;
    if (tvl >= 1000) return `$${(tvl / 1000).toFixed(1)}K`;
    return `$${tvl.toFixed(0)}`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'low': return 'Low Risk';
      case 'medium': return 'Medium';
      case 'high': return 'High Risk';
      default: return risk;
    }
  };

  // Calculate potential earnings
  const calculatePotential = (apy: number) => {
    if (!portfolioValue) return '-';
    const earnings = portfolioValue * (apy / 100);
    return `+$${earnings.toFixed(2)}/yr`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-6"
      role="region"
      aria-label="Yield Opportunities"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" aria-hidden="true" />
          <h3 className="text-white text-lg font-semibold">Yield Opportunities</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <TrendingUp className="w-3 h-3" aria-hidden="true" />
          <span>Best rates live</span>
        </div>
      </div>

      {/* Best opportunity highlight */}
      {sortedOpps[0] && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 border border-emerald-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-emerald-400 text-xs font-medium">TOP PICK</span>
                <span className="text-white font-semibold">{sortedOpps[0].protocol}</span>
              </div>
              <div className="text-slate-300 text-sm">
                Earn <span className="text-emerald-400 font-bold">{sortedOpps[0].apy}% APY</span> on {sortedOpps[0].token}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium flex items-center gap-2"
              aria-label={`Deposit into ${sortedOpps[0].protocol}`}
            >
              Deposit
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Opportunities list */}
      <div className="space-y-3" role="list" aria-label="DeFi yield opportunities">
        {sortedOpps.slice(0, 5).map((opp, index) => (
          <motion.div
            key={`${opp.protocol}-${opp.token}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelected(selected === `${opp.protocol}-${opp.token}` ? null : `${opp.protocol}-${opp.token}`)}
            onKeyDown={(e) => e.key === 'Enter' && setSelected(selected === `${opp.protocol}-${opp.token}` ? null : `${opp.protocol}-${opp.token}`)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selected === `${opp.protocol}-${opp.token}`
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
            }`}
            role="listitem"
            tabIndex={0}
            aria-expanded={selected === `${opp.protocol}-${opp.token}`}
            aria-label={`${opp.protocol} - ${opp.apy}% APY, ${opp.risk} risk`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-bold text-white" aria-hidden="true">
                  {opp.protocol.slice(0, 3).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{opp.protocol}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getRiskColor(opp.risk)}`}>
                      {getRiskLabel(opp.risk)}
                    </span>
                  </div>
                  <div className="text-slate-400 text-sm">{opp.token} • TVL {formatTVL(opp.tvl)}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-emerald-400 font-bold text-lg">{opp.apy.toFixed(1)}%</div>
                <div className="text-slate-500 text-xs">{calculatePotential(opp.apy)}</div>
              </div>
            </div>

            {/* Expanded details */}
            {selected === `${opp.protocol}-${opp.token}` && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-slate-700"
              >
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-slate-500 text-xs">APY</div>
                    <div className="text-emerald-400 font-semibold">{opp.apy.toFixed(2)}%</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs">TVL</div>
                    <div className="text-white font-semibold">{formatTVL(opp.tvl)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs">Chain</div>
                    <div className="text-white font-semibold">{opp.chain}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm font-medium"
                    aria-label={`Deposit into ${opp.protocol}`}
                  >
                    Deposit
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium flex items-center justify-center gap-2"
                    aria-label={`View ${opp.protocol} protocol details`}
                  >
                    View Protocol
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
