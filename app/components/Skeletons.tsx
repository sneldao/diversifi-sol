export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-800/50 rounded-2xl" />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-slate-800/50 rounded-2xl" />
        <div className="h-80 bg-slate-800/50 rounded-2xl" />
      </div>

      {/* Bottom sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-slate-800/50 rounded-2xl" />
        <div className="h-64 bg-slate-800/50 rounded-2xl" />
      </div>
    </div>
  );
}

export function PortfolioSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-slate-700" />
          <div className="flex-1">
            <div className="h-4 w-24 bg-slate-700 rounded mb-2" />
            <div className="h-3 w-16 bg-slate-600 rounded" />
          </div>
          <div className="text-right">
            <div className="h-4 w-20 bg-slate-700 rounded mb-1" />
            <div className="h-3 w-12 bg-slate-600 rounded ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GuardianSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center p-8 animate-pulse">
      <div className="w-32 h-32 rounded-2xl bg-slate-800" />
      <div className="mt-4 h-6 w-32 bg-slate-700 rounded" />
    </div>
  );
}

export function YieldSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 bg-slate-800/30 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="h-5 w-24 bg-slate-700 rounded" />
            <div className="h-6 w-16 bg-slate-600 rounded" />
          </div>
          <div className="h-3 w-full bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );
}
