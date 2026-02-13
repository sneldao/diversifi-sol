'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

interface RebalanceData {
  portfolio: {
    totalValue: number;
    tokenCount: number;
    lastUpdated: string;
  };
  allocation: {
    current: Array<{
      symbol: string;
      value: number;
      percentage: number;
    }>;
    target: Record<string, number>;
  };
  rebalancing: {
    needsRebalancing: boolean;
    totalDrift: number;
    suggestions: string[];
    trades: Array<{
      symbol: string;
      currentPercentage: number;
      targetPercentage: number;
      driftPercentage: number;
      valueDiff: number;
      action: string;
    }>;
  };
  diversification: {
    hasRWA: boolean;
    rwaCount: number;
    suggestions: string[];
  };
}

interface RebalancingPanelProps {
  walletAddress: string | null;
  guardianLaunched: boolean;
}

export function RebalancingPanel({ walletAddress, guardianLaunched }: RebalancingPanelProps) {
  const [rebalanceData, setRebalanceData] = useState<RebalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress || !guardianLaunched) return;

    async function fetchRebalance() {
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`/api/rebalance?wallet=${walletAddress}`);
        if (!res.ok) throw new Error('Failed to fetch rebalance data');
        
        const data = await res.json();
        if (data.success) {
          setRebalanceData(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch rebalance data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRebalance();
  }, [walletAddress, guardianLaunched]);

  if (!guardianLaunched) return null;
  
  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-6 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
          <h3 className="text-white font-semibold">Analyzing Portfolio...</h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-xl p-6 border border-red-500/30">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <h3 className="text-white font-semibold">Analysis Unavailable</h3>
        </div>
        <p className="text-slate-400 text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (!rebalanceData) return null;

  const { allocation, rebalancing, diversification } = rebalanceData;

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {rebalancing.needsRebalancing ? (
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          )}
          <h3 className="text-white font-semibold">Portfolio Rebalancing</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          rebalancing.needsRebalancing 
            ? 'bg-yellow-500/20 text-yellow-400' 
            : 'bg-emerald-500/20 text-emerald-400'
        }`}>
          {rebalancing.needsRebalancing ? 'Action Needed' : 'Balanced'}
        </span>
      </div>

      {/* Diversification Suggestions (for wallets without RWA) */}
      {!diversification.hasRWA && diversification.suggestions.length > 0 && (
        <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h4 className="text-emerald-400 font-semibold">Diversification Opportunity</h4>
          </div>
          <div className="space-y-2">
            {diversification.suggestions.map((suggestion, idx) => (
              <p key={idx} className="text-slate-300 text-sm">{suggestion}</p>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-emerald-500/20">
            <p className="text-xs text-slate-500">
              💡 RWA tokens provide yield from real-world assets (treasuries, private credit)
            </p>
          </div>
        </div>
      )}

      {/* Allocation Chart */}
      {diversification.hasRWA && (
        <div className="mb-6">
          <h4 className="text-slate-400 text-sm mb-3">Current vs Target Allocation</h4>
          <div className="space-y-3">
            {allocation.current.map((token) => {
              const target = allocation.target[token.symbol.replace('bSOL', 'bSOL').replace('MP1', 'MP1').replace('ONDO', 'ONDO') as keyof typeof allocation.target] || 0;
              const drift = token.percentage - (target * 100);
              
              return (
                <div key={token.symbol} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">{token.symbol}</span>
                    <span className="text-slate-400">
                      {token.percentage.toFixed(1)}% / {Math.round(target * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        drift > 5 ? 'bg-red-500' : drift < -5 ? 'bg-yellow-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(token.percentage, 100)}%` }}
                    />
                  </div>
                  {Math.abs(drift) > 5 && (
                    <p className={`text-xs ${drift > 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                      {drift > 0 ? 'Overweight' : 'Underweight'} by {Math.abs(drift).toFixed(1)}%
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rebalancing Suggestions */}
      {rebalancing.needsRebalancing && rebalancing.suggestions.length > 0 && diversification.hasRWA && (
        <div className="border-t border-slate-700/50 pt-4">
          <h4 className="text-slate-400 text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Recommendations
          </h4>
          <div className="space-y-2">
            {rebalancing.suggestions.map((suggestion, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/50"
              >
                {suggestion.includes('Reduce') ? (
                  <TrendingDown className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                )}
                <span className="text-slate-300 text-sm">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!rebalancing.needsRebalancing && diversification.hasRWA && (
        <div className="border-t border-slate-700/50 pt-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm">Your portfolio is well-balanced!</span>
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <p className="text-xs text-slate-500 text-center">
          Last analyzed: {new Date(rebalanceData.portfolio.lastUpdated).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
