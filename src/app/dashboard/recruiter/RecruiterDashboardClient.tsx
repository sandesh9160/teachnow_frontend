"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Briefcase, 
  PlusCircle,
  Clock,
  CreditCard,
  Target,
  User,
  Sparkles,
  MapPin,
  Building2,
  ExternalLink
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
    current_plan?: {
      plan_name: string;
      expires_at: string;
    } | null;
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
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const response = await fetch("https://teachnowbackend.jobsvedika.in/api/open/home/featured-jobs");
        const res = await response.json();
        if (res.status && res.data) {
          setFeaturedJobs(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch featured jobs:", error);
      }
    };
    fetchFeaturedJobs();
  }, []);
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
      trend: dashboardData?.credits?.current_plan?.plan_name ? `${dashboardData.credits.current_plan.plan_name} Plan` : "Free Plan"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Recruiter Dashboard</h1>
          <p className="text-[12px] text-slate-400 font-medium">
             Access Portal • <span className="text-indigo-600 font-semibold">{welcomeName}</span>
          </p>
        </div>
        
        <Link href="/dashboard/recruiter/post-job">
          <Button size="sm" className="h-9 px-6 rounded-lg font-semibold text-sm  shadow-lg shadow-primary/20 flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> New Opening
          </Button>
        </Link>
      </div>

      {/* High-Density Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={cn(
            "group relative overflow-hidden bg-white p-3.5 rounded-2xl border-2 border-slate-300 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5",
            stat.color === 'blue' && "hover:shadow-blue-500/10",
            stat.color === 'indigo' && "hover:shadow-indigo-500/10",
            stat.color === 'emerald' && "hover:shadow-emerald-500/10",
            stat.color === 'purple' && "hover:shadow-purple-500/10"
          )}>
            <div className={cn(
              "absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700",
              stat.color === 'blue' && "bg-blue-500/5",
              stat.color === 'indigo' && "bg-indigo-500/5",
              stat.color === 'emerald' && "bg-emerald-500/5",
              stat.color === 'purple' && "bg-purple-500/5"
            )} />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-slate-600 font-bold text-[10px] mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight leading-normal mb-1">{stat.value}</h3>
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <div className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    stat.color === 'blue' && "bg-blue-500 animate-pulse",
                    stat.color === 'indigo' && "bg-indigo-500",
                    stat.color === 'emerald' && "bg-emerald-500",
                    stat.color === 'purple' && "bg-purple-500"
                  )} />
                  <span className={cn(
                    "text-[10px] font-bold truncate max-w-[80px]",
                    stat.color === 'blue' && "text-blue-500",
                    stat.color === 'indigo' && "text-indigo-500",
                    stat.color === 'emerald' && "text-emerald-500",
                    stat.color === 'purple' && "text-purple-500"
                  )}>{stat.trend}</span>
                </div>
              </div>
              <div className={cn(
                "p-2 rounded-xl transition-all duration-500 group-hover:text-white group-hover:shadow-lg group-hover:rotate-12",
                stat.color === 'blue' && "bg-blue-50 text-blue-500 group-hover:bg-blue-600 group-hover:shadow-blue-600/20",
                stat.color === 'indigo' && "bg-indigo-50 text-indigo-500 group-hover:bg-indigo-600 group-hover:shadow-indigo-600/20",
                stat.color === 'emerald' && "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-600 group-hover:shadow-emerald-600/20",
                stat.color === 'purple' && "bg-purple-50 text-purple-500 group-hover:bg-purple-600 group-hover:shadow-purple-600/20"
              )}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
         {/* Latest Applications */}
         <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col min-h-[400px] overflow-hidden">
            <div className="px-5 py-3.5 border-b bg-gray-50/30">
               <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <h2 className="text-xs font-semibold text-emerald-600 ">Recent Applications</h2>
               </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
               {dashboardData?.recent_applications && dashboardData.recent_applications.length > 0 ? (
                  <div className="divide-y border-t border-gray-50">
                     {dashboardData.recent_applications.slice(0, 5).map((app) => (
                        <div key={app.id} className="p-4 hover:bg-gray-50/50 transition-colors flex items-center gap-4 group">
                           <div className="relative w-11 h-11 rounded-xl border border-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform flex items-center justify-center font-bold text-indigo-600 bg-indigo-50">
                              {app.job_seeker?.profile_photo ? (
                                 <Image 
                                    src={getFullImageUrl(app.job_seeker.profile_photo)!} 
                                    alt={app.job_seeker.user?.name || "User"} 
                                    fill 
                                    sizes="44px"
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
                                  "inline-flex px-2 py-0.5 rounded-lg text-[10px] font-semibold border-2 shadow-sm tracking-tight",
                                  app.status === 'shortlisted' 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-500/40" 
                                    : "bg-slate-50 text-slate-600 border-slate-300"
                               )}>
                                  {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : "Applied"}
                               </span>
                               <p className="text-[10px] text-slate-400 mt-1.5 font-bold">{new Date(app.created_at).toLocaleDateString('en-GB')}</p>
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

         {/* Right Sidebar */}
         <div className="space-y-4">
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

            {/* Latest Jobs */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
               <div className="px-5 py-3 border-b bg-gray-50/30">
                  <h2 className="text-xs font-bold text-indigo-600 ">Recent Jobs</h2>
               </div>
               <div className="divide-y max-h-[400px] overflow-y-auto custom-scrollbar">
                  {dashboardData?.recent_jobs && dashboardData.recent_jobs.length > 0 ? (
                     dashboardData.recent_jobs.map((job) => (
                        <div key={job.id} className="p-3.5 hover:bg-indigo-50/30 transition-all group">
                           <div className="flex items-start justify-between">
                              <h4 className="text-sm font-semibold text-slate-800 group-hover:text-primary transition-colors truncate pr-4 ">{job.title}</h4>
                               <span className={cn(
                                  "text-[10px] font-semibold px-2 py-0.5 rounded-lg border-2 shadow-sm tracking-tight",
                                  job.job_status === 'open' 
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-400/40" 
                                    : "bg-rose-50 text-rose-700 border-rose-400/40"
                               )}>
                                  {job.job_status ? job.job_status.charAt(0).toUpperCase() + job.job_status.slice(1) : "Status"}
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

            {/* Trending Opportunities */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
               <div className="px-5 py-3 border-b bg-gray-50/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                    <h2 className="text-xs font-bold text-amber-600 ">Trending Opportunities</h2>
                  </div>
               </div>
               <div className="divide-y max-h-[400px] overflow-y-auto custom-scrollbar">
                  {featuredJobs.length > 0 ? (
                     featuredJobs.map((job) => (
                        <div key={job.id} className="p-3.5 hover:bg-amber-50/20 transition-all group">
                           <div className="flex gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 shrink-0 overflow-hidden flex items-center justify-center p-1.5">
                                 {job.companies?.company_logo ? (
                                    <Image 
                                       src={getFullImageUrl(job.companies.company_logo)!} 
                                       alt={job.companies.company_name}
                                       width={40}
                                       height={40}
                                       className="object-contain"
                                    />
                                 ) : (
                                    <Building2 className="w-5 h-5 text-slate-300" />
                                 )}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h4 className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-amber-600 transition-colors">{job.title}</h4>
                                 <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{job.companies?.company_name}</p>
                                 <div className="flex items-center gap-2 mt-1.5">
                                    <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                                       <MapPin className="w-2.5 h-2.5" /> {job.location || "Remote"}
                                    </span>
                                    <a 
                                      href={`https://teachnow.lovable.app/jobs/${job.slug || job.id}`} 
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-auto text-primary hover:text-primary-dark transition-colors"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="p-8 text-center">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-[10px] text-slate-400 font-semibold italic">Fetching opportunities...</p>
                     </div>
                  )}
               </div>
            </div>


         </div>
      </div>

    </div>
  );
}
