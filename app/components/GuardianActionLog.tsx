'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Activity, Shield, TrendingUp, Bell, RefreshCw, Clock } from 'lucide-react';

interface GuardianAction {
  id: string;
  type: 'alert' | 'optimization' | 'rebalance' | 'scan' | 'protection';
  title: string;
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'in_progress';
  impact?: string;
}

interface GuardianActionLogProps {
  walletAddress?: string;
}

export function GuardianActionLog({ walletAddress }: GuardianActionLogProps) {
  const [actions, setActions] = useState<GuardianAction[]>([
    {
      id: '1',
      type: 'scan',
      title: 'Portfolio Scan Complete',
      description: 'Analyzed all token holdings and market conditions',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      status: 'completed',
      impact: 'Health score: 72 → 74',
    },
    {
      id: '2',
      type: 'optimization',
      title: 'Yield Optimization',
      description: 'Identified higher APY opportunities',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      status: 'completed',
      impact: '+$12.45/day potential',
    },
    {
      id: '3',
      type: 'alert',
      title: 'Risk Alert',
      description: 'SOL concentration above recommended threshold',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: 'completed',
      impact: '45% in SOL - consider diversification',
    },
    {
      id: '4',
      type: 'protection',
      title: 'Guardian Deployed',
      description: 'Active protection enabled',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      status: 'completed',
      impact: 'Real-time monitoring active',
    },
    {
      id: '5',
      type: 'rebalance',
      title: 'Rebalancing Suggestion',
      description: 'Move 15% SOL → USDC for stability',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      status: 'pending',
    },
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert': return <Bell className="w-4 h-4" />;
      case 'optimization': return <TrendingUp className="w-4 h-4" />;
      case 'rebalance': return <RefreshCw className="w-4 h-4" />;
      case 'scan': return <Activity className="w-4 h-4" />;
      case 'protection': return <Shield className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'alert': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'optimization': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'rebalance': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'scan': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'protection': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return (
        <span className="flex items-center gap-1 text-xs text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Completed
        </span>
      );
      case 'pending': return (
        <span className="flex items-center gap-1 text-xs text-yellow-400">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          Pending
        </span>
      );
      case 'in_progress': return (
        <span className="flex items-center gap-1 text-xs text-cyan-400">
          <RefreshCw className="w-3 h-3 animate-spin" />
          In Progress
        </span>
      );
      default: return null;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white text-lg font-semibold">Guardian Activity Log</h3>
        </div>
        <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border ${getTypeColor(action.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getTypeColor(action.type)}`}>
                {getTypeIcon(action.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium truncate">{action.title}</span>
                  {getStatusBadge(action.status)}
                </div>
                <p className="text-slate-400 text-sm mb-2">{action.description}</p>
                {action.impact && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <TrendingUp className="w-3 h-3" />
                    {action.impact}
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                  <Clock className="w-3 h-3" />
                  {formatTime(action.timestamp)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-emerald-500/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            <Shield className="w-4 h-4 inline mr-1" />
            Guardian Active
          </span>
          <span className="text-emerald-400">24h uptime</span>
        </div>
      </div>
    </motion.div>
  );
}
