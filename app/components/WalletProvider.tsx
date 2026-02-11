'use client';

import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';

// Multiple RPC endpoints for reliability
const RPC_ENDPOINTS = [
  process.env.NEXT_PUBLIC_HELIUS_RPC || 'https://api.helius-rpc.com/?api-key=e96c1161-caae-409e-bd32-f536c1d354ef',
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
];

function getRandomRPC() {
  return RPC_ENDPOINTS[Math.floor(Math.random() * RPC_ENDPOINTS.length)];
}

export function WalletStatus() {
  const { publicKey, connected, connecting, disconnecting } = useWallet();
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (connecting) {
      setStatus('connecting');
      setErrorMsg(null);
    } else if (connected && publicKey) {
      setStatus('connected');
      setErrorMsg(null);
    } else if (disconnecting) {
      setStatus('disconnected');
    }
  }, [connecting, connected, disconnecting, publicKey]);

  const walletAddress = useMemo(() => {
    if (publicKey) {
      return `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`;
    }
    return null;
  }, [publicKey]);

  if (status === 'connecting') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-amber-400 text-sm">Connecting...</span>
      </div>
    );
  }

  if (status === 'connected' && walletAddress) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span className="text-emerald-400 text-sm font-mono">{walletAddress}</span>
      </div>
    );
  }

  return (
    <WalletMultiButton 
      className="!px-4 !py-2 !rounded-lg !bg-emerald-500/20 !hover:bg-emerald-500/30 !border !border-emerald-500/30 !text-emerald-400 !text-sm !font-medium !transition-colors !flex !items-center !gap-2"
      startIcon={<Wallet className="w-4 h-4" />}
    >
      Connect Wallet
    </WalletMultiButton>
  );
}

function WalletDataFetcher({ children }: { children: (data: { balance: number | null; error: string | null }) => React.ReactNode }) {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!publicKey) return;
    
    let success = false;
    
    // Try each RPC endpoint
    for (const rpc of RPC_ENDPOINTS) {
      try {
        const { Connection } = await import('@solana/web3.js');
        const connection = new Connection(rpc, { commitment: 'confirmed' });
        const lamports = await connection.getBalance(publicKey);
        setBalance(lamports / 1e9);
        setError(null);
        success = true;
        break;
      } catch (err) {
        console.warn(`RPC ${rpc} failed, trying next...`);
      }
    }
    
    if (!success) {
      setError('Unable to fetch balance');
    }
  }, [publicKey]);

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    } else {
      setBalance(null);
      setError(null);
    }
  }, [connected, publicKey, fetchBalance]);

  return <>{children({ balance, error })}</>;
}

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={getRandomRPC()}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

// Export components
export { WalletDataFetcher };
