"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { 
  Bookmark, 
  Briefcase, 
  Loader2, 
  Star, 
  ArrowRight, 
  Search, 
  Settings, 
  User, 
  FileText 
} from "lucide-react";
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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="space-y-1">
        <h1 className="text-[28px] font-bold text-[#1E1B4B] tracking-tight flex items-center gap-2">
          Welcome back, {displayName.split(' ')[0] || "Job Seeker"} 👋
        </h1>
        <p className="text-indigo-600/70 text-sm font-medium">Here&apos;s what&apos;s happening with your job search.</p>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary/30" />
          <p className="text-slate-400 font-medium italic animate-pulse text-sm">Synchronizing your dashboard...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border-2 border-red-100 bg-red-50/50 p-6 text-center shadow-xl shadow-red-900/5">
          <p className="font-bold text-red-900 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="px-6 py-2 rounded-xl bg-red-600 text-white font-bold"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          {/* Top Analytics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Jobs Applied Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1E1B4B] to-[#312E81] p-5 rounded-2xl shadow-lg group">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <p className="text-indigo-100/70 font-medium text-[13px] mb-1">Jobs Applied</p>
                  <p className="text-3xl font-bold text-white mb-1.5">{data?.total_applied ?? 0}</p>
                  <p className="text-[11px] font-medium text-indigo-200/50">+3 this week</p>
                </div>
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <Briefcase className="w-6 h-6 text-white opacity-80" />
              </div>
            </div>

            {/* Saved Jobs Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#312E81] to-[#4338CA] p-5 rounded-2xl shadow-lg">
              <div className="relative z-10">
                <p className="text-indigo-100/70 font-medium text-[13px] mb-1">Saved Jobs</p>
                <p className="text-3xl font-bold text-white mb-1.5">{data?.total_bookmarked ?? 0}</p>
                <p className="text-[11px] font-medium text-indigo-200/50">2 expiring soon</p>
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <Bookmark className="w-6 h-6 text-white opacity-80" />
              </div>
            </div>

            {/* Profile Completion Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#059669] to-[#10B981] p-5 rounded-2xl shadow-lg">
              <div className="relative z-10">
                <p className="text-slate-100 font-medium text-[13px] mb-1">Profile Completion</p>
                <p className="text-3xl font-bold text-white mb-1.5">85%</p>
                <p className="text-[11px] font-medium text-emerald-100/70">Add resume to complete</p>
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <User className="w-6 h-6 text-white opacity-80" />
              </div>
            </div>

            {/* Interview Invitations Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#EA580C] to-[#F97316] p-5 rounded-2xl shadow-lg">
              <div className="relative z-10">
                <p className="text-slate-100 font-medium text-[13px] mb-1">Interview Invitations</p>
                <p className="text-3xl font-bold text-white mb-1.5">{data?.total_shortlisted ?? 0}</p>
                <p className="text-[11px] font-medium text-orange-100/70">+1 this week</p>
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <Star className="w-6 h-6 text-white opacity-80" />
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="space-y-4 pt-2">
            <h3 className="text-[15px] font-bold text-[#1E1B4B]">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: "Browse Jobs", desc: "Explore 12,000+ teaching opportunities", icon: Search, color: "text-blue-500", bg: "bg-blue-50" },
                { label: "Saved Jobs", desc: "View your bookmarked positions", icon: Bookmark, color: "text-indigo-500", bg: "bg-indigo-50" },
                { label: "My Applications", desc: "Track your application status", icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-50", link: "Get started ↗" },
                { label: "Update Resume", desc: "Keep your resume current", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Profile Settings", desc: "Manage your teacher profile", icon: Settings, color: "text-indigo-600", bg: "bg-indigo-50" },
              ].map((action) => (
                <div key={action.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group flex flex-col justify-between h-full">
                  <div>
                    <div className={`w-10 h-10 rounded-xl ${action.bg} ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-[13.5px] font-bold text-indigo-950/80 mb-1">{action.label}</h4>
                    <p className="text-[11px] text-indigo-600/70 font-medium leading-relaxed mb-3">{action.desc}</p>
                  </div>
                  {action.link && (
                    <span className="text-[11px] font-bold text-emerald-600 mt-auto">{action.link}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Grid: Recent Activity & Latest Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 pb-10">
            {/* Recent Applications */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-[#1E1B4B]">Recent Applications</h3>
                <Link href="/dashboard/jobseeker/applied-jobs" className="text-[11px] font-bold text-[#0046B5] flex items-center gap-1 group">
                  View All <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto">
                {data?.recent_applications?.length ? (
                  <div className="divide-y divide-slate-50">
                    {data.recent_applications.map((app) => (
                      <div key={app.job_id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-bold border border-slate-100 shrink-0">
                            {app?.company_name?.[0] || app?.title?.[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-indigo-950 truncate">{app?.title}</p>
                            <p className="text-[11px] font-medium text-indigo-600/70 truncate">{app?.company_name}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold border ${
                            app?.status?.toLowerCase() === 'applied' 
                              ? 'bg-blue-50 text-blue-600 border-blue-100' 
                              : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                            {app?.status || "Applied"}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">{formatAppliedAt(app?.applied_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-60 flex flex-col items-center justify-center text-center p-6 grayscale opacity-40">
                    <Briefcase className="w-10 h-10 mb-3" />
                    <p className="text-xs font-bold uppercase tracking-widest">No Activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Latest Job Alerts */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-[#1E1B4B]">Latest Job Alerts</h3>
                <Link href="/jobs" className="text-[11px] font-bold text-[#0046B5] flex items-center gap-1 group">
                  Browse All <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <div className="flex-1">
                <div className="divide-y divide-slate-50">
                  {[
                    { title: "Senior Physics Teacher", location: "Hyderabad, India", salary: "₹50,000 - ₹80,000", time: "2h ago" },
                    { title: "Secondary Math Educator", location: "Bangalore, India", salary: "₹45,000 - ₹75,000", time: "5h ago" },
                    { title: "English Language Specialist", location: "Delhi, India", salary: "₹60,000 - ₹90,000", time: "1d ago" },
                  ].map((job, idx) => (
                    <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-100">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-indigo-950 truncate">{job.title}</p>
                          <div className="flex items-center gap-2">
                             <p className="text-[11px] font-medium text-indigo-600/70 truncate">{job.location}</p>
                             <span className="w-1 h-1 rounded-full bg-slate-200" />
                             <p className="text-[11px] font-bold text-[#0046B5]">{job.salary}</p>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 ml-4">
                        <span className="text-[11px] font-medium text-slate-400">{job.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


