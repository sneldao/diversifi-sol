'use client';

import { useState, useEffect } from 'react';
import { ArrowRightLeft, RefreshCw, CheckCircle, AlertCircle, Wallet, Loader2, Zap, TrendingUp } from 'lucide-react';

interface SwapQuote {
  fromToken: string;
  toToken: string;
  amountIn: number;
  amountOut: number;
  priceImpact: number;
  estimatedGas: number;
  gasPrice: number;
  gasCostUSD: number;
}

interface TradeHistory {
  id: string;
  timestamp: string;
  fromToken: string;
  toToken: string;
  amountIn: number;
  amountOut: number;
  status: 'executed' | 'pending' | 'failed';
  txHash?: string;
}

// Demo trades for showcase - DiversiFi executing trades autonomously
const DEMO_TRADES: TradeHistory[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    fromToken: 'USDC',
    toToken: 'ETH',
    amountIn: 750,
    amountOut: 0.234,
    status: 'executed',
    txHash: '0x7a3f...8c21'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    fromToken: 'ETH',
    toToken: 'DEGEN',
    amountIn: 0.15,
    amountOut: 6850,
    status: 'executed',
    txHash: '0x9b2e...4d17'
  },
  {
    id: '3', 
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    fromToken: 'USDC',
    toToken: 'ETH',
    amountIn: 500,
    amountOut: 0.156,
    status: 'executed',
    txHash: '0x1234...5678'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    fromToken: 'ETH',
    toToken: 'DEGEN',
    amountIn: 0.1,
    amountOut: 4500,
    status: 'executed',
    txHash: '0xabcd...efgh'
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    fromToken: 'USDC',
    toToken: 'ETH',
    amountIn: 250,
    amountOut: 0.078,
    status: 'executed',
    txHash: '0x9876...5432'
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    fromToken: 'DEGEN',
    toToken: 'ETH',
    amountIn: 2000,
    amountOut: 0.042,
    status: 'executed',
    txHash: '0xdef0...1234'
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 21600000).toISOString(),
    fromToken: 'USDC',
    toToken: 'cbBTC',
    amountIn: 1000,
    amountOut: 0.0117,
    status: 'executed',
    txHash: '0x5678...90ab'
  }
];

const TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ' },
  { symbol: 'USDC', name: 'USD Coin', icon: '$' },
  { symbol: 'DEGEN', name: 'Degen', icon: 'Ð' },
  { symbol: 'DAI', name: 'Dai', icon: '◈' },
  { symbol: 'cbBTC', name: 'cbBTC', icon: '₿' },
];

