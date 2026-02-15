import { successResponse } from '@/lib/api-utils';

// Agent action templates for common workflows
const WORKFLOWS = {
  'daily-review': {
    name: 'Daily Portfolio Review',
    description: 'Morning check of portfolio health and rebalancing needs',
    steps: [
      { tool: 'get_portfolio', params: '{wallet}' },
      { tool: 'analyze_portfolio', params: '{wallet}' },
      { tool: 'get_history', params: '{wallet, limit: 5}' },
    ],
  },
  
  'rebalance-triggered': {
    name: 'Triggered Rebalance',
    description: 'Rebalance when allocation drifts beyond threshold',
    steps: [
      { tool: 'get_portfolio', params: '{wallet}' },
      { tool: 'analyze_portfolio', params: '{wallet}' },
      { tool: 'rebalance', params: '{wallet, targetAllocations, dryRun: true}' },
    ],
  },
  
  'cross-chain-setup': {
    name: 'Cross-Chain Setup',
    description: 'Set up portfolio across Solana and Celo',
    steps: [
      { tool: 'get_portfolio', params: '{wallet, chain: solana}' },
      { tool: 'bridge', params: '{fromChain: solana, toChain: celo, token: USDC, amount}' },
      { tool: 'schedule_rebalance', params: '{wallet, schedule: weekly}' },
    ],
  },
  
  'mobile-money-withdrawal': {
    name: 'Mobile Money Withdrawal',
    description: 'Convert crypto to mobile money (M-Pesa, Airtel)',
    steps: [
      { tool: 'get_portfolio', params: '{wallet, chain: celo}' },
      { tool: 'swap', params: '{fromToken: cUSD, toToken: CELO, amount}' },
      { tool: 'withdraw_mobile', params: '{provider, phoneNumber, amount}' },
    ],
  },
  
  'emergency-safety': {
    name: 'Emergency Portfolio Safety',
    description: 'Move all to stablecoins in market: [{ downturn }]',
    steps: [
      { tool: 'get_portfolio', params: '{wallet}' },
      { tool: 'swap', params: '{fromToken: SOL, toToken: USDC, amount: all}' },
      { tool: 'set_alert', params: '{token: USDC, condition: above, threshold: 80}' },
    ],
  },
};

export async function GET() {
  return successResponse({ workflows: WORKFLOWS });
}

export async function POST(request: Request) {
  const { workflow, wallet, params } = await request.json();
  
  if (!workflow || !WORKFLOWS[workflow as keyof typeof WORKFLOWS]) {
    return Response.json({ error: 'Invalid workflow' }, { status: 400 });
  }
  
  const template = WORKFLOWS[workflow as keyof typeof WORKFLOWS];
  
  // Generate executable steps with params
  const steps = template.steps.map(step => ({
    ...step,
    params: step.params.replace(/{(\w+)}/g, (_, key) => params?.[key] || ''),
  }));
  
  return successResponse({
    workflow: template.name,
    steps,
    executeMode: params?.execute || 'preview',
  });
}
