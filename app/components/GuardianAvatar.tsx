'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Shield, Eye, Zap, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface GuardianAvatarProps {
  status: 'idle' | 'scanning' | 'protecting' | 'alert';
  healthScore?: number;
  walletConnected?: boolean;
}

export function GuardianAvatar({ status, healthScore = 0, walletConnected }: GuardianAvatarProps) {
  const [pulseColor, setPulseColor] = useState('bg-emerald-500');
  
  useEffect(() => {
    if (status === 'alert') setPulseColor('bg-red-500');
    else if (status === 'scanning') setPulseColor('bg-cyan-500');
    else if (healthScore < 50) setPulseColor('bg-yellow-500');
    else setPulseColor('bg-emerald-500');
  }, [status, healthScore]);

  const variants = {
    idle: { scale: 1, rotate: 0 },
    scanning: { 
      scale: [1, 1.05, 1],
      rotate: [0, 5, -5, 0],
      transition: { repeat: Infinity, duration: 2 }
    },
    protecting: { 
      scale: [1, 1.1, 1],
      boxShadow: [
        '0 0 0 0 rgba(16, 185, 129, 0)',
        '0 0 20 10 rgba(16, 185, 129, 0.3)',
        '0 0 0 0 rgba(16, 185, 129, 0)'
      ],
      transition: { repeat: Infinity, duration: 3 }
    },
    alert: {
      scale: [1, 1.15, 1],
      x: [-5, 5, -5, 5, 0],
      transition: { repeat: Infinity, duration: 0.3 }
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'scanning': return 'Scanning portfolio...';
      case 'protecting': return 'Guardian Active';
      case 'alert': return 'Risk Detected!';
      default: return walletConnected ? 'Ready to Protect' : 'Connect Wallet';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'scanning': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'protecting': return <CheckCircle className="w-4 h-4" />;
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="relative"
        >
          {/* Pulse ring */}
          <motion.div
            className={`absolute inset-0 rounded-full ${pulseColor} opacity-30`}
            animate={variants[status === 'idle' && !walletConnected ? 'idle' : status]}
            style={{ transform: 'scale(1.5)' }}
          />
          
          {/* Shield container */}
          <motion.div
            className="relative w-32 h-32 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-emerald-500/30 flex items-center justify-center overflow-hidden"
            animate={variants[status === 'idle' && !walletConnected ? 'idle' : status]}
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" />
            
            {/* Shield icon with glow */}
            <motion.div
              className="relative z-10"
              animate={walletConnected && status !== 'alert' ? { 
                boxShadow: ['0 0 10px rgba(16,185,129,0.5)', '0 0 25px rgba(16,185,129,0.8)', '0 0 10px rgba(16,185,129,0.5)']
              } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Shield 
                className={`w-16 h-16 ${
                  status === 'alert' ? 'text-red-400' :
                  status === 'scanning' ? 'text-cyan-400' :
                  healthScore < 50 ? 'text-yellow-400' : 'text-emerald-400'
                }`} 
                fill="currentColor"
                fillOpacity={0.2}
              />
            </motion.div>
            
            {/* Scanning line animation */}
            {status === 'scanning' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"
                animate={{ top: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}
          </motion.div>
          
          {/* Orbiting elements */}
          {status === 'protecting' && (
            <>
              {[0, 72, 144, 216, 288].map((angle, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-emerald-400"
                  style={{ transform: `rotate(${angle}deg) translateX(70px)` }}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                />
              ))}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Status indicator */}
      <motion.div
        className={`mt-4 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium ${
          status === 'alert' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
          status === 'scanning' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
          status === 'protecting' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
          'bg-slate-800 text-slate-400 border border-slate-700'
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {getStatusIcon()}
        {getStatusText()}
      </motion.div>

      {/* Health indicator */}
      {walletConnected && status !== 'scanning' && (
        <motion.div
          className="mt-3 flex items-center gap-2 text-xs text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Zap className="w-3 h-3" />
          <span>Score: {healthScore}/100</span>
        </motion.div>
      )}
    </div>
  );
}
