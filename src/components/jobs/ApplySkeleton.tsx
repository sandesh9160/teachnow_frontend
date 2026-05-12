

export function ApplySkeleton() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="border-b border-border bg-white h-12 flex items-center px-4 md:px-12">
        <div className="h-4 w-48 bg-slate-100 rounded" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8 space-y-2">
          <div className="h-8 w-64 bg-slate-200 rounded-lg" />
          <div className="h-4 w-48 bg-slate-100 rounded" />
        </div>

        {/* Steps Skeleton */}
        <div className="mb-10 flex justify-between">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center flex-1 last:flex-none">
              <div className="h-8 w-8 rounded-full bg-slate-100" />
              <div className="h-2 w-16 bg-slate-50 rounded mt-2" />
            </div>
          ))}
        </div>

        {/* Card Skeleton */}
        <div className="rounded-3xl border border-border bg-white p-8 shadow-sm space-y-8">
          <div className="flex gap-6">
            <div className="h-20 w-20 bg-slate-100 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="h-6 w-3/4 bg-slate-100 rounded" />
              <div className="h-4 w-1/2 bg-slate-50 rounded" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-50 rounded-xl" />
            ))}
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-50">
            <div className="h-4 w-32 bg-slate-100 rounded" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-slate-50 rounded" />
              <div className="h-3 w-full bg-slate-50 rounded" />
              <div className="h-3 w-3/4 bg-slate-50 rounded" />
            </div>
          </div>

          <div className="flex gap-4 pt-8">
            <div className="h-12 flex-1 bg-slate-100 rounded-xl" />
            <div className="h-12 flex-1 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
