'use client';

import { motion } from 'framer-motion';
import { Shield, AlertTriangle, TrendingDown, PieChart, Activity, Zap } from 'lucide-react';

interface RiskAssessmentProps {
  healthScore: number;
  risks: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    recommendation?: string;
  }[];
  portfolioValue: number;
}

export function RiskAssessment({ healthScore, risks, portfolioValue }: RiskAssessmentProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <Shield className="w-4 h-4" />;
      case 'medium': return <Activity className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      default: return <PieChart className="w-4 h-4" />;
    }
  };

  const getHealthRating = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-emerald-400' };
    if (score >= 60) return { label: 'Good', color: 'text-cyan-400' };
    if (score >= 40) return { label: 'Fair', color: 'text-yellow-400' };
    return { label: 'Needs Attention', color: 'text-red-400' };
  };

  const health = getHealthRating(healthScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-emerald-500/20 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h3 className="text-white text-lg font-semibold">Risk Assessment</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthRating(healthScore).color} bg-current/10`}>
          {health.label}
        </div>
      </div>

      {/* Overall Score */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-800/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-sm">Portfolio Health Score</span>
          <span className={`text-2xl font-bold ${health.color}`}>{healthScore}/100</span>
        </div>
        <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${healthScore}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              healthScore >= 80 ? 'bg-emerald-500' :
              healthScore >= 60 ? 'bg-cyan-500' :
              healthScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
          />
        </div>
      </div>

      {/* Risk Factors */}
      <div className="space-y-3 mb-6">
        <h4 className="text-slate-400 text-sm font-medium mb-3">Risk Factors</h4>
        {risks.map((risk, index) => (
          <motion.div
            key={risk.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border ${getSeverityColor(risk.severity)}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getSeverityIcon(risk.severity)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium capitalize">{risk.type.replace(/_/g, ' ')}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeverityColor(risk.severity)}`}>
                    {risk.severity}
                  </span>
                </div>
                <p className="text-slate-300 text-sm">{risk.message}</p>
                {risk.recommendation && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-cyan-400">
                    <Zap className="w-3 h-3" />
                    {risk.recommendation}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Value Protection */}
      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 font-medium text-sm">Protection Status</span>
        </div>
        <div className="text-slate-300 text-sm">
          Your portfolio value of <span className="text-white font-semibold">${portfolioValue.toLocaleString()}</span> is being actively monitored.
        </div>
      </div>
    </motion.div>
  );
}
