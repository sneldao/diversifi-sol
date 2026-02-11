'use client';

import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useMemo, useState, useEffect } from 'react';
import { Shield, Wallet } from 'lucide-react';

// Use Helius RPC for better reliability - falls back to public RPC if env var not set
const endpoint = process.env.NEXT_PUBLIC_HELIUS_RPC || 'https://api.mainnet-beta.solana.com';

function WalletButton() {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  
  const walletAddress = useMemo(() => {
    if (publicKey) {
      return `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`;
    }
    return null;
  }, [publicKey]);

  // Fetch balance when connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) return;
      
      try {
        const { Connection } = await import('@solana/web3.js');
        const connection = new Connection(endpoint);
        const lamports = await connection.getBalance(publicKey);
        setBalance(lamports / 1e9);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    if (connected && publicKey) {
      fetchBalance();
    }
  }, [connected, publicKey, endpoint]);

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-3">
        {balance !== null && (
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-emerald-500/20">
            <span className="text-emerald-400 font-medium">{balance.toFixed(4)} SOL</span>
          </div>
        )}
        <div className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer" onClick={() => document.getElementById('wallet-modal')?.click()}>
          <Wallet className="w-4 h-4" />
          {walletAddress}
        </div>
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

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

// Export the button as a separate component that uses the hooks
export { WalletButton };
