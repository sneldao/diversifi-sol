import { NextRequest, NextResponse } from 'next/server';
import { getPortfolio } from '@/lib/helius';
import { getCeloPortfolio } from '@/lib/celo';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface Alert {
  id: string;
  wallet: string;
  chain: 'solana' | 'celo';
  token: string;
  condition: 'above' | 'below' | 'drift';
  threshold: number;
  currentValue?: number;
  triggered: boolean;
  createdAt: string;
}

// In-memory alert store (use Redis in production)
const alertsStore = new Map<string, Alert>();

// Check alerts and return triggered ones
async function checkAlerts(wallet: string, chain: 'solana' | 'celo'): Promise<Alert[]> {
  const portfolio = chain === 'solana' 
    ? await getPortfolio(wallet) 
    : await getCeloPortfolio(wallet);

  if (!portfolio) return [];

  const triggered: Alert[] = [];

  for (const [id, alert] of alertsStore) {
    if (alert.wallet !== wallet || alert.chain !== chain) continue;
    if (alert.triggered) continue;

    const token = portfolio.tokens.find(t => 
      t.symbol.toLowerCase() === alert.token.toLowerCase()
    );

    if (!token) continue;

    alert.currentValue = (token.value / portfolio.totalValue) * 100;

    switch (alert.condition) {
      case 'above':
        if (alert.currentValue > alert.threshold) alert.triggered = true;
        break;
      case 'below':
        if (alert.currentValue < alert.threshold) alert.triggered = true;
        break;
      case 'drift':
        const drift = Math.abs(alert.currentValue - alert.threshold);
        if (drift > 5) alert.triggered = true; // 5% drift threshold
        break;
    }

    if (alert.triggered) triggered.push(alert);
  }

  return triggered;
}

// POST - Create alert
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { wallet, chain, token, condition, threshold } = body;

  if (!wallet || !chain || !token || !condition || !threshold) {
    return errorResponse('Missing required fields: wallet, chain, token, condition, threshold', 400);
  }

  if (!['solana', 'celo'].includes(chain)) {
    return errorResponse('Chain must be solana or celo', 400);
  }

  const alert: Alert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    wallet,
    chain,
    token,
    condition,
    threshold,
    triggered: false,
    createdAt: new Date().toISOString(),
  };

  alertsStore.set(alert.id, alert);

  return successResponse(alert, { type: 'alert_created' });
}

// GET - Get alerts or check status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');
  const check = searchParams.get('check'); // 'true' to check alerts

  // Return all alerts for wallet
  if (wallet) {
    const walletAlerts = Array.from(alertsStore.values()).filter(a => a.wallet === wallet);
    
    // Optionally check and update trigger status
    if (check === 'true') {
      const triggered = await checkAlerts(wallet, 'solana');
      const celoTriggered = await checkAlerts(wallet, 'celo');
      return successResponse({
        alerts: walletAlerts,
        triggered: [...triggered, ...celoTriggered],
      });
    }

    return successResponse({ alerts: walletAlerts });
  }

  // Return all alerts
  return successResponse({ alerts: Array.from(alertsStore.values()) });
}

// DELETE - Remove alert
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const alertId = searchParams.get('id');

  if (!alertId) {
    return errorResponse('Alert ID required', 400);
  }

  const deleted = alertsStore.delete(alertId);
  return successResponse({ deleted });
}
