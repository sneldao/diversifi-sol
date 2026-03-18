// lib/ubi.ts - Multi-chain UBI framework for AI Agents

import { getUbiStatus } from './bsc';

// Generate a unique agent ID
export function generateAgentId(chain: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `agent.ubi.${chain}.${timestamp}.${random}`;
}

// UBI configuration per chain
export const UBI_CONFIG = {
  bsc: {
    chainId: 56,
    name: 'BNB Smart Chain',
    ubiToken: 'BNB',
    claimAmount: 0.01, // BNB per claim
    claimInterval: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  solana: {
    chainId: 'mainnet',
    name: 'Solana',
    ubiToken: 'SOL',
    claimAmount: 0.1,
    claimInterval: 30 * 24 * 60 * 60 * 1000,
  },
  celo: {
    chainId: 42220,
    name: 'Celo',
    ubiToken: 'CELO',
    claimAmount: 1,
    claimInterval: 30 * 24 * 60 * 60 * 1000,
  },
};

// Supported chains for UBI
export const SUPPORTED_CHAINS = ['bsc', 'solana', 'celo'];

// Multi-chain UBI status
export interface MultiChainUbiStatus {
  agentId: string;
  totalClaimed: number;
  chains: {
    chain: string;
    eligible: boolean;
    claimed: boolean;
    lastClaimed: string | null;
    pending: boolean;
    amount: number;
  }[];
  nextClaimTime: string | null;
}

// Get multi-chain UBI status
export async function getMultiChainUbiStatus(
  agentId: string,
  walletAddresses: Record<string, string>
): Promise<MultiChainUbiStatus> {
  const chains = await Promise.all(
    SUPPORTED_CHAINS.map(async (chain) => {
      const wallet = walletAddresses[chain];
      const config = UBI_CONFIG[chain as keyof typeof UBI_CONFIG];
      
      // In production, would check actual on-chain state
      return {
        chain,
        eligible: !!wallet,
        claimed: false,
        lastClaimed: null,
        pending: false,
        amount: config.claimAmount,
      };
    })
  );

  const totalClaimed = chains.reduce((sum, c) => sum + (c.claimed ? c.amount : 0), 0);
  const nextClaimTime = null; // Would calculate based on lastClaimed + interval

  return {
    agentId,
    totalClaimed,
    chains,
    nextClaimTime,
  };
}

// Claim UBI on a specific chain
export async function claimUbiOnChain(
  chain: string,
  wallet: string
): Promise<{ success: boolean; txHash?: string; amount: number; chain: string }> {
  if (!SUPPORTED_CHAINS.includes(chain)) {
    return { success: false, amount: 0, chain };
  }

  const config = UBI_CONFIG[chain as keyof typeof UBI_CONFIG];

  // In production, would submit actual transaction
  console.log(`Claiming UBI on ${chain}: ${config.claimAmount} ${config.ubiToken} to ${wallet}`);

  return {
    success: true,
    txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
    amount: config.claimAmount,
    chain,
  };
}

// Claim UBI on all chains
export async function claimAllUbi(
  walletAddresses: Record<string, string>
): Promise<{ success: boolean; claims: { chain: string; txHash?: string; amount: number; success: boolean }[] }> {
  const claims = await Promise.all(
    Object.entries(walletAddresses).map(async ([chain, wallet]) => {
      try {
        return await claimUbiOnChain(chain, wallet);
      } catch (error) {
        return { chain, success: false, amount: 0 };
      }
    })
  );

  const allSuccess = claims.every((c) => c.success);

  return {
    success: allSuccess,
    claims,
  };
}
