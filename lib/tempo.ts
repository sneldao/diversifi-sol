// lib/tempo.ts - Tempo stablecoin payments for DiversiFi
// Using viem for Tempo chain transactions

import { createWalletClient, http, parseEther, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Tempo testnet chain
export const tempoChain = {
  id: 3301, // Tempo testnet
  name: 'Tempo',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.tempo.xyz'] },
    public: { http: ['https://rpc.testnet.tempo.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Tempo Explorer', url: 'https://explorer.testnet.tempo.xyz' },
  },
  testnet: true,
} as const;

// USDC on Tempo (example TIP-20 token)
export const USDC_TEMPO = '0x20c0000000000000000000000000000000000001';

// Create Tempo client with private key
export function createTempoClient(privateKey: `0x${string}`) {
  const account = privateKeyToAccount(privateKey);
  
  return createWalletClient({
    account,
    chain: tempoChain,
    transport: http('https://rpc.testnet.tempo.xyz'),
  });
}

// Pay for a transaction with stablecoins (feeToken)
export async function sendStablecoinTransaction({
  to,
  data = '0x',
  value = 0n,
  feeToken = USDC_TEMPO,
  privateKey,
}: {
  to: `0x${string}`;
  data?: `0x${string}`;
  value?: bigint;
  feeToken?: `0x${string}`;
  privateKey: `0x${string}`;
}) {
  const client = createTempoClient(privateKey);
  
  const hash = await client.sendTransaction({
    to,
    data,
    value,
    // @ts-ignore - Tempo-specific field
    feeToken,
    // @ts-ignore - Tempo-specific field  
    feePayer: undefined, // Set to enable fee sponsorship
  });
  
  return hash;
}

// Example: Pay for DiversiFi premium analysis ($0.05 USDC)
export async function payForPremium({
  userPrivateKey,
  amount = 0.05, // $0.05
}: {
  userPrivateKey: `0x${string}`;
  amount?: number;
}) {
  // Convert $0.05 to USDC (6 decimals)
  const amountWei = parseUnits(amount.toString() as `${number}`, 6);
  
  // In production, this would be the DiversiFi treasury address
  const recipient = process.env.MPP_RECIPIENT as `0x${string}` || '0x742d35Cc6634C0532925a3b844Bc9e7595f0fAb1';
  
  const hash = await sendStablecoinTransaction({
    to: recipient,
    data: '0x', // Simple transfer
    value: amountWei,
    feeToken: USDC_TEMPO,
    privateKey: userPrivateKey,
  });
  
  return hash;
}

// Get Tempo balance
export async function getTempoBalance(address: `0x${string}`) {
  const client = createWalletClient({
    chain: tempoChain,
    transport: http('https://rpc.testnet.tempo.xyz'),
  });
  
  const balance = await client.getBalance({ address });
  return balance;
}
