import { Shield, Search, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Animated shield */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 blur-xl animate-pulse" />
          <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-emerald-500/30 flex items-center justify-center">
            <Shield className="w-16 h-16 text-emerald-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-slate-400 mb-8">
          The Guardian could not locate this page. It may have been moved or never existed.
        </p>

        {/* Search illustration */}
        <div className="bg-slate-900/50 rounded-xl p-6 mb-8 border border-slate-700/50">
          <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <div className="text-sm text-slate-500">
            Looking for something specific?
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
          >
            <Home className="w-5 h-5" />
            Return Home
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-8 pt-8 border-t border-slate-800">
          <div className="text-sm text-slate-500 mb-4">Quick links</div>
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link href="/" className="text-emerald-400 hover:text-emerald-300">
              Dashboard
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="https://github.com/sneldao/diversifi-solana" className="text-emerald-400 hover:text-emerald-300">
              GitHub
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="https://diversifi-sol.vercel.app" className="text-emerald-400 hover:text-emerald-300">
              Docs
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-slate-500 text-sm">
          DiversiFi Portfolio Guardian • AI-Powered Protection
        </p>
      </div>
    </div>
  );
}
