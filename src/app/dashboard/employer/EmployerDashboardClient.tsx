"use client";

import { 
  Users, 
  Briefcase, 
  TrendingUp,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface LatestJob {
  id: number;
  title: string;
  job_status: string;
  created_at: string;
}

interface LatestApplication {
  id: number;
  status: string;
  created_at: string;
  job: {
    title: string;
  };
  job_seeker: {
    title: string;
    profile_photo: string | null;
    user: {
      name: string;
    };
  };
}

interface DashboardStats {
  total_jobs?: number;
  total_applications?: number;
  shortlisted_candidates?: number;
  total_recruiters?: number;
  company_verification?: number;
  latest_jobs?: LatestJob[];
  latest_applications?: LatestApplication[];
  employer_profile?: {
    is_profile_verified?: number;
    company_name?: string;
  };
}

export default function EmployerDashboardClient({ 
  welcomeName,
  dashboardData 
}: { 
  welcomeName: string,
  dashboardData?: DashboardStats 
}) {
  const stats = [
    { 
      label: "Open Job Listings", 
      value: dashboardData?.total_jobs?.toString() || "0", 
      icon: Briefcase, 
      color: "blue",
      trend: "Total Active"
    },
    { 
      label: "Total Applicants", 
      value: dashboardData?.total_applications?.toString() || "0", 
      icon: Users, 
      color: "indigo",
      trend: "Engagement"
    },
    { 
      label: "Shortlisted", 
      value: dashboardData?.shortlisted_candidates?.toString() || "0", 
      icon: UserCheck, 
      color: "emerald",
      trend: "Candidate Pool"
    },
    { 
      label: "Account Status", 
      value: dashboardData?.company_verification === 1 ? "Verified" : "Under Review", 
      icon: TrendingUp, 
      color: dashboardData?.company_verification === 1 ? "green" : "purple",
      trend: "Verification"
    },
  ];

  const getFullImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";
    return `${baseUrl}/${path.startsWith('/') ? path.slice(1) : path}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
      {/* Compact Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-primary">Employer Dashboard</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">
             Welcome, <span className="text-gray-900">{welcomeName}</span> • Synchronized
          </p>
        </div>
        
        <Link href="/dashboard/employer/post-job">
          <Button size="sm" className="h-9 px-6 rounded-lg font-bold text-xs tracking-tight shadow-lg shadow-primary/20 flex items-center gap-2 uppercase">
            <PlusCircle className="w-4 h-4" /> Launch Job
          </Button>
        </Link>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
             <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity -mr-8 -mt-8 rounded-full" />
             
             <div className="flex items-start justify-between mb-3 relative z-10">
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-110",
                  stat.color === 'blue' && "bg-blue-50 text-blue-600 border-blue-100",
                  stat.color === 'indigo' && "bg-indigo-50 text-indigo-600 border-indigo-100",
                  stat.color === 'emerald' && "bg-emerald-50 text-emerald-600 border-emerald-100",
                  stat.color === 'green' && "bg-emerald-50 text-emerald-600 border-emerald-100",
                  stat.color === 'purple' && "bg-purple-50 text-purple-600 border-purple-100",
                )}>
                  <stat.icon className="w-4.5 h-4.5" />
                </div>
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                  stat.color === 'blue' && "text-blue-400 border-blue-50",
                  stat.color === 'indigo' && "text-indigo-400 border-indigo-50",
                  stat.color === 'emerald' && "text-emerald-400 border-emerald-50",
                  stat.color === 'green' && "text-emerald-400 border-emerald-50",
                  stat.color === 'purple' && "text-purple-400 border-purple-50",
                )}>{stat.trend}</span>
             </div>
             
             <div className="space-y-0.5 relative z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{stat.label}</p>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
             </div>
          </div>
        ))}
      </div>

      {/* Compact Alert Section - Prominent Placement */}
      {dashboardData?.company_verification !== 1 && (
         <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between gap-4 shadow-md shadow-amber-100/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-amber-500 border border-amber-200 shadow-sm shrink-0">
                 <AlertCircle className="w-5.5 h-5.5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-amber-900 uppercase tracking-tight">Administrative Notice</p>
                <p className="text-[11px] text-amber-800/80 font-bold leading-relaxed tracking-tight uppercase">
                   Your institution profile is currently under review for verification.
                </p>
              </div>
            </div>
            <Link href="/dashboard/employer/company-profile">
               <Button size="sm" variant="outline" className="h-8.5 px-4 rounded-xl bg-white text-amber-600 border-amber-200 hover:bg-amber-100 text-[10px] font-bold uppercase transition-all shadow-sm">
                  Complete Setup
               </Button>
            </Link>
         </div>
      )}

      {/* Compact Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
         {/* Latest Applications - High Density List */}
         <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col min-h-[400px] overflow-hidden">
            <div className="px-5 py-3.5 border-b bg-gray-50/30 flex items-center justify-between">
               <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">Recent Candidate Trace</h2>
               </div>
               <Link href="/dashboard/employer/applicants" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1.5 uppercase transition-all hover:gap-2">
                  View Detail <ArrowRight className="w-3 h-3" />
               </Link>
            </div>
            
            <div className="flex-1 overflow-hidden">
               {dashboardData?.latest_applications && dashboardData.latest_applications.length > 0 ? (
                  <div className="divide-y border-t border-gray-50">
                     {dashboardData.latest_applications.slice(0, 5).map((app) => (
                        <div key={app.id} className="p-4 hover:bg-gray-50/50 transition-colors flex items-center gap-4 group">
                           <div className="relative w-11 h-11 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                              {app.job_seeker.profile_photo ? (
                                 <Image 
                                    src={getFullImageUrl(app.job_seeker.profile_photo)!} 
                                    alt={app.job_seeker.user.name} 
                                    fill 
                                    className="object-cover" 
                                 />
                              ) : (
                                 <Users className="w-5.5 h-5.5 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                              )}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 truncate flex items-center flex-wrap uppercase tracking-tight">
                                 {app.job_seeker.user.name}
                                 <span className="text-slate-300 font-bold mx-1.5 opacity-50">•</span>
                                 <span className="text-[10px] font-bold text-slate-400 italic lowercase tracking-tight">{app.job_seeker.title}</span>
                              </h4>
                              <p className="text-[10px] text-gray-500 truncate mt-0.5 font-bold tracking-tight uppercase">Applied for <span className="text-primary">{app.job.title}</span></p>
                           </div>
                           <div className="text-right shrink-0">
                              <span className={cn(
                                 "inline-flex px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tight border shadow-sm",
                                 app.status === 'shortlisted' ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-white text-slate-400 border-slate-100"
                              )}>
                                 {app.status}
                              </span>
                              <p className="text-[8px] text-slate-300 mt-1.5 font-bold uppercase tracking-widest">{new Date(app.created_at).toLocaleDateString()}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50/10">
                     <div className="w-16 h-16 bg-white border border-slate-50 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                        <Users className="w-8 h-8 text-slate-200" />
                     </div>
                     <h3 className="text-base font-bold text-slate-900 mb-1 uppercase tracking-tight">No New Trace</h3>
                     <p className="text-[10px] text-slate-400 max-w-xs mb-6 font-bold uppercase tracking-tight leading-relaxed">Applications will appear here as soon as teachers apply.</p>
                     <Link href="/dashboard/employer/post-job">
                        <Button variant="outline" size="sm" className="h-9 px-6 rounded-xl text-[10px] font-bold tracking-tight border border-slate-100 hover:bg-slate-50 uppercase transition-all shadow-sm">Post Hiring Post</Button>
                     </Link>
                  </div>
               )}
            </div>
         </div>

         {/* Sidebar Area: Quick Jobs & Status */}
         <div className="space-y-4">
            {/* Quick Jobs Section */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
               <div className="px-5 py-3 border-b bg-gray-50/30 flex items-center justify-between">
                  <h2 className="text-[10px] font-bold text-slate-900 tracking-tight uppercase">Active Positions</h2>
                  <Link href="/dashboard/employer/my-jobs" className="text-[9px] font-bold text-primary tracking-tight hover:underline flex items-center gap-1 uppercase transition-all hover:gap-1.5">Manage <ArrowRight className="w-3 h-3" /></Link>
               </div>
               <div className="divide-y max-h-[300px] overflow-y-auto custom-scrollbar">
                  {dashboardData?.latest_jobs && dashboardData.latest_jobs.length > 0 ? (
                     dashboardData.latest_jobs.map((job) => (
                        <div key={job.id} className="p-3.5 hover:bg-indigo-50/30 transition-all group">
                           <div className="flex items-start justify-between">
                              <h4 className="text-[11px] font-bold text-slate-800 group-hover:text-primary transition-colors truncate pr-4 uppercase tracking-tight">{job.title}</h4>
                              <span className={cn(
                                 "text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tight border",
                                 job.job_status === 'open' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-rose-50 text-rose-600 border-rose-100"
                              )}>
                                 {job.job_status}
                              </span>
                           </div>
                           <div className="flex items-center gap-3 mt-2 text-[9px] text-slate-400 font-bold tracking-tight uppercase">
                              <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-slate-300" /> {new Date(job.created_at).toLocaleDateString()}</span>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="p-8 text-center text-[10px] text-slate-300 font-bold uppercase tracking-tight leading-relaxed">No requirements posted yet.</div>
                  )}
               </div>
            </div>

            {/* Verification Status Banner (Always Compact) */}
            <div className={cn(
               "p-4 rounded-xl border relative overflow-hidden shadow-sm",
               dashboardData?.company_verification === 1 
               ? "bg-emerald-50 border-emerald-100" 
               : "bg-amber-50 border-amber-100"
            )}>
               <div className="flex items-start gap-4 relative z-10">
                  {dashboardData?.company_verification === 1 ? (
                     <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-emerald-200 shadow-inner shrink-0 scale-90">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                     </div>
                  ) : (
                     <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-amber-200 shadow-inner shrink-0 scale-90">
                        <AlertCircle className="w-6 h-6 text-amber-500" />
                     </div>
                  )}
                  <div className="space-y-0.5 pt-0.5">
                     <h4 className={cn(
                        "text-[10px] font-bold tracking-tight uppercase",
                        dashboardData?.company_verification === 1 ? "text-emerald-700" : "text-amber-700"
                     )}>
                        Account Trust Status
                     </h4>
                     <p className={cn(
                        "text-[10px] font-bold leading-relaxed tracking-tight uppercase opacity-70",
                        dashboardData?.company_verification === 1 ? "text-emerald-800" : "text-amber-800"
                     )}>
                        {dashboardData?.company_verification === 1 
                           ? "Your profile is verified and public." 
                           : "Validation is currently pending."}
                     </p>
                  </div>
               </div>
               <div className={cn(
                 "absolute -bottom-4 -right-4 w-12 h-12 rotate-12 opacity-10",
                 dashboardData?.company_verification === 1 ? "bg-emerald-500" : "bg-amber-500"
               )} />
            </div>

            {/* Quick Action Link */}
            <Link href="/dashboard/employer/post-job" className="block group">
               <div className="bg-primary p-4 rounded-xl shadow-xl shadow-primary/20 flex items-center justify-between group-hover:translate-y-[-2px] transition-all">
                  <div className="space-y-0.5">
                     <p className="text-[10px] font-bold text-white/50 tracking-tight uppercase">Institution Expansion</p>
                     <h4 className="text-xs font-bold text-white tracking-tight uppercase">Post Job Opening</h4>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10 group-hover:scale-110 transition-transform">
                     <PlusCircle className="w-5.5 h-5.5" />
                  </div>
               </div>
            </Link>
         </div>
      </div>
    </div>
  );
}
