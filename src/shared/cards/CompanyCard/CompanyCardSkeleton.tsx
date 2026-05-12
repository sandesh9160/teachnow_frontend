

export function CompanyCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-6 shadow-sm animate-pulse">
      <div className="flex items-start gap-4 mb-6">
        {/* Logo Skeleton */}
        <div className="h-14 w-14 shrink-0 rounded-2xl bg-slate-100" />
        
        {/* Title Skeleton */}
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-5 w-3/4 bg-slate-100 rounded" />
          <div className="h-3 w-1/2 bg-slate-50 rounded" />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <div className="h-3 w-4 bg-slate-100 rounded" />
        <div className="h-3 w-32 bg-slate-50 rounded" />
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4">
        <div className="h-4 w-24 bg-blue-50 rounded-lg" />
        <div className="h-3 w-16 bg-slate-50 rounded" />
      </div>
    </div>
  );
}

export default CompanyCardSkeleton;
