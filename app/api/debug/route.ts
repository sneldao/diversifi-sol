import { NextResponse } from 'next/server';

export async function GET() {
  const heliusKey = process.env.HELIUS_API_KEY;
  const heliusRpc = process.env.NEXT_PUBLIC_HELIUS_RPC;
  
  return NextResponse.json({
    heliusKeySet: !!heliusKey,
    heliusKeyPreview: heliusKey ? heliusKey.substring(0, 10) + '...' : 'NOT SET',
    heliusRpc: heliusRpc || 'NOT SET',
    allEnv: Object.keys(process.env).filter(k => k.includes('HELIUS') || k.includes('BIRD')),
  });
}
