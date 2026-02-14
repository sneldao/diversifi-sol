import { successResponse } from '@/lib/api-utils';

// Available tools for agents
const TOOLS = {
  // Portfolio tools
  get_portfolio: {
    name: 'get_portfolio',
    description: 'Get current portfolio holdings and values',
    parameters: {
      wallet: 'string',
      chain: 'solana | celo',
    },
    returns: 'Portfolio object with tokens, values, allocations',
  },
  
  // Rebalancing tools
  rebalance: {
    name: 'rebalance',
    description: 'Rebalance portfolio to target allocations',
    parameters: {
      wallet: 'string',
      targetAllocations: 'object',
      dryRun: 'boolean',
    },
    returns: 'Rebalance plan with required actions',
  },
  
  // Swap tools
  swap: {
    name: 'swap',
    description: 'Swap one token for another via DEX',
    parameters: {
      fromToken: 'string',
      toToken: 'string',
      amount: 'number',
      wallet: 'string',
      chain: 'solana | celo',
    },
    returns: 'Swap transaction details',
  },
  
  // Alert tools
  set_alert: {
    name: 'set_alert',
    description: 'Create price or allocation alert',
    parameters: {
      wallet: 'string',
      token: 'string',
      condition: 'above | below | drift',
      threshold: 'number',
    },
    returns: 'Alert confirmation',
  },
  
  // Bridge tools
  bridge: {
    name: 'bridge',
    description: 'Bridge assets between chains',
    parameters: {
      fromChain: 'solana | celo',
      toChain: 'solana | celo',
      token: 'string',
      amount: 'number',
    },
    returns: 'Bridge transaction details',
  },
  
  // Mobile money tools
  withdraw_mobile: {
    name: 'withdraw_mobile',
    description: 'Withdraw to mobile money (M-Pesa, Airtel, etc.)',
    parameters: {
      agentId: 'string',
      provider: 'string',
      phoneNumber: 'string',
      amount: 'number',
    },
    returns: 'Withdrawal confirmation',
  },
  
  // Analysis tools
  analyze_portfolio: {
    name: 'analyze_portfolio',
    description: 'Analyze portfolio health and get recommendations',
    parameters: {
      wallet: 'string',
      chain: 'solana | celo',
    },
    returns: 'Health score, insights, recommendations',
  },
  
  // Backtest tools
  backtest: {
    name: 'backtest',
    description: 'Backtest strategy against historical data',
    parameters: {
      strategy: 'aggressive | balanced | conservative',
      initialAmount: 'number',
    },
    returns: 'Backtest results with returns, volatility, drawdown',
  },
  
  // Schedule tools
  schedule_rebalance: {
    name: 'schedule_rebalance',
    description: 'Schedule automatic rebalancing',
    parameters: {
      wallet: 'string',
      schedule: 'daily | weekly | monthly',
      allocations: 'object',
      threshold: 'number',
    },
    returns: 'Schedule confirmation',
  },
  
  // History tools
  get_history: {
    name: 'get_history',
    description: 'Get transaction history',
    parameters: {
      wallet: 'string',
      chain: 'solana | celo',
      limit: 'number',
    },
    returns: 'Transaction history array',
  },
};

export async function GET() {
  // Return tools organized by category
  const categorized = {
    portfolio: ['get_portfolio', 'analyze_portfolio'],
    trading: ['rebalance', 'swap', 'bridge'],
    alerts: ['set_alert'],
    mobile: ['withdraw_mobile'],
    analysis: ['backtest'],
    automation: ['schedule_rebalance'],
    history: ['get_history'],
  };

  return successResponse({
    tools: TOOLS,
    categories: categorized,
    total: Object.keys(TOOLS).length,
  });
}
