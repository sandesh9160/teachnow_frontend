"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { Bookmark, Briefcase, Loader2, Star, ArrowRight } from "lucide-react";
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
    <div className="space-y-6 sm:space-y-8">
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-2xl md:text-4xl font-display font-semibold text-slate-800  flex items-center gap-2">
          Hello, {displayName || "Job Seeker"} <span className="animate-wave origin-bottom-right inline-block">👋</span>
        </h1>
        <p className="text-slate-600 mt-1 text-sm md:text-lg font-medium opacity-90">Track your progress and discover new opportunities.</p>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
          <p className="text-slate-400 font-medium italic animate-pulse text-sm">Gathering insights...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border-2 border-red-100 bg-red-50/50 p-6 text-center shadow-xl shadow-red-900/5">
          <p className="font-bold text-red-900 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="px-6 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95 text-sm"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              {/* Applied Jobs Card */}
              <div className="group relative overflow-hidden bg-white p-3.5 rounded-2xl border-2 border-slate-300 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-0.5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700" />
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-slate-600 font-bold text-[10px] mb-1">Applications</p>
                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight leading-normal mb-1">{data?.total_applied ?? 0}</h3>
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-indigo-500">Live tracking</span>
                    </div>
                  </div>
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-500 transition-all duration-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-12 group-hover:shadow-lg group-hover:shadow-indigo-600/20">
                      <Briefcase className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Shortlisted Card */}
              <div className="group relative overflow-hidden bg-white p-3.5 rounded-2xl border-2 border-slate-300 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-0.5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700" />
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-slate-600 font-bold text-[10px] mb-1">Interviews</p>
                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight leading-normal mb-1">{data?.total_shortlisted ?? 0}</h3>
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-500">Shortlisted</span>
                    </div>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500 transition-all duration-500 group-hover:bg-emerald-600 group-hover:text-white group-hover:-rotate-12 group-hover:shadow-lg group-hover:shadow-emerald-600/20">
                      <Star className="w-4 h-4 ml-[0.5px]" />
                  </div>
                </div>
              </div>

              {/* Saved Jobs Card */}
              <div className="group relative overflow-hidden bg-white p-3.5 rounded-2xl border-2 border-slate-300 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-0.5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700" />
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-slate-600 font-bold text-[10px] mb-1">Bookmarks</p>
                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight leading-normal mb-1">{data?.total_bookmarked ?? 0}</h3>
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span className="text-[10px] font-bold text-amber-500">Saved jobs</span>
                    </div>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-500 transition-all duration-500 group-hover:bg-amber-600 group-hover:text-white group-hover:rotate-12 group-hover:shadow-lg group-hover:shadow-amber-600/20">
                      <Bookmark className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-200/60 overflow-hidden">
              <div className="p-4 border-b-2 border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-5 bg-primary rounded-full" />
                   <h2 className="text-[14px] font-bold text-indigo-900 tracking-tight">Recent Activity</h2>
                </div>
                <Link href="/dashboard/jobseeker/applied-jobs" className="text-[11px] font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-primary/10">Full History</Link>
              </div>
              {data?.recent_applications?.length ? (
                <ul className="divide-y-2 divide-slate-100">
                  {data.recent_applications.map((app) => (
                    <li key={`${app.job_id}-${app.applied_at}`} className="p-4 hover:bg-slate-50 transition-colors group/item cursor-default">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold text-sm border border-indigo-100/50 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all duration-300 shadow-sm">
                            <span className="relative z-10">{app?.company_name?.[0] || app?.title?.[0] || "J"}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-indigo-950 group-hover/item:text-primary transition-colors leading-normal mb-0.5 text-[15px] truncate">{app?.title ?? "—"}</p>
                            <div className="flex items-center gap-2">
                               <p className="text-[12px] font-semibold text-slate-600 leading-normal truncate">{app?.company_name ?? "—"}</p>
                               <span className="w-1 h-1 rounded-full bg-slate-300" />
                               <p className="text-[11px] font-bold text-slate-500 whitespace-nowrap">{formatAppliedAt(app?.applied_at)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end">
                          <span className={`rounded-full px-4 py-1.5 text-[10px] font-extrabold transition-all border shadow-sm ${
                            app?.status?.toLowerCase() === 'applied' 
                              ? "bg-blue-50 text-blue-600 border-blue-200/50" 
                              : "bg-emerald-50 text-emerald-600 border-emerald-200/50"
                          }`}>
                            {app?.status ?? "Applied"}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-50 text-slate-200 mb-4 animate-pulse">
                      <Briefcase className="w-7 h-7" />
                  </div>
                  <h4 className="text-slate-800 font-bold mb-1 text-sm">No applications yet</h4>
                  <p className="text-slate-500 text-xs font-medium max-w-[200px] mx-auto opacity-80">Exciting opportunities are waiting for you. Start exploring today.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-4">
             {/* Profile Score Card */}
              <div className="relative group overflow-hidden bg-white border-2 border-slate-200/60 p-5 rounded-3xl shadow-xl shadow-slate-200/50 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-200/50">
               <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
               <div className="relative z-10">
                 <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                       <Star className="w-5 h-5" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">85% Complete</span>
                 </div>
                 <h4 className="text-[17px] font-bold text-indigo-900 mb-1.5">Profile Strength</h4>
                 <p className="text-[12px] text-slate-600 font-medium mb-5 leading-relaxed">Verified skills can boost your visibility by up to 3x in employer searches.</p>
                 
                 <div className="w-full h-1.5 bg-slate-100 rounded-full mb-5 overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full w-[85%] animate-pulse" />
                 </div>

                 <Link href="/dashboard/jobseeker/profile" className="block text-center">
                    <button className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-[12px] font-bold hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/20">
                      Boost My Profile
                    </button>
                 </Link>
               </div>
             </div>

             {/* AI Resume Card */}
             <div className="relative group overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 rounded-3xl shadow-xl shadow-indigo-200/50 transition-all duration-500 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform duration-700" />
                <div className="relative z-10">
                  <h4 className="text-[17px] font-bold text-white mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-300 animate-pulse" />
                    AI Resume Builder
                  </h4>
                  <p className="text-[12px] text-indigo-50 font-medium mb-5 leading-relaxed">Our smart AI creates tailored resumes that get you noticed instantly.</p>
                  
                  <Link href="/dashboard/jobseeker/resume" className="block">
                     <button className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white text-white hover:text-indigo-600 text-[12px] font-bold ring-1 ring-white/30 backdrop-blur-sm transition-all flex items-center justify-center gap-2 duration-300 shadow-lg">
                       Start Building
                       <ArrowRight className="w-3.5 h-3.5" />
                     </button>
                  </Link>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
