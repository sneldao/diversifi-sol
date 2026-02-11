'use client';

import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { Shield, TrendingUp, Github, Globe, Sparkles, ChevronRight } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';

const Dashboard = lazy(() => import('./components/Dashboard').then(mod => ({ default: mod.Dashboard })));
const PageLoading = () => <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-emerald-400">Loading...</div></div>;
const PriceTicker = () => null;

interface YieldOpportunity {
  apy: number;
}

interface GuardianData {
  portfolioValue: number;
  bestApy: number;
  solPrice: number;
  assetsTracked: number;
  healthScore: number;
  walletAddress: string;
  guardianId: string;
  deployedAt: string;
}

export default function Home() {
  const { publicKey, connected, connecting } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [guardianLaunched, setGuardianLaunched] = useState(false);
  const [guardianData, setGuardianData] = useState<GuardianData | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const walletAddress = mounted ? publicKey?.toString() || null : null;

  const fetchGuardianData = useCallback(async () => {
    if (!walletAddress) return;
    setError(null);
    try {
      const portfolioRes = await fetch(`/api/portfolio?wallet=${walletAddress}`);
      const yieldsRes = await fetch('/api/yields');
      const healthRes = await fetch(`/api/health?wallet=${walletAddress}`);
      
      let portfolioData = null;
      if (portfolioRes.ok) portfolioData = await portfolioRes.json();
      
      let yieldsData: { opportunities: YieldOpportunity[] } = { opportunities: [] };
      if (yieldsRes.ok) yieldsData = await yieldsRes.json();
      
      let healthData = { score: 72 };
      if (healthRes.ok) healthData = await healthRes.json();

      setGuardianData({
        portfolioValue: portfolioData?.totalValue || 0,
        bestApy: yieldsData.opportunities?.[0]?.apy || 0,
        solPrice: 98.45,
        assetsTracked: portfolioData?.tokens?.length || 0,
        healthScore: healthData.score || 72,
        walletAddress,
        guardianId: `GRD-${walletAddress.slice(0, 8).toUpperCase()}`,
        deployedAt: new Date().toISOString(),
      });
    } catch (err) {
      setError('Unable to fetch portfolio data');
    }
  }, [walletAddress]);

  const registerGuardian = async () => {
    if (!walletAddress) return;
    setIsDeploying(true);
    setError(null);
    try {
      const res = await fetch('/api/guardian/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });
      if (!res.ok) throw new Error('Failed to register');
      setGuardianLaunched(true);
      await fetchGuardianData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deploy');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleLaunchGuardian = () => {
    if (!connected) {
      const btn = document.querySelector('.wallet-adapter-button') as HTMLElement;
      btn?.click();
      return;
    }
    registerGuardian();
  };

  useEffect(() => {
    if (mounted && guardianLaunched && connected && walletAddress) {
      fetchGuardianData();
    }
  }, [mounted, guardianLaunched, connected, walletAddress, fetchGuardianData]);

  if (!mounted) return <PageLoading />;

  return (
    <div className="min-h-screen bg-slate-950">
      <PriceTicker />
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 pt-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">DiversiFi</h1>
                <p className="text-slate-400 text-xs">Wealth Guardian</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href="https://github.com/sneldao/diversifi-solana" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" aria-label="GitHub">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://diversifi-sol.vercel.app" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" aria-label="Website">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 text-xs font-medium">AI-Powered Protection</span>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-white">Your </span>
                <span className="text-gradient-cyan">Wealth Guardian</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-slate-300 text-lg mb-6 max-w-xl mx-auto lg:mx-0">
                Autonomous portfolio protection with real-time monitoring, AI insights, and yield optimization.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center justify-center lg:justify-start gap-6 mb-8">
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-white">${(guardianData?.portfolioValue || 12458).toLocaleString()}</div>
                  <div className="text-slate-400 text-sm">Tracked</div>
                </div>
                <div className="w-px h-10 bg-slate-700" />
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-emerald-400">{(guardianData?.bestApy || 24.5).toFixed(1)}%</div>
                  <div className="text-slate-400 text-sm">Best APY</div>
                </div>
                <div className="w-px h-10 bg-slate-700" />
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-cyan-400">{guardianData?.healthScore || 72}</div>
                  <div className="text-slate-400 text-sm">Health</div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex items-center justify-center lg:justify-start gap-4">
                <button onClick={handleLaunchGuardian} disabled={isDeploying || connecting} className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-lg disabled:opacity-50" aria-label={connected ? 'Deploy Guardian' : 'Connect Wallet'}>
                  <Shield className="w-5 h-5" />
                  {isDeploying ? 'Deploying...' : connected ? 'Deploy Guardian' : 'Connect Wallet'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
              {error && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm max-w-md mx-auto lg:mx-0">
                  {error}
                </motion.div>
              )}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center justify-center lg:justify-start gap-4 mt-6 text-sm text-slate-400">
                <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-emerald-400" />Non-custodial</span>
                <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4 text-emerald-400" />Real-time data</span>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-center">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center ${guardianLaunched ? 'bg-emerald-500/20 ring-4 ring-emerald-500' : 'bg-slate-800'}`}>
                <Shield className={`w-16 h-16 ${guardianLaunched ? 'text-emerald-400' : 'text-slate-400'}`} />
              </div>
              {guardianData?.guardianId && (
                <div className="mt-4 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-emerald-400 font-mono text-sm">🛡️ {guardianData.guardianId}</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
        {!guardianLaunched && connected && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-12 max-w-4xl mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">How DiversiFi Works</h2>
              <p className="text-slate-400">AI-powered wealth guardian in 3 steps</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-slate-800/50 border border-emerald-500/20">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4"><span className="text-2xl">🔍</span></div>
                <h3 className="text-white font-bold mb-2">1. Scan Portfolio</h3>
                <p className="text-slate-400 text-sm">Analyzes SPL tokens, NFTs, and SOL in real-time.</p>
              </div>
              <div className="p-6 rounded-xl bg-slate-800/50 border border-cyan-500/20">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4"><span className="text-2xl">📊</span></div>
                <h3 className="text-white font-bold mb-2">2. Risk Assessment</h3>
                <p className="text-slate-400 text-sm">AI evaluates diversification and concentration risk.</p>
              </div>
              <div className="p-6 rounded-xl bg-slate-800/50 border border-purple-500/20">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4"><span className="text-2xl">🛡️</span></div>
                <h3 className="text-white font-bold mb-2">3. Protect & Optimize</h3>
                <p className="text-slate-400 text-sm">Auto-rebalancing suggestions and yield opportunities.</p>
              </div>
            </div>
          </motion.div>
        )}
        {connected && mounted && (
          <div className="max-w-7xl mx-auto px-6 mt-12">
            <Suspense fallback={<PageLoading />}>
              <Dashboard walletAddress={walletAddress} guardianLaunched={guardianLaunched} guardianData={guardianData} />
            </Suspense>
          </div>
        )}
        <footer className="border-t border-emerald-500/10 bg-slate-900/80 mt-16" role="contentinfo">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">DiversiFi</h3>
                  <p className="text-slate-400 text-sm">Autonomous Wealth Protection</p>
                </div>
              </div>
              <div className="text-slate-400 text-sm">
                Built for Colosseum AI Hackathon • © 2026
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