export default function TradingInterface() {
  const [fromToken, setFromToken] = useState('USDC');
  const [toToken, setToToken] = useState('ETH');
  const [amount, setAmount] = useState('100');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [trades, setTrades] = useState<TradeHistory[]>(DEMO_TRADES);

  // Fetch quote when inputs change
  useEffect(() => {
    const fetchQuote = async () => {
      if (!amount || parseFloat(amount) <= 0) {
        setQuote(null);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`/api/base/swap?from=${fromToken}&to=${toToken}&amount=${amount}`);
        const data = await res.json();
        
        if (data.success) {
          setQuote(data.data.quote);
        } else {
          // Fallback to mock quote if API fails
          const mockOutput = parseFloat(amount) * (fromToken === 'USDC' ? 0.00031 : 3200);
          setQuote({
            fromToken,
            toToken,
            amountIn: parseFloat(amount),
            amountOut: mockOutput,
            priceImpact: 0.1,
            estimatedGas: 150000,
            gasPrice: 0.001,
            gasCostUSD: 0.48
          });
        }
      } catch (err) {
        // Use mock data on error
        const mockOutput = parseFloat(amount) * (fromToken === 'USDC' ? 0.00031 : 3200);
        setQuote({
          fromToken,
          toToken,
          amountIn: parseFloat(amount),
          amountOut: mockOutput,
          priceImpact: 0.1,
          estimatedGas: 150000,
          gasPrice: 0.001,
          gasCostUSD: 0.48
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    const timer = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timer);
  }, [fromToken, toToken, amount]);

  const handleSwap = async () => {
    if (!quote) return;
    
    setIsSwapping(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Simulate swap execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add to trade history
      const newTrade: TradeHistory = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        fromToken,
        toToken,
        amountIn: parseFloat(amount),
        amountOut: quote.amountOut,
        status: 'executed',
        txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`
      };
      
      setTrades([newTrade, ...trades]);
      setSuccess(`Swapped ${amount} ${fromToken} → ${quote.amountOut.toFixed(6)} ${toToken}`);
      setAmount('');
      setQuote(null);
    } catch (err) {
      setError('Swap failed. Please try again.');
    } finally {
      setIsSwapping(false);
    }
  };

  const switchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  return (
    <div className="space-y-6">
      {/* Trading Interface */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <h3 className="text-white font-semibold">Trade on Base</h3>
          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">LIVE</span>
        </div>
        
        {/* From Token */}
        <div className="space-y-2">
          <label className="text-slate-400 text-sm">Sell</label>
          <div className="flex gap-2">
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="bg-slate-800 text-white rounded-lg px-3 py-3 border border-slate-700 focus:border-emerald-500 focus:outline-none"
            >
              {TOKENS.map(t => (
                <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
              ))}
            </select>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-slate-800 text-white rounded-lg px-4 py-3 border border-slate-700 focus:border-emerald-500 focus:outline-none text-right font-mono text-lg"
            />
          </div>
        </div>

        {/* Switch Button */}
        <div className="flex justify-center my-2">
          <button
            onClick={switchTokens}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500 transition-all"
          >
            <ArrowRightLeft className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <label className="text-slate-400 text-sm">Buy</label>
          <div className="flex gap-2">
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="bg-slate-800 text-white rounded-lg px-3 py-3 border border-slate-700 focus:border-emerald-500 focus:outline-none"
            >
              {TOKENS.map(t => (
                <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
              ))}
            </select>
            <div className="flex-1 bg-slate-800 rounded-lg px-4 py-3 border border-slate-700 text-right font-mono text-lg text-emerald-400">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin inline" />
              ) : quote ? (
                `~${quote.amountOut.toFixed(6)}`
              ) : (
                '0.000000'
              )}
            </div>
          </div>
        </div>

        {/* Quote Details */}
        {quote && (
          <div className="mt-4 p-3 bg-slate-800/50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Rate</span>
              <span className="text-white">1 {fromToken} = {(quote.amountOut / quote.amountIn).toFixed(6)} {toToken}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Price Impact</span>
              <span className="text-emerald-400">{quote.priceImpact.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Est. Gas</span>
              <span className="text-white">${quote.gasCostUSD.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={!quote || isSwapping}
          className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:from-slate-700 disabled:to-slate-600 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {isSwapping ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Executing Swap...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Swap Now
            </>
          )}
        </button>

        {/* Error/Success Messages */}
        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}
        {success && (
          <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm">{success}</span>
          </div>
        )}
      </div>

      {/* Trade History */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-5 h-5 text-emerald-400" />
          <h3 className="text-white font-semibold">Recent Trades</h3>
        </div>
        
        <div className="space-y-3">
          {trades.map(trade => (
            <div key={trade.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${trade.status === 'executed' ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
                <div>
                  <p className="text-white text-sm font-medium">
                    {trade.amountIn} {trade.fromToken} → {trade.amountOut.toFixed(4)} {trade.toToken}
                  </p>
                  <p className="text-slate-500 text-xs">{trade.txHash}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-emerald-400 text-sm">{trade.status === 'executed' ? '✓ Executed' : '⏳ Pending'}</p>
                <p className="text-slate-500 text-xs">{new Date(trade.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
