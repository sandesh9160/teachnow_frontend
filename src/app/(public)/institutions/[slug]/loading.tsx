import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center space-y-4 p-4">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-primary/40 animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Accessing Institution Details</h2>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Data...</p>
      </div>
    </div>
  );
}
