'use client';

import { motion } from 'framer-motion';
import { Shield, Wallet, TrendingUp, Zap } from 'lucide-react';

export function PageLoading() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        {/* Animated shield */}
        <motion.div
          className="relative w-32 h-32 mx-auto mb-8"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 blur-xl" />
          <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-emerald-500/30 flex items-center justify-center">
            <Shield className="w-16 h-16 text-emerald-400" />
          </div>
        </motion.div>

        {/* Loading text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold text-white mb-2">DiversiFi</h1>
          <p className="text-slate-400 mb-6">Initializing Guardian...</p>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          className="flex justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-emerald-500"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
            />
          ))}
        </motion.div>

        {/* Skeleton cards */}
        <motion.div
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export function DeployButtonSkeleton() {
  return (
    <div className="h-14 bg-slate-800/50 rounded-xl animate-pulse w-full max-w-md mx-auto" />
  );
}
