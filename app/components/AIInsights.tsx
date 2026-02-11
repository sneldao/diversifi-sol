'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield, TrendingUp } from 'lucide-react';

interface AIInsightsProps {
  portfolioValue: number;
  healthScore: number;
}

export function AIInsights({ portfolioValue, healthScore }: AIInsightsProps) {
  const insights = [
    {
      icon: TrendingUp,
      title: 'Market Sentiment',
      description: 'DeFi TVL growing 12% this week',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Zap,
      title: 'Yield Optimization',
      description: 'Move 40% to higher APY pools',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Shield,
      title: 'Risk Alert',
      description: 'Reduce exposure to volatile assets',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: Sparkles,
      title: 'Rebalancing',
      description: 'Consider adding stablecoins',
      color: 'from-blue-500 to-indigo-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-emerald-400" />
        <h3 className="text-emerald-400 text-sm font-medium">AI-Powered Insights</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800/70 transition-colors cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${insight.color} flex items-center justify-center mb-3`}>
              <insight.icon className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-white font-medium text-sm mb-1">{insight.title}</h4>
            <p className="text-slate-400 text-xs">{insight.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
