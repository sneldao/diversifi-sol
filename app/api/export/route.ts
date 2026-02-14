import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');
  const format = searchParams.get('format') || 'json';
  const type = searchParams.get('type') || 'transactions';

  if (!wallet) return errorResponse('Wallet required', 400);

  // Mock data (in production, fetch from database)
  const data = type === 'transactions' ? [
    { date: '2024-01-15', type: 'swap', from: 'SOL', to: 'USDC', amount: 100, status: 'completed' },
    { date: '2024-01-20', type: 'rebalance', allocations: { SOL: 40, USDC: 60 }, status: 'completed' },
  ] : type === 'portfolio' ? [
    { date: '2024-01', holdings: { SOL: 50, USDC: 5000, value: 9750 } },
  ] : [];

  if (format === 'csv') {
    const csv = 'date,type,details\n' + data.map((d: unknown) => JSON.stringify(d)).join('\n');
    return new NextResponse(csv, {
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="${wallet}-${type}.csv"` },
    });
  }

  if (format === 'pdf') {
    return successResponse({ message: 'PDF export would be generated here', data });
  }

  return successResponse({ data, format, wallet, type });
}
