'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, ExternalLink, TrendingUp, TrendingDown, Wallet, Activity } from 'lucide-react';

interface TokenDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: {
    symbol: string;
    name: string;
    balance: number;
    price: number;
    value: number;
    change24h?: number;
    changePercent?: number;
  };
}

export function TokenDetailModal({ isOpen, onClose, token }: TokenDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'analytics'>('overview');

  if (!isOpen) return null;

  const changeColor = (token.changePercent || 0) >= 0 ? 'text-emerald-400' : 'text-red-400';
  const ChangeIcon = (token.changePercent || 0) >= 0 ? TrendingUp : TrendingDown;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/20 rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-emerald-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {token.symbol.slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{token.name}</h3>
                  <p className="text-slate-400 text-sm">{token.symbol}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-emerald-500/10">
            {[
              { id: 'overview', label: 'Overview', icon: Wallet },
              { id: 'transactions', label: 'Transactions', icon: Activity },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Balance */}
                <div className="p-4 rounded-xl bg-slate-800/50">
                  <div className="text-slate-400 text-sm mb-1">Your Balance</div>
                  <div className="text-2xl font-bold text-white">
                    {token.balance.toLocaleString()} {token.symbol}
                  </div>
                  <div className="text-slate-400 text-sm">
                    ${token.value.toLocaleString()}
                  </div>
                </div>

                {/* Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-800/50">
                    <div className="text-slate-400 text-sm mb-1">Current Price</div>
                    <div className="text-xl font-bold text-white">
                      ${token.price.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/50">
                    <div className="text-slate-400 text-sm mb-1">24h Change</div>
                    <div className={`flex items-center gap-2 text-xl font-bold ${changeColor}`}>
                      <ChangeIcon className="w-5 h-5" />
                      {token.changePercent?.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="py-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-medium transition-colors">
                    Send
                  </button>
                  <button className="py-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-medium transition-colors">
                    Swap
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i % 2 === 0 ? 'bg-emerald-500/20' : 'bg-cyan-500/20'}`}>
                        {i % 2 === 0 ? (
                          <TrendingDown className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">
                          {i % 2 === 0 ? 'Received' : 'Sent'}
                        </div>
                        <div className="text-slate-400 text-xs">2 hours ago</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${i % 2 === 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {i % 2 === 0 ? '+' : '-'}${Math.floor(Math.random() * 1000)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/50">
                  <div className="text-slate-400 text-sm mb-2">Portfolio Allocation</div>
                  <div className="h-3 rounded-full bg-slate-700 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                      style={{ width: `${token.value / 15000 * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-slate-400">
                    <span>0%</span>
                    <span>{(token.value / 15000 * 100).toFixed(1)}% of portfolio</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50">
                  <div className="text-slate-400 text-sm mb-2">Risk Assessment</div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs">Low Risk</span>
                    <span className="text-slate-300 text-sm">Stable within portfolio</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-emerald-500/10 bg-slate-900/50">
            <a
              href={`https://solscan.io/token/${token.symbol}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
            >
              View on Solscan
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
