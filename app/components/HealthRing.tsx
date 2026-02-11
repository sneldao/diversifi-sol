'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HealthRingProps {
  score: number;
  insights: string[];
  isLoading?: boolean;
}

export function HealthRing({ score, insights, isLoading }: HealthRingProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-6">
        <div className="animate-pulse flex items-center justify-center">
          <div className="w-40 h-40 rounded-full bg-emerald-500/10" />
        </div>
      </div>
    );
  }

  const getScoreColor = (s: number) => {
    if (s >= 75) return 'text-emerald-400';
    if (s >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 75) return 'Excellent';
    if (s >= 50) return 'Good';
    if (s >= 25) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-6"
    >
      <h3 className="text-emerald-400 text-sm font-medium mb-6 text-center">Portfolio Health</h3>
      
      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r="45"
            fill="none"
            stroke="rgba(16, 185, 129, 0.1)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <motion.circle
            cx="96"
            cy="96"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className={cn(getScoreColor(score))}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className={cn('text-4xl font-bold', getScoreColor(score))}
          >
            {score}
          </motion.span>
          <span className="text-slate-400 text-sm">{getScoreLabel(score)}</span>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 space-y-2">
        {insights.map((insight, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            className="text-sm text-slate-300 bg-slate-800/50 rounded-lg px-3 py-2"
          >
            {insight}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}
