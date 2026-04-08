"use client";

import { useState, useEffect } from "react";
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
  const [openJobs, setOpenJobs] = useState<any[]>([]);
  const [fetchingJobs, setFetchingJobs] = useState(false);

  useEffect(() => {
    const fetchOpenJobs = async () => {
      try {
        setFetchingJobs(true);
        const { dashboardServerFetch } = await import("@/actions/dashboardServerFetch");
        const res = await dashboardServerFetch<any>("open/jobs", { method: "GET" });
        if (res?.data) {
          setOpenJobs(Array.isArray(res.data) ? res.data.slice(0, 5) : []);
        }
      } catch (err) {
        console.error("Failed to fetch open jobs", err);
      } finally {
        setFetchingJobs(false);
      }
    };
    fetchOpenJobs();
  }, []);

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-6 bg-primary rounded-full" />
                   <h2 className="text-sm font-bold text-slate-800 tracking-tight">Recent Applications</h2>
                </div>
                <Link href="/dashboard/jobseeker/applied-jobs" className="text-[11px] font-bold text-primary hover:bg-primary/5 px-3 py-1 rounded-lg transition-all">View All History</Link>
              </div>
              {data?.recent_applications?.length ? (
                <ul className="divide-y divide-slate-50">
                  {data.recent_applications.map((app) => (
                    <li key={`${app.job_id}-${app.applied_at}`} className="p-5 hover:bg-slate-50/50 transition-colors group/item cursor-default">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 font-bold text-sm border border-slate-200 group-hover/item:border-primary/30 group-hover/item:text-primary transition-all duration-300 shadow-sm">
                            {app?.company_name?.[0] || app?.title?.[0] || "J"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 group-hover/item:text-primary transition-colors leading-none mb-1.5">{app?.title ?? "—"}</p>
                            <p className="text-[12px] font-semibold text-slate-500 leading-tight tracking-tight">{app?.company_name ?? "—"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`rounded-xl px-4 py-1.5 text-[11px] font-bold transition-all ${
                            app?.status?.toLowerCase() === 'applied' 
                              ? "bg-blue-50 text-blue-600 border border-blue-100" 
                              : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          }`}>
                            {app?.status ?? "Applied"}
                          </span>
                          <div className="hidden md:block text-right">
                              <p className="text-[11px] font-extrabold text-slate-300 tracking-tighter uppercase">{formatAppliedAt(app?.applied_at)}</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-16 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 text-slate-200 mb-6">
                      <Briefcase className="w-10 h-10" />
                  </div>
                  <h4 className="text-slate-800 font-bold mb-1">No applications yet</h4>
                  <p className="text-slate-400 text-sm font-medium">Your career journey starts here. Explore jobs to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area: Recommended Jobs */}
          <div className="space-y-6">
             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-50 bg-slate-50/20">
                   <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                     <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                     Recommended Ops
                   </h3>
                </div>
                <div className="p-4 space-y-4">
                   {fetchingJobs ? (
                     <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary/30" /></div>
                   ) : openJobs.length > 0 ? (
                     openJobs.map((job) => (
                       <Link key={job.id} href={`/jobs/${job.slug || job.id}`} className="block group">
                         <div className="p-3.5 rounded-xl border border-transparent hover:border-primary/10 hover:bg-primary/5 transition-all duration-300">
                            <h4 className="text-[13px] font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-1">{job.title}</h4>
                            <p className="text-[11px] text-slate-500 font-medium mt-1 mb-2">{job.employer?.company_name || 'Hiring Company'}</p>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                               <span>₹ {job.salary_min ? `${(Number(job.salary_min)/1000).toFixed(0)}k` : '—'}</span>
                               <span className="w-1 h-1 rounded-full bg-slate-200" />
                               <span>{job.location || 'Remote'}</span>
                            </div>
                         </div>
                       </Link>
                     ))
                   ) : (
                     <p className="text-[12px] text-slate-400 text-center py-8">No new recommendations today.</p>
                   )}
                   
                   <Link href="/jobs" className="block mt-4">
                      <button className="w-full py-3 rounded-xl bg-slate-900 text-white text-[11px] font-bold hover:bg-primary transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2">
                        Explore All Openings <ArrowRight className="w-3 h-3" />
                      </button>
                   </Link>
                </div>
             </div>
             
             {/* Simple Banner for Profile */}
             <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Star className="w-20 h-20 rotate-12" />
                </div>
                <h4 className="font-bold text-lg mb-2 relative z-10">Complete Profile</h4>
                <p className="text-[12px] text-indigo-100 font-medium mb-4 opacity-80 relative z-10 leading-relaxed">Boost your chances of getting hired by 40% by verifying your skills.</p>
                <Link href="/dashboard/jobseeker/profile" className="relative z-10">
                   <button className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold ring-1 ring-white/30 backdrop-blur-sm transition-all">Go to Profile</button>
                </Link>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
