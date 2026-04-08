"use client";

import { 
  Users, 
  Briefcase, 
  PlusCircle,
  Clock,
  ArrowRight,
  CreditCard,
  Target,
  User
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { cn } from "@/lib/utils";
import Image from "next/image";


interface RecruiterDashboardStats {
  active_jobs: number;
  jobs_filled: number;
  total_applicants: number;
  credits: {
    total_credits: number;
    used_credits: number;
    remaining_credits: number;
    current_plan: string | null;
  };
  recent_jobs: any[];
  recent_applications: any[];
}

export default function RecruiterDashboardClient({ 
  welcomeName,
  dashboardData 
}: { 
  welcomeName: string,
  dashboardData?: RecruiterDashboardStats 
}) {
  const stats = [
    { 
      label: "Active Openings", 
      value: dashboardData?.active_jobs?.toString() || "0", 
      icon: Briefcase, 
      color: "blue",
      trend: "Operational"
    },
    { 
      label: "Total Applicants", 
      value: dashboardData?.total_applicants?.toString() || "0", 
      icon: Users, 
      color: "indigo",
      trend: "Pool"
    },
    { 
      label: "Jobs Filled", 
      value: dashboardData?.jobs_filled?.toString() || "0", 
      icon: Target, 
      color: "emerald",
      trend: "Success Rate"
    },
    { 
      label: "Available Credits", 
      value: dashboardData?.credits?.remaining_credits?.toString() || "0", 
      icon: CreditCard, 
      color: "purple",
      trend: dashboardData?.credits?.current_plan || "Credits"
    },
  ];


  const getFullImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";
    return `${baseUrl}/${path.startsWith('/') ? path.slice(1) : path}`;
  };


  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-5 pb-10">
      {/* Compact Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl font-semibold  text-primary">Recruiter Dashboard</h1>
          <p className="text-sm text-gray-500 font-semibold">
             Access Portal • <span className="text-gray-900">{welcomeName}</span>
          </p>
        </div>
        
        <Link href="/dashboard/recruiter/post-job">
          <Button size="sm" className="h-9 px-6 rounded-lg font-semibold text-sm  shadow-lg shadow-primary/20 flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> New Opening
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
                  stat.color === 'purple' && "bg-purple-50 text-purple-600 border-purple-100",
                )}>
                  <stat.icon className="w-4.5 h-4.5" />
                </div>
                <span className={cn(
                  "text-xs font-semibold  px-2 py-0.5 rounded-full border truncate max-w-[100px]",
                  stat.color === 'blue' && "text-blue-400 border-blue-50",
                  stat.color === 'indigo' && "text-indigo-400 border-indigo-50",
                  stat.color === 'emerald' && "text-emerald-400 border-emerald-50",
                  stat.color === 'purple' && "text-purple-400 border-purple-50",
                )}>{stat.trend}</span>
             </div>
             
             <div className="space-y-0.5 relative z-10">
                <p className="text-xs font-semibold text-slate-900">{stat.label}</p>
                <h3 className="text-xl font-bold text-slate-900">{stat.value}</h3>
             </div>
          </div>
        ))}
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
         {/* Latest Applications */}
         <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col min-h-[400px] overflow-hidden">
            <div className="px-5 py-3.5 border-b bg-gray-50/30 flex items-center justify-between">
               <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <h2 className="text-xs font-semibold text-emerald-600 ">Recent Applications</h2>
               </div>
               <Link href="/dashboard/recruiter/applicants" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1.5  transition-all hover:gap-2">
                  View All <ArrowRight className="w-3 h-3" />
               </Link>
            </div>
            
            <div className="flex-1 overflow-hidden">
               {dashboardData?.recent_applications && dashboardData.recent_applications.length > 0 ? (
                  <div className="divide-y border-t border-gray-50">
                     {dashboardData.recent_applications.slice(0, 5).map((app) => (
                        <div key={app.id} className="p-4 hover:bg-gray-50/50 transition-colors flex items-center gap-4 group">
                           <div className="relative w-11 h-11 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform flex items-center justify-center font-bold text-indigo-600 bg-indigo-50">
                              {app.job_seeker?.profile_photo ? (
                                 <Image 
                                    src={getFullImageUrl(app.job_seeker.profile_photo)!} 
                                    alt={app.job_seeker.user?.name || "User"} 
                                    fill 
                                    className="object-cover" 
                                 />
                              ) : (
                                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                     <User className="w-6 h-6" />
                                  </div>
                              )}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-slate-900 truncate flex items-center flex-wrap ">
                                 {app.job_seeker?.user?.name || "Applicant"}
                                 <span className="text-slate-300 font-semibold mx-1.5 opacity-50">•</span>
                                 <span className="text-xs font-semibold text-slate-400 italic lowercase ">{app.job_seeker?.title}</span>
                              </h4>
                              <p className="text-xs text-gray-500 truncate mt-0.5 font-semibold">Applied for <span className="text-primary">{app.job?.title}</span></p>
                           </div>
                           <div className="text-right shrink-0">
                              <span className={cn(
                                 "inline-flex px-2 py-0.5 rounded-full text-xs font-semibold  border shadow-sm",
                                 app.status === 'shortlisted' ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-white text-slate-400 border-slate-100"
                              )}>
                                 {app.status}
                              </span>
                              <p className="text-xs text-slate-300 mt-1.5 font-semibold">{new Date(app.created_at).toLocaleDateString('en-GB')}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50/10">
                     <div className="w-16 h-16 bg-white border border-slate-50 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                        <Users className="w-8 h-8 text-slate-200" />
                     </div>
                     <h3 className="text-base font-bold text-slate-900 mb-1 ">No Applications</h3>
                     <p className="text-[10px] text-slate-400 max-w-xs mb-6 font-semibold leading-relaxed">Applications will appear here as soon as teachers apply.</p>
                  </div>
               )}
            </div>
         </div>

         {/* Latest Jobs */}
         <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
               <div className="px-5 py-3 border-b bg-gray-50/30 flex items-center justify-between">
                  <h2 className="text-xs font-bold text-indigo-600 ">Recent Jobs</h2>
                  <Link href="/dashboard/recruiter/jobs" className="text-xs font-semibold text-primary  hover:underline flex items-center gap-1  transition-all hover:gap-1.5">Manage All <ArrowRight className="w-3 h-3" /></Link>
               </div>
               <div className="divide-y max-h-[400px] overflow-y-auto custom-scrollbar">
                  {dashboardData?.recent_jobs && dashboardData.recent_jobs.length > 0 ? (
                     dashboardData.recent_jobs.map((job) => (
                        <div key={job.id} className="p-3.5 hover:bg-indigo-50/30 transition-all group">
                           <div className="flex items-start justify-between">
                              <h4 className="text-sm font-semibold text-slate-800 group-hover:text-primary transition-colors truncate pr-4 ">{job.title}</h4>
                              <span className={cn(
                                 "text-xs font-semibold px-1.5 py-0.5 rounded-full",
                                 job.job_status === 'open' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-rose-50 text-rose-600 border-rose-100"
                              )}>
                                 {job.job_status}
                              </span>
                           </div>
                           <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-semibold">
                              <span className="flex items-center gap-1.5 text-primary">
                                 <Users className="w-3 h-3" /> {job.job_applications_count} Applicants
                              </span>
                              <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-slate-300" /> {new Date(job.created_at).toLocaleDateString('en-GB')}</span>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="p-8 text-center text-[10px] text-slate-300 font-semibold  leading-relaxed">No jobs found.</div>
                  )}
               </div>
            </div>

            {/* Credit Info */}
            <div className="p-5 bg-primary rounded-xl shadow-xl shadow-primary/20 text-white space-y-3">
               <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold   text-white/60">Subscription Usage</p>
                  <CreditCard className="w-4 h-4 text-white/60" />
               </div>
               <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">{dashboardData?.credits?.remaining_credits || 0}</h3>
                    <p className="text-xs font-semibold   text-white/60 mt-0.5">Remaining Credits</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold">{dashboardData?.credits?.used_credits || 0} / {dashboardData?.credits?.total_credits || 0}</p>
                    <p className="text-xs font-semibold   text-white/60 mt-0.5">Used Credits</p>
                  </div>
               </div>
               <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-white h-full" 
                    style={{ 
                      width: `${(dashboardData?.credits?.used_credits || 0) / (dashboardData?.credits?.total_credits || 1) * 100}%` 
                    }} 
                  />
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}
