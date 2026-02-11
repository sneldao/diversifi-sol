'use client';

import { Shield, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function Error500() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Animated shield */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/30 to-orange-500/30 blur-xl animate-pulse" />
          <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-red-500/30 flex items-center justify-center">
            <Shield className="w-16 h-16 text-red-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-slate-400 mb-8">
          The Guardian encountered an unexpected error. Our systems have been notified.
        </p>

        {/* Error details */}
        <div className="bg-slate-900/50 rounded-xl p-4 mb-8 border border-slate-700/50">
          <div className="text-sm text-slate-500 mb-2">Error Code</div>
          <div className="text-red-400 font-mono">500 - Internal Server Error</div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Retry
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            <Home className="w-5 h-5" />
            Home
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-8 text-slate-500 text-sm">
          DiversiFi Portfolio Guardian • AI-Powered Protection
        </p>
      </div>
    </div>
  );
}
