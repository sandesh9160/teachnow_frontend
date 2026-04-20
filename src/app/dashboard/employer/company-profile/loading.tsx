import { Building2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-48 bg-slate-100 rounded-lg" />
        <div className="h-4 w-64 bg-slate-50 rounded-lg" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 p-1 bg-slate-50 rounded-xl w-72 h-10 border border-slate-100" />

      {/* Content Card Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-100 p-8 space-y-8">
        <div className="flex gap-6 items-center">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-slate-100 rounded-lg" />
            <div className="h-4 w-60 bg-slate-50 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 bg-slate-50 rounded-lg" />
              <div className="h-10 w-full bg-slate-50 rounded-xl border border-slate-100" />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
          <div className="h-10 w-24 bg-slate-50 rounded-lg" />
          <div className="h-10 w-40 bg-slate-100 rounded-lg" />
        </div>
      </div>

      {/* Center Loader Overlay (Subtle) */}
      <div className="fixed inset-0 pointer-events-none flex flex-col items-center justify-center gap-3">
         <div className="w-12 h-12 rounded-2xl bg-white shadow-xl border border-slate-100 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary animate-bounce" />
         </div>
      </div>
    </div>
  );
}
