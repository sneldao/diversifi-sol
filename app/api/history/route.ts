import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface TransactionRecord {
  id: string;
  wallet: string;
  chain: 'solana' | 'celo';
  type: 'rebalance' | 'swap' | 'bridge' | 'alert';
  actions: Array<{
    fromToken: string;
    toToken: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
  }>;
  totalValue: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  txHash?: string;
}

// In-memory transaction store (use database in production)
const transactionStore = new Map<string, TransactionRecord>();

// Create transaction record
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { wallet, chain, type, actions, totalValue } = body;

  if (!wallet || !chain || !type || !actions?.length) {
    return errorResponse('Missing required: wallet, chain, type, actions', 400);
  }

  const transaction: TransactionRecord = {
    id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    wallet,
    chain,
    type,
    actions,
    totalValue: totalValue || 0,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  transactionStore.set(transaction.id, transaction);

  return successResponse(transaction, { type: 'transaction_created' });
}

// Get transaction history
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');
  const chain = searchParams.get('chain');
  const type = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '50');

  let transactions = Array.from(transactionStore.values());

  // Filter by wallet
  if (wallet) {
    transactions = transactions.filter(t => t.wallet === wallet);
  }

  // Filter by chain
  if (chain) {
    transactions = transactions.filter(t => t.chain === chain);
  }

  // Filter by type
  if (type) {
    transactions = transactions.filter(t => t.type === type);
  }

  // Sort by date, newest first
  transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Limit results
  transactions = transactions.slice(0, limit);

  // Calculate summary
  const summary = {
    total: transactionStore.size,
    pending: transactions.filter(t => t.status === 'pending').length,
    completed: transactions.filter(t => t.status === 'completed').length,
    failed: transactions.filter(t => t.status === 'failed').length,
    totalVolume: Array.from(transactionStore.values()).reduce((sum, t) => sum + t.totalValue, 0),
  };

  return successResponse({ transactions, summary });
}
