"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { Bookmark, Briefcase, Loader2, Star } from "lucide-react";
import Link from "next/link";

function formatAppliedAt(iso: string | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function JobSeekerDashboardClient({ displayName }: { displayName: string }) {
  const { data, loading, error, refetch } = useDashboard();

  return (
    <div className="space-y-10">
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 tracking-tight flex items-center gap-3">
          Welcome back, {displayName || "Job Seeker"} <span className="animate-wave origin-bottom-right inline-block">👋</span>
        </h1>
        <p className="text-slate-500 mt-2 text-lg font-medium opacity-80">Here is what is happening with your job search today.</p>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
          <p className="text-slate-400 font-medium italic animate-pulse">Gathering insights...</p>
        </div>
      ) : error ? (
        <div className="rounded-3xl border-2 border-red-100 bg-red-50/50 p-8 text-center shadow-xl shadow-red-900/5">
          <p className="font-bold text-red-900 text-lg mb-4">{error}</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
            {/* Applied Jobs Card */}
            <div className="group relative overflow-hidden bg-white p-4 rounded-xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-0.5">
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mb-1">Jobs Applied</p>
                  <h3 className="text-3xl font-bold text-slate-800 tracking-tight leading-none mb-2">{data?.total_applied ?? 0}</h3>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-bold text-primary tracking-wide">Live</span>
                  </div>
                </div>
                <div className="p-2 bg-primary/5 rounded-lg text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Briefcase className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Shortlisted Card */}
            <div className="group relative overflow-hidden bg-white p-4 rounded-xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-0.5">
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mb-1">Shortlisted</p>
                  <h3 className="text-3xl font-bold text-slate-800 tracking-tight leading-none mb-2">{data?.total_shortlisted ?? 0}</h3>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    <span className="text-[10px] font-bold text-indigo-500 tracking-wide">Target</span>
                  </div>
                </div>
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500 transition-colors group-hover:bg-indigo-500 group-hover:text-white">
                    <Star className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Saved Jobs Card */}
            <div className="group relative overflow-hidden bg-white p-4 rounded-xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-0.5">
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mb-1">Saved Jobs</p>
                  <h3 className="text-3xl font-bold text-slate-800 tracking-tight leading-none mb-2">{data?.total_bookmarked ?? 0}</h3>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 tracking-wide">Saved</span>
                  </div>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400 transition-colors group-hover:bg-slate-900 group-hover:text-white">
                    <Bookmark className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden max-w-4xl">
            <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
              <h2 className="text-[11px] font-bold text-slate-500 tracking-wider">Recent Applications</h2>
              <Link href="/dashboard/jobseeker/applied-jobs" className="text-[11px] font-bold text-primary hover:text-secondary transition-colors">View All</Link>
            </div>
            {data?.recent_applications?.length ? (
              <ul className="divide-y divide-slate-50">
                {data.recent_applications.map((app) => (
                  <li key={`${app.job_id}-${app.applied_at}`} className="p-4 hover:bg-slate-50/50 transition-colors group/item cursor-default">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-sm border border-slate-100 group-hover/item:border-primary/20 group-hover/item:bg-white group-hover/item:text-primary transition-all duration-300 shadow-sm">
                          {app?.company_name?.[0] || app?.title?.[0] || "J"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 group-hover/item:text-primary transition-colors leading-none mb-1.5">{app?.title ?? "—"}</p>
                          <p className="text-[12px] font-semibold text-slate-500 leading-tight tracking-tight">{app?.company_name ?? "—"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`rounded-lg px-3 py-1 text-[11px] font-bold transition-all ${
                          app?.status?.toLowerCase() === 'applied' 
                            ? "bg-blue-50 text-blue-600 border border-blue-100" 
                            : "bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm"
                        }`}>
                          {app?.status ?? "Applied"}
                        </span>
                        <div className="hidden md:block text-right">
                            <p className="text-[11px] font-semibold text-slate-400">{formatAppliedAt(app?.applied_at)}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-300 mb-4 italic">
                    <Briefcase className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-slate-400 font-medium italic">Your career journey starts here. Explore jobs to get started.</p>
              </div>
            )}
          </div>
        </>
      ) as React.ReactNode}
    </div>
  );
}
