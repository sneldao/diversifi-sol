'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Shield, Zap, CheckCircle, ArrowRight, Wallet, Loader2 } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

interface OneClickDeployProps {
  onDeploy: () => Promise<void>;
  isDeploying: boolean;
  isDeployed: boolean;
}

export function OneClickDeploy({ onDeploy, isDeploying, isDeployed }: OneClickDeployProps) {
  const { connected } = useWallet();
  const [step, setStep] = useState<'idle' | 'connecting' | 'ready' | 'deploying' | 'complete'>('idle');

  const handleClick = async () => {
    if (!connected) {
      setStep('connecting');
      // Trigger wallet connection
      const connectButton = document.querySelector('.wallet-adapter-button');
      (connectButton as HTMLElement)?.click();
      return;
    }
    
    if (isDeployed) return;
    
    setStep('deploying');
    await onDeploy();
    setStep('complete');
  };

  const getButtonText = () => {
    switch (step) {
      case 'connecting': return 'Connecting...';
      case 'deploying': return 'Deploying Guardian...';
      case 'complete': return 'Guardian Active';
      default: return isDeployed ? 'Guardian Active' : 'Deploy Guardian';
    }
  };

  const getButtonIcon = () => {
    switch (step) {
      case 'connecting': return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'deploying': return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'complete': return <CheckCircle className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const steps = [
    { icon: Wallet, label: 'Connect Wallet', status: connected ? 'complete' : step === 'connecting' ? 'active' : 'pending' },
    { icon: Zap, label: 'Deploy Guardian', status: isDeployed ? 'complete' : connected && step === 'deploying' ? 'active' : 'pending' },
    { icon: CheckCircle, label: 'Active Protection', status: isDeployed ? 'complete' : 'pending' },
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((s, i) => (
          <div key={s.label} className="flex flex-col items-center">
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                s.status === 'complete' ? 'bg-emerald-500 text-white' :
                s.status === 'active' ? 'bg-cyan-500 text-white' :
                'bg-slate-800 text-slate-400'
              }`}
              animate={s.status === 'active' ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              {s.status === 'complete' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <s.icon className="w-5 h-5" />
              )}
            </motion.div>
            <span className="text-xs text-slate-400 mt-1 hidden sm:block">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Main Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        disabled={isDeploying || isDeployed}
        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
          isDeployed
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400'
        }`}
      >
        {getButtonIcon()}
        {getButtonText()}
        {isDeployed && <ArrowRight className="w-5 h-5" />}
      </motion.button>

      {/* Trust indicators */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          Non-custodial
        </span>
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-emerald-400" />
          Gas-free deploy
        </span>
      </div>
    </div>
  );
}
