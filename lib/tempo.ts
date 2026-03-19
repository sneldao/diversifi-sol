// lib/tempo.ts - Tempo stablecoin payments for DiversiFi
// Using viem for Tempo chain transactions

import { createWalletClient, http, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Tempo testnet chain
export const tempoChain = {
  id: 3301, // Tempo testnet
  name: 'Tempo Testnet',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.tempo.xyz'] },
    public: { http: ['https://rpc.testnet.tempo.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Tempo Explorer', url: 'https://explorer.testnet.tempo.xyz' },
  },
  testnet: true,
} as const;

// USDC on Tempo testnet
export const USDC_TEMPO = '0x20c0000000000000000000000000000000000001';

// Create Tempo wallet client
export function createTempoWalletClient(privateKeyHex: string) {
  const account = privateKeyToAccount(privateKeyHex as `0x${string}`);
  
  return createWalletClient({
    account,
    chain: tempoChain,
    transport: http('https://rpc.testnet.tempo.xyz'),
  });
}

// Transfer USDC (TIP-20 token) on Tempo - pay fees with stablecoins too!
export async function transferUSDC({
  privateKey,
  to,
  amountUSD, // e.g., 0.05 for $0.05
  feeToken = USDC_TEMPO, // Pay fees in USDC too!
}: {
  privateKey: string;
  to: string;
  amountUSD: number;
  feeToken?: string;
}) {
  const client = createTempoWalletClient(privateKey);
  
  // Transfer USDC (6 decimals)
  const amountWei = parseUnits(amountUSD.toString() as `${number}`, 6);
  
  const { transactionHash } = await client.token.transferSync({
    amount: amountWei,
    to: to as `0x${string}`,
    token: feeToken,
    // Pay fees in the same token (USDC) - no ETH needed!
    feeToken: feeToken,
  });
  
  return {
    txHash: transactionHash,
    amount: amountUSD,
    token: 'USDC',
    chain: 'tempo-testnet',
  };
}

// Get USDC balance on Tempo
export async function getUSDCBalance(address: string, privateKey: string) {
  const client = createTempoWalletClient(privateKey);
  
  const balance = await client.readContract({
    address: USDC_TEMPO,
    abi: ['function balanceOf(address) view returns (uint256)'],
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
  });
  
  return balance;
}

// Example usage for DiversiFi premium ($0.05):
/*
const result = await transferUSDC({
  privateKey: userPrivateKey,
  to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0fAb1', // DiversiFi treasury
  amountUSD: 0.05, // $0.05 for premium analysis
  feeToken: USDC_TEMPO, // Pay gas in USDC too!
});
console.log('Paid:', result.txHash);
*/
