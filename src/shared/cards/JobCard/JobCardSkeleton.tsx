"use client";

// import { cn } from "@/lib/utils";

export function JobCardSkeleton() {
  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-200 bg-white p-4 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        {/* Logo Skeleton */}
        <div className="w-14 h-14 shrink-0 rounded-xl bg-slate-100" />
        
        {/* Title and Company Skeleton */}
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-3/4 bg-slate-100 rounded-md" />
          <div className="h-3 w-1/2 bg-slate-50 rounded-md" />
        </div>
        
        {/* Bookmark Skeleton */}
        <div className="w-8 h-8 rounded-full bg-slate-50" />
      </div>

      {/* Tags Skeleton */}
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-16 bg-slate-50 rounded-full" />
        <div className="h-6 w-20 bg-slate-50 rounded-full" />
      </div>

      {/* Details Skeleton */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-50" />
          <div className="h-3 w-32 bg-slate-50 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-50" />
          <div className="h-3 w-24 bg-slate-50 rounded" />
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="mt-auto flex gap-3">
        <div className="h-10 flex-1 bg-slate-100 rounded-lg" />
        <div className="h-10 w-24 bg-slate-50 rounded-lg" />
      </div>
    </div>
  );
}

export default JobCardSkeleton;
