'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { PortfolioCard } from './PortfolioCard';
import { HealthRing } from './HealthRing';
import { YieldList } from './YieldList';
import { AIInsights } from './AIInsights';
import { DashboardSkeleton } from './Skeletons';
import { RiskAssessment } from './RiskAssessment';
import { GuardianActionLog } from './GuardianActionLog';
import { YieldOpportunities } from './YieldOpportunities';
import { RebalancingPanel } from './RebalancingPanel';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Wallet, Zap, DollarSign } from 'lucide-react';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Token {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
}

interface PortfolioData {
  totalValue: number;
  tokens: Token[];
  chainBreakdown: Record<string, number>;
  lastUpdated: string;
}

interface YieldOpportunity {
  protocol: string;
  token: string;
  apy: number;
  tvl: number;
  risk: 'low' | 'medium' | 'high';
  chain: string;
}

interface HealthData {
  score: number;
  insights: string[];
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

interface DashboardProps {
  walletAddress: string | null;
  guardianLaunched: boolean;
  guardianData: GuardianData | null;
}

export function Dashboard({ walletAddress, guardianLaunched, guardianData }: DashboardProps) {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [yields, setYields] = useState<YieldOpportunity[]>([]);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    // Use wallet address if provided, otherwise use demo mode
    const wallet = walletAddress || 'DemoPortfolio';

    try {
      // Fetch portfolio
      const portfolioRes = await fetch(`/api/portfolio?wallet=${wallet}`);
      if (portfolioRes.ok) {
        const data = await portfolioRes.json();
        setPortfolio(data);
      } else if (walletAddress) {
        // Only show error if wallet is connected but API fails
        console.error('Failed to fetch portfolio');
      } else {
        // Use mock data for demo when no wallet
        setPortfolio({
          totalValue: 12458.92,
          tokens: [
            { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', name: 'USD Coin', balance: 5234.56, price: 1, value: 5234.56 },
            { mint: 'So11111111111111111111111111111111111111112', symbol: 'SOL', name: 'Solana', balance: 145.23, price: 98.45, value: 14298.50 },
            { mint: 'mSoLzYCxHdYgdzU8g95Q6kkcj8D4wvTXEUkNLv17rPi', symbol: 'MSOL', name: 'Marinade Staked SOL', balance: 32.45, price: 118.92, value: 3859.00 },
            { mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB3Z', symbol: 'BONK', name: 'Bonk', balance: 5000000, price: 0.0000234, value: 117.00 },
            { mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtkqjberbSOWd91pbT2', symbol: 'JUP', name: 'Jupiter', balance: 1250, price: 0.89, value: 1112.50 },
          ],
          chainBreakdown: { Solana: 12458.92 },
          lastUpdated: new Date().toISOString(),
        });
      }

      // Fetch yields
      const yieldsRes = await fetch('/api/yields');
      if (yieldsRes.ok) {
        const data = await yieldsRes.json();
        setYields(data.opportunities || []);
      } else {
        setYields([
          { protocol: 'Solend', token: 'USDC', apy: 8.5, tvl: 45000000, risk: 'low', chain: 'Solana' },
          { protocol: 'Mango Markets', token: 'USDC', apy: 12.3, tvl: 28000000, risk: 'medium', chain: 'Solana' },
          { protocol: 'Tulip', token: 'USDC', apy: 15.7, tvl: 12000000, risk: 'high', chain: 'Solana' },
          { protocol: 'Saber', token: 'USDC-USDT', apy: 6.2, tvl: 89000000, risk: 'low', chain: 'Solana' },
          { protocol: 'Raydium', token: 'RAY', apy: 24.5, tvl: 15000000, risk: 'high', chain: 'Solana' },
        ]);
      }

      // Fetch health
      const healthRes = await fetch(`/api/health?wallet=${wallet}`);
      if (healthRes.ok) {
        const data = await healthRes.json();
        setHealth(data);
      } else if (walletAddress) {
        console.error('Failed to fetch health');
      } else {
        setHealth({
          score: 72,
          insights: [
            '👍 Good diversification, but room for improvement',
            '💧 Consider adding more stablecoin exposure',
          ],
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    // Only fetch when guardian is launched or wallet is connected
    if (guardianLaunched || walletAddress) {
      fetchData();
      
      // Refresh every 30 seconds
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    } else {
      setIsLoading(false);
    }
  }, [guardianLaunched, walletAddress, fetchData]);

  if (!guardianLaunched && !walletAddress) {
    return null; // Don't show dashboard until guardian is launched
  }

  if (isLoading && !portfolio) {
    return <DashboardSkeleton />;
  }

  // Use guardian data if available, otherwise fall back to fetched data
  const displayTotalValue = guardianData?.portfolioValue || portfolio?.totalValue || 0;
  const displayHealthScore = guardianData?.healthScore || health?.score || 0;
  const displayTokens = portfolio?.tokens || [];
  const displayYields: YieldOpportunity[] = yields.length > 0 ? yields : [
    { protocol: 'Solend', token: 'USDC', apy: 8.5, tvl: 45000000, risk: 'low', chain: 'Solana' },
    { protocol: 'Mango Markets', token: 'USDC', apy: 12.3, tvl: 28000000, risk: 'medium', chain: 'Solana' },
    { protocol: 'Tulip', token: 'USDC', apy: 15.7, tvl: 12000000, risk: 'high', chain: 'Solana' },
    { protocol: 'Saber', token: 'USDC-USDT', apy: 6.2, tvl: 89000000, risk: 'low', chain: 'Solana' },
    { protocol: 'Raydium', token: 'RAY', apy: 24.5, tvl: 15000000, risk: 'high', chain: 'Solana' },
  ];
  const displayInsights = health?.insights || [];

  // Portfolio Allocation Chart Data
  const portfolioChartData = {
    labels: displayTokens.map(t => t.symbol),
    datasets: [
      {
        data: displayTokens.map(t => t.value),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(6, 182, 212, 1)',
          'rgba(20, 184, 166, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  // APY Bar Chart Data
  const apyChartData = {
    labels: displayYields.slice(0, 5).map(y => y.protocol),
    datasets: [
      {
        label: 'APY %',
        data: displayYields.slice(0, 5).map(y => y.apy),
        backgroundColor: displayYields.slice(0, 5).map(y => 
          y.risk === 'low' ? 'rgba(16, 185, 129, 0.8)' :
          y.risk === 'medium' ? 'rgba(245, 158, 11, 0.8)' :
          'rgba(239, 68, 68, 0.8)'
        ),
        borderColor: displayYields.slice(0, 5).map(y =>
          y.risk === 'low' ? 'rgba(16, 185, 129, 1)' :
          y.risk === 'medium' ? 'rgba(245, 158, 11, 1)' :
          'rgba(239, 68, 68, 1)'
        ),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(16, 185, 129, 0.3)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  return (
    <div className="space-y-6 fade-in fade-in-delay-2">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PortfolioCard 
          tokens={displayTokens} 
          totalValue={displayTotalValue}
        />
        
        <div className="glass-card-hover rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-emerald-400 text-sm font-medium">24h Change</h3>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-4xl font-bold text-emerald-400 mb-2">+5.23%</div>
          <p className="text-slate-400 text-sm">$623.45 profit</p>
          <div className="mt-4 h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
              style={{ width: '75%' }}
            />
          </div>
        </div>

        <div className="glass-card-hover rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cyan-400 text-sm font-medium">Active Strategies</h3>
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-4xl font-bold text-white mb-2">3</div>
          <p className="text-slate-400 text-sm">Earn, Borrow, Save</p>
          <div className="mt-4 flex gap-2">
            <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">Solana</span>
            <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs">Base</span>
          </div>
        </div>

        <div className="glass-card-hover rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-amber-400 text-sm font-medium">Health Score</h3>
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-20"></div>
              <DollarSign className="w-5 h-5 text-amber-400 relative" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white mb-2">{displayHealthScore}</div>
          <p className="text-slate-400 text-sm">Portfolio Health</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  displayHealthScore >= 70 ? 'bg-emerald-500' :
                  displayHealthScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${displayHealthScore}%` }}
              />
            </div>
            <span className={`text-xs ${
              displayHealthScore >= 70 ? 'text-emerald-400' :
              displayHealthScore >= 40 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {displayHealthScore >= 70 ? 'Good' : displayHealthScore >= 40 ? 'Fair' : 'Poor'}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Allocation */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Portfolio Allocation</h3>
          <div className="chart-container">
            <Doughnut 
              data={portfolioChartData} 
              options={{
                ...chartOptions,
                cutout: '65%',
              }} 
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  ${displayTotalValue.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400">Total Value</div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {displayTokens.map((token, index) => (
              <div key={token.symbol} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ 
                    backgroundColor: portfolioChartData.datasets[0].backgroundColor[index]
                  }}
                />
                <span className="text-xs text-slate-400">{token.symbol}</span>
              </div>
            ))}
          </div>
        </div>

        {/* APY Comparison */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Yield Opportunities (APY)</h3>
          <div className="chart-container" style={{ height: '200px' }}>
            <Bar data={apyChartData} options={chartOptions} />
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-400">Low Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-slate-400">Medium Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-slate-400">High Risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in fade-in-delay-3">
        <HealthRing 
          score={displayHealthScore} 
          insights={displayInsights}
        />
        <YieldList opportunities={displayYields} />
      </div>

      {/* AI Insights */}
      <AIInsights 
        portfolioValue={displayTotalValue}
        healthScore={displayHealthScore}
      />
    </div>
  );
}


// Memoize for performance - prevents re-renders when parent changes
export default memo(Dashboard);
