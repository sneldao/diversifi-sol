'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { Shield, TrendingUp, Github, Globe, Sparkles, ChevronRight, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = lazy(() => import('./components/Dashboard').then(mod => ({ default: mod.Dashboard })));
const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin mx-auto mb-4" />
      <p className="text-emerald-400">Loading DiversiFi...</p>
    </div>
  </div>
);

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

function LoadingCard({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="text-center lg:text-left animate-pulse">
      <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
        <div className="w-4 h-4 rounded-full bg-slate-700" />
        <div className="h-8 w-20 bg-slate-700 rounded" />
      </div>
      <div className="h-4 w-16 bg-slate-700 rounded mx-auto lg:mx-0" />
    </div>
  );
}

export default function Home() {
  const { publicKey, connected, connecting } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [guardianLaunched, setGuardianLaunched] = useState(false);
  const [guardianData, setGuardianData] = useState<GuardianData | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const walletAddress = mounted ? publicKey?.toString() || null : null;

  const fetchGuardianData = async () => {
    if (!walletAddress) return;
    setIsLoadingData(true);
    setError(null);
    try {
      const [portfolioRes, yieldsRes, healthRes] = await Promise.all([
        fetch(`/api/portfolio?wallet=${walletAddress}`),
        fetch('/api/yields'),
        fetch(`/api/health?wallet=${walletAddress}`),
      ]);

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
      setError('Unable to fetch portfolio data. Please try again.');
    } finally {
      setIsLoadingData(false);
    }
  };

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
      setError(err instanceof Error ? err.message : 'Failed to deploy guardian');
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
  }, [mounted, guardianLaunched, connected, walletAddress]);

  if (!mounted) return <PageLoading />;

  return (
    <div className="min-h-screen bg-slate-950">
      <PriceTicker />
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-emerald-500/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">DiversiFi</h1>
                  <p className="text-slate-400 text-xs">Wealth Guardian</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Connection Status */}
                <AnimatePresence mode="wait">
                  {connected ? (
                    <motion.div
                      key="connected"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 text-sm font-mono">
                        {walletAddress?.slice(0, 4)}...{walletAddress?.slice(-4)}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="connect"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={handleLaunchGuardian}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 text-sm font-medium transition-colors"
                    >
                      <Wallet className="w-4 h-4" />
                      Connect Wallet
                    </motion.button>
                  )}
                </AnimatePresence>
                
                <a href="https://github.com/sneldao/diversifi-sol" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-24 pb-16 px-6">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              <div className="text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-emerald-400 text-xs font-medium">AI-Powered Protection</span>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold mb-4"
                >
                  <span className="text-white">Your </span>
                  <span className="text-gradient-cyan">Wealth Guardian</span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-slate-300 text-lg mb-8 max-w-xl mx-auto lg:mx-0"
                >
                  Autonomous portfolio protection with real-time monitoring, AI insights, and yield optimization.
                </motion.p>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-center lg:justify-start gap-6 mb-8"
                >
                  {isLoadingData ? (
                    <>
                      <LoadingCard icon={<Shield />} label="Loading..." />
                      <div className="w-px h-10 bg-slate-700" />
                      <LoadingCard icon={<TrendingUp />} label="Loading..." />
                      <div className="w-px h-10 bg-slate-700" />
                      <LoadingCard icon={<CheckCircle2 />} label="Loading..." />
                    </>
                  ) : (
                    <>
                      <div className="text-center lg:text-left">
                        <div className="text-2xl font-bold text-white">${(guardianData?.portfolioValue || 12458).toLocaleString()}</div>
                        <div className="text-slate-400 text-sm">Portfolio Value</div>
                      </div>
                      <div className="w-px h-10 bg-slate-700" />
                      <div className="text-center lg:text-left">
                        <div className="text-2xl font-bold text-emerald-400">{(guardianData?.bestApy || 24.5).toFixed(1)}%</div>
                        <div className="text-slate-400 text-sm">Best APY</div>
                      </div>
                      <div className="w-px h-10 bg-slate-700" />
                      <div className="text-center lg:text-left">
                        <div className="text-2xl font-bold text-cyan-400">{guardianData?.healthScore || 72}</div>
                        <div className="text-slate-400 text-sm">Health Score</div>
                      </div>
                    </>
                  )}
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <button
                    onClick={handleLaunchGuardian}
                    disabled={isDeploying || connecting}
                    className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-lg disabled:opacity-50"
                  >
                    {isDeploying ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Deploying...
                      </>
                    ) : connected ? (
                      <>
                        <Shield className="w-5 h-5" />
                        Deploy Guardian
                        <ChevronRight className="w-5 h-5" />
                      </>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5" />
                        Connect Wallet
                      </>
                    )}
                  </button>
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 max-w-md mx-auto lg:mx-0"
                    >
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-red-400 text-sm">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Trust Badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-center lg:justify-start gap-6 mt-6 text-sm text-slate-400"
                >
                  <span className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Non-custodial
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Secure
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Real-time
                  </span>
                </motion.div>
              </div>

              {/* Guardian Avatar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center"
              >
                <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${
                  guardianLaunched 
                    ? 'bg-emerald-500/20 ring-4 ring-emerald-500 shadow-lg shadow-emerald-500/20' 
                    : 'bg-slate-800'
                }`}>
                  <Shield className={`w-20 h-20 transition-colors duration-500 ${
                    guardianLaunched ? 'text-emerald-400' : 'text-slate-400'
                  }`} />
                </div>
                
                {guardianData?.guardianId && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30"
                  >
                    <span className="text-emerald-400 font-mono text-sm">🛡️ {guardianData.guardianId}</span>
                  </motion.div>
                )}
                
                {guardianLaunched && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-emerald-400 text-sm flex items-center gap-1"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Active Protection
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* How It Works */}
            {!guardianLaunched && connected && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-16"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">How DiversiFi Works</h2>
                  <p className="text-slate-400">AI-powered wealth guardian in 3 steps</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-xl bg-slate-800/50 border border-emerald-500/20">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                      <span className="text-2xl">🔍</span>
                    </div>
                    <h3 className="text-white font-bold mb-2">1. Scan Portfolio</h3>
                    <p className="text-slate-400 text-sm">Analyzes SPL tokens, NFTs, and SOL in real-time using Helius RPC.</p>
                  </div>
                  <div className="p-6 rounded-xl bg-slate-800/50 border border-cyan-500/20">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4">
                      <span className="text-2xl">📊</span>
                    </div>
                    <h3 className="text-white font-bold mb-2">2. Risk Assessment</h3>
                    <p className="text-slate-400 text-sm">AI evaluates diversification, concentration risk, and liquidity.</p>
                  </div>
                  <div className="p-6 rounded-xl bg-slate-800/50 border border-purple-500/20">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                      <span className="text-2xl">🛡️</span>
                    </div>
                    <h3 className="text-white font-bold mb-2">3. Protect & Optimize</h3>
                    <p className="text-slate-400 text-sm">Auto-rebalancing suggestions and yield opportunities.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Dashboard */}
            {connected && mounted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Suspense fallback={<PageLoading />}>
                  <Dashboard 
                    walletAddress={walletAddress}
                    guardianLaunched={guardianLaunched}
                    guardianData={guardianData}
                  />
                </Suspense>
              </motion.div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-emerald-500/10 bg-slate-900/80" role="contentinfo">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">DiversiFi</h3>
                  <p className="text-slate-400 text-sm">Autonomous Wealth Protection</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <a href="https://github.com/sneldao/diversifi-sol" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                  GitHub
                </a>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Colosseum AI Hackathon
                </span>
                <span>© 2026</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
