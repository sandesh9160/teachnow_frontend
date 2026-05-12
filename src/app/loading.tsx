

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Header Skeleton */}
      <div className="h-20 w-full bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-12">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-6 w-32 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="hidden lg:flex items-center gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 w-20 bg-slate-50 rounded animate-pulse" />
          ))}
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-10 w-28 bg-slate-200 rounded-xl animate-pulse" />
        </div>
      </div>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-16 space-y-12">
        {/* Hero Skeleton */}
        <div className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="h-16 w-3/4 bg-slate-200 rounded-2xl mx-auto animate-pulse" />
          <div className="h-4 w-1/2 bg-slate-100 rounded mx-auto animate-pulse" />
          <div className="flex justify-center gap-4 pt-4">
            <div className="h-12 w-40 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-12 w-40 bg-slate-100 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Categories Grid Skeleton */}
        <div className="pt-20">
          <div className="h-10 w-48 bg-slate-200 rounded mx-auto mb-12 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-3xl border border-slate-100 animate-pulse shadow-sm" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
