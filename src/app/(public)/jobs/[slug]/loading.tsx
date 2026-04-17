"use client";


export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f8faff]">
      {/* Skeleton for Search Header */}
      <div className="bg-white border-b border-slate-100 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="h-10 w-48 bg-slate-100 rounded-lg mb-8 animate-pulse mx-auto" />
          <div className="max-w-4xl mx-auto h-20 bg-slate-50 rounded-2xl animate-pulse" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex gap-8">
          {/* Sidebar Skeleton */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 h-[600px] animate-pulse" />
          </div>

          {/* Jobs List Skeleton */}
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-6 w-24 bg-slate-200 rounded animate-pulse" />
            </div>
            
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="bg-white rounded-2xl border border-slate-100 p-8 h-48 animate-pulse"
              >
                <div className="flex gap-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-xl" />
                  <div className="flex-1 space-y-4">
                    <div className="h-6 w-1/3 bg-slate-100 rounded" />
                    <div className="h-4 w-1/4 bg-slate-50 rounded" />
                    <div className="flex gap-4 pt-4">
                      <div className="h-8 w-20 bg-slate-100 rounded-lg" />
                      <div className="h-8 w-20 bg-slate-100 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
