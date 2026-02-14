// lib/recommendations.ts - AI-powered portfolio recommendations

import { getPortfolio } from './helius';
import { getCeloPortfolio } from './celo';

interface Recommendation {
  id: string;
  type: 'rebalance' | 'swap' | 'hold' | 'stake' | 'bridge';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potentialGain?: number;
  risk: 'low' | 'medium' | 'high';
  actions: string[];
}

// Analyze portfolio and generate recommendations
export async function generateRecommendations(wallet: string, chain: 'solana' | 'celo'): Promise<Recommendation[]> {
  const portfolio = chain === 'solana' ? await getPortfolio(wallet) : await getCeloPortfolio(wallet);
  
  if (!portfolio || portfolio.tokens.length === 0) {
    return [{
      id: 'welcome',
      type: 'swap',
      priority: 'high',
      title: 'Welcome to DiversiFi',
      description: 'Start by depositing tokens to your wallet to begin autonomous management.',
      risk: 'low',
      actions: ['Deposit tokens to wallet'],
    }];
  }

  const recommendations: Recommendation[] = [];
  const tokens = portfolio.tokens;
  const totalValue = portfolio.totalValue;

  // 1. Diversification check
  if (tokens.length < 3) {
    recommendations.push({
      id: 'diversify',
      type: 'rebalance',
      priority: 'high',
      title: 'Portfolio Diversification Needed',
      description: `Only ${tokens.length} token(s) detected. Consider diversifying across ${chain === 'solana' ? 'bSOL, ONDO, MP1' : 'cUSD, CELO, cEUR'}.`,
      potentialGain: 15,
      risk: 'medium',
      actions: ['Add new token positions', 'Spread allocation across 3+ assets'],
    });
  }

  // 2. Stablecoin allocation
  const stablecoins = tokens.filter(t => 
    ['USDC', 'USDT', 'cUSD', 'DAI'].some(s => t.symbol.toUpperCase().includes(s))
  );
  const stablecoinRatio = stablecoins.reduce((sum, t) => sum + t.value, 0) / totalValue;
  
  if (stablecoinRatio < 0.1) {
    recommendations.push({
      id: 'stablecoin-buffer',
      type: 'swap',
      priority: 'medium',
      title: 'Add Stablecoin Buffer',
      description: 'Less than 10% in stablecoins. Consider adding USDC/cUSD for stability.',
      potentialGain: 5,
      risk: 'low',
      actions: ['Swap 10-20% to stablecoins'],
    });
  }

  // 3. High concentration check
  const sortedTokens = [...tokens].sort((a, b) => b.value - a.value);
  const topToken = sortedTokens[0];
  const concentration = topToken.value / totalValue;
  
  if (concentration > 0.5) {
    recommendations.push({
      id: 'concentration-risk',
      type: 'rebalance',
      priority: 'high',
      title: `High ${topToken.symbol} Concentration`,
      description: `${topToken.symbol} is ${Math.round(concentration * 100)}% of portfolio. Reduce concentration risk.`,
      potentialGain: 10,
      risk: 'medium',
      actions: ['Rebalance to reduce top holding to <40%', 'Add alternative assets'],
    });
  }

  // 4. Staking opportunities (Solana)
  if (chain === 'solana') {
    const solToken = tokens.find(t => t.symbol === 'SOL');
    if (solToken && solToken.balance > 1) {
      recommendations.push({
        id: 'stake-sol',
        type: 'stake',
        priority: 'medium',
        title: 'Stake SOL for Yield',
        description: `You have ${solToken.balance.toFixed(2)} SOL. Consider staking for ~7% APY.`,
        potentialGain: 7,
        risk: 'low',
        actions: ['Stake SOL to bSOL or mSOL'],
      });
    }
  }

  // 5. Cross-chain opportunity (if has significant holdings)
  if (totalValue > 1000 && chain === 'solana') {
    recommendations.push({
      id: 'cross-chain-diversity',
      type: 'bridge',
      priority: 'low',
      title: 'Cross-Chain Diversification',
      description: 'Consider bridging to Celo for mobile money access and additional yield opportunities.',
      potentialGain: 5,
      risk: 'medium',
      actions: ['Bridge to Celo via Wormhole', 'Explore Celo DeFi'],
    });
  }

  // 6. Yield optimization
  if (totalValue > 500) {
    recommendations.push({
      id: 'yield-farming',
      type: 'swap',
      priority: 'medium',
      title: 'Explore Yield Opportunities',
      description: 'Your portfolio qualifies for yield optimization. Consider lending or farming.',
      potentialGain: 8,
      risk: 'medium',
      actions: ['Explore Jupiter yields', 'Consider lending protocols'],
    });
  }

  // 7. Rebalance if drift > 10%
  const targetAllocation = { [chain === 'solana' ? 'SOL' : 'CELO']: 40 };
  for (const [symbol, target] of Object.entries(targetAllocation)) {
    const token = tokens.find(t => t.symbol === symbol);
    if (token) {
      const currentPct = (token.value / totalValue) * 100;
      if (Math.abs(currentPct - target) > 10) {
        recommendations.push({
          id: 'rebalance-drift',
          type: 'rebalance',
          priority: currentPct > target ? 'low' : 'medium',
          title: `${symbol} Allocation Drift`,
          description: `${symbol} is ${Math.round(currentPct)}% vs target ${target}%. Rebalance needed.`,
          risk: 'low',
          actions: ['Run rebalance to restore target allocation'],
        });
      }
    }
  }

  // 8. Small balance consolidation
  const smallTokens = tokens.filter(t => t.value < 10 && t.value > 0);
  if (smallTokens.length > 2) {
    recommendations.push({
      id: 'consolidate',
      type: 'swap',
      priority: 'low',
      title: 'Consolidate Small Balances',
      description: `${smallTokens.length} tokens worth <$10 each. Consider consolidating.`,
      risk: 'low',
      actions: ['Swap small balances to larger position'],
    });
  }

  // 9. Gas optimization (Celo)
  if (chain === 'celo') {
    const celoToken = tokens.find(t => t.symbol === 'CELO');
    if (celoToken && celoToken.balance < 0.1) {
      recommendations.push({
        id: 'celo-gas',
        type: 'swap',
        priority: 'medium',
        title: 'Add CELO for Gas',
        description: 'Low CELO balance may cause failed transactions. Add small amount for gas.',
        risk: 'low',
        actions: ['Maintain minimum 0.1 CELO for gas'],
      });
    }
  }

  // 10. Hold recommendation
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'hold',
      type: 'hold',
      priority: 'low',
      title: 'Portfolio Balanced',
      description: 'Your portfolio is well-balanced. No immediate action needed.',
      risk: 'low',
      actions: ['Continue monitoring via DiversiFi'],
    });
  }

  return recommendations.sort((a, b) => {
    const priority = { high: 0, medium: 1, low: 2 };
    return priority[a.priority] - priority[b.priority];
  });
}
