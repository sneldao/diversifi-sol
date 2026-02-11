export function Footer() {
  return (
    <footer className="mt-16 pt-8 border-t border-slate-800">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-xl">
            🛡️
          </div>
          <div>
            <p className="font-semibold text-white">DiversiFi</p>
            <p className="text-sm text-slate-500">Autonomous Wealth Protection</p>
          </div>
        </div>
        
        <div className="flex gap-6 text-sm">
          <a 
            href="https://github.com/sneldao/diversifi-solana" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-emerald-400 transition-colors"
          >
            GitHub
          </a>
          <span className="text-slate-600">|</span>
          <a 
            href="https://farcaster.xyz/@diversifi" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-emerald-400 transition-colors"
          >
            FarCaster
          </a>
          <span className="text-slate-600">|</span>
          <a 
            href="https://moltbook.com/u/DiversiFi" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-emerald-400 transition-colors"
          >
            Moltbook
          </a>
        </div>
        
        <p className="text-sm text-slate-500">
          © 2025 DiversiFi | APIs: Helius + Jupiter
        </p>
      </div>
    </footer>
  );
}
