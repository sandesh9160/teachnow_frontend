

export function JobsSkeleton() {
  return (
    <div className="bg-[#F8FAFC] lg:h-[calc(100vh-5rem)] lg:overflow-hidden flex flex-col animate-pulse">
      {/* Search Header Skeleton */}
      <div className="border-b border-border bg-white sticky top-20 lg:static lg:shrink-0 z-40">
        <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-5xl mx-auto flex gap-4">
            <div className="h-12 flex-1 bg-slate-100 rounded-xl" />
            <div className="h-12 flex-1 bg-slate-100 rounded-xl hidden md:block" />
            <div className="h-12 w-32 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="flex-1 lg:overflow-hidden mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex flex-col lg:flex-row h-full gap-10">
          {/* Sidebar Skeleton */}
          <aside className="hidden w-72 shrink-0 lg:block h-full py-8">
            <div className="h-full bg-white rounded-2xl border border-slate-100 p-6 space-y-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 w-24 bg-slate-100 rounded" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-slate-50 rounded" />
                    <div className="h-3 w-3/4 bg-slate-50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Jobs List Skeleton */}
          <main className="flex-1 lg:h-full lg:overflow-y-auto py-8 space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div className="h-4 w-32 bg-slate-100 rounded" />
              <div className="h-8 w-40 bg-slate-100 rounded-lg" />
            </div>
            
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-2xl border border-slate-100 p-6 flex gap-6">
                <div className="h-16 w-16 bg-slate-100 rounded-xl shrink-0" />
                <div className="flex-1 space-y-4">
                  <div className="h-6 w-1/2 bg-slate-100 rounded" />
                  <div className="h-4 w-1/4 bg-slate-50 rounded" />
                  <div className="flex gap-4">
                    <div className="h-4 w-20 bg-slate-50 rounded" />
                    <div className="h-4 w-20 bg-slate-50 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}
