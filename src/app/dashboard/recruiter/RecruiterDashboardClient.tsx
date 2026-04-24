"use client";

import { useState } from "react";
import {
   Users,
   Briefcase,
   PlusCircle,
   Clock,
   CreditCard,
   Check,
   // Zap,
   // CheckCircle2,
   ChevronRight,
   TrendingUp
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface RecruiterDashboardStats {
   active_jobs: number;
   jobs_filled: number;
   total_applicants: number;
   shortlisted_count?: number;
   credits: {
      jobs_total: number;
      jobs_used: number;
      jobs_remaining: number;
      feature_total: number;
      feature_used: number;
      feature_jobs_remaining: number;
      active_featured_jobs?: number;
      your_usage?: {
         jobs_used: number;
         featured_jobs_used: number;
      };
      current_plan?: {
         plan_name: string;
         expires_at: string;
      } | null;
   };
   recent_jobs: any[];
   recent_applications: any[];
}

const ApplicationAvatar = ({ src, alt, initials }: { src: string | null, alt: string, initials?: string }) => {
   const [error, setError] = useState(false);

   const getFullImageUrl = (path: string | null) => {
      if (!path) return null;
      if (path.startsWith('http')) return path;
      const baseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";
      return `${baseUrl}/${path.startsWith('/') ? path.slice(1) : path}`;
   };

   const fullUrl = getFullImageUrl(src);

   if (!fullUrl || error) {
      return (
         <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-700 text-xs font-black">
            {initials || alt[0]}
         </div>
      );
   }

   return (
      <Image
         src={fullUrl}
         alt={alt}
         fill
         sizes="(max-width: 768px) 32px, 48px"
         className="object-cover"
         onError={() => setError(true)}
      />
   );
};

export default function RecruiterDashboardClient({
   welcomeName,
   dashboardData
}: {
   welcomeName: string,
   dashboardData?: RecruiterDashboardStats
}) {
   const sub = dashboardData?.credits?.current_plan;
   const credits = dashboardData?.credits;
   const basePath = "/dashboard/recruiter";

   // Pre-calculate values for clean UI
   const jobTotal = credits?.jobs_total ?? 0;
   const jobRemaining = credits?.jobs_remaining ?? 0;
   const featTotal = credits?.feature_total ?? 0;
   const featRemaining = credits?.feature_jobs_remaining ?? 0;
   const yourJobs = credits?.your_usage?.jobs_used ?? 0;
   const yourFeat = credits?.your_usage?.featured_jobs_used ?? 0;

   const stats = [
      {
         label: "Active jobs",
         value: dashboardData?.active_jobs?.toString() || "0",
         icon: Briefcase,
         gradient: "from-[#4F46E5] to-[#3730A3]", // Indigo
         textColor: "text-white"
      },
      {
         label: "Total applicants",
         value: dashboardData?.total_applicants?.toString() || "0",
         icon: Users,
         gradient: "from-[#3B82F6] to-[#1E40AF]", // Blue
         textColor: "text-white"
      },
      {
         label: "Jobs Filled",
         value: dashboardData?.jobs_filled?.toString() || "0",
         icon: TrendingUp,
         gradient: "from-[#F97316] to-[#C2410C]", // Orange
         textColor: "text-white"
      },
   ];

   return (
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-6 font-sans text-black pb-12">
         
         {/* Page Header - Clean & Balanced */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
               <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-medium text-black tracking-tight">Recruiter Dashboard</h1>
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-medium border border-emerald-100">
                     <Check className="w-2.5 h-2.5" /> Verified
                  </div>
               </div>
               <p className="text-xs text-black/60">Welcome back, <span className="font-medium">{welcomeName}</span></p>
            </div>

            <Link href={`${basePath}/post-job`}>
               <Button className="h-10 px-6 rounded-lg font-medium text-xs bg-[#2563EB] hover:bg-[#1D4ED8] transition-all shadow-md shadow-blue-50 flex items-center gap-2 text-white">
                  <PlusCircle className="w-4 h-4" /> Post a Job
               </Button>
            </Link>
         </div>

         {/* Subscription & Credit Summary - Balanced Density */}
         {credits && (
            <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-8 group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 rounded-full -mr-24 -mt-24 pointer-events-none transition-transform group-hover:scale-110 duration-1000" />
               
               <div className="relative z-10 flex gap-4 md:items-center shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-inner group-hover:rotate-6 transition-transform">
                     <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-medium text-black/40 capitalize mb-0.5">Current membership</p>
                     <h2 className="text-xl font-medium text-black tracking-tight">{sub?.plan_name || "Silver Plan"}</h2>
                     <p className="text-[11px] font-medium text-black/40 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-2.5 h-2.5 text-amber-500" /> Renewal: {sub?.expires_at ? new Date(sub.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "---"}
                     </p>
                  </div>
               </div>

               <div className="relative z-10 flex flex-1 flex-col md:flex-row items-stretch justify-center sm:justify-start gap-4 lg:gap-8 lg:border-l lg:border-slate-100 lg:pl-10">
                  {/* Allocation Info Box */}
                  <div className="flex-1 bg-slate-50/30 border border-slate-200 rounded-2xl p-4 transition-all hover:bg-slate-50 group/active">
                     <div className="flex items-center gap-2 mb-2.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Total Credits</span>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-medium text-slate-500 capitalize">Job posts</span>
                           <p className="text-xl font-medium text-black">{jobTotal}</p>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-medium text-slate-500 capitalize">Featured</span>
                           <p className="text-xl font-medium text-black">{featTotal}</p>
                        </div>
                     </div>
                  </div>

                  {/* Remaining Balance Box */}
                  <div className="flex-1 bg-emerald-50/10 border border-emerald-200/60 rounded-2xl p-4 transition-all hover:bg-emerald-50/20 group/remaining">
                     <div className="flex items-center gap-2 mb-2.5">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap">Remaining Credits</span>
                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-medium text-emerald-700/70 capitalize">Job posts</span>
                           <p className="text-xl font-medium text-emerald-600">{jobRemaining}</p>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-medium text-emerald-700/70 capitalize">Featured</span>
                           <p className="text-xl font-medium text-emerald-600">{featRemaining}</p>
                        </div>
                     </div>
                  </div>

                  {/* Recruiter's Personal Usage Box */}
                  <div className="flex-1 bg-amber-50/10 border border-amber-200/60 rounded-2xl p-4 transition-all hover:bg-amber-50/20 group/usage">
                     <div className="flex items-center gap-2 mb-2.5">
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider whitespace-nowrap">Your Usage</span>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-medium text-amber-700/70 capitalize">Jobs used</span>
                           <p className="text-xl font-medium text-black">{yourJobs}</p>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-medium text-amber-700/70 capitalize">Featured</span>
                           <p className="text-xl font-medium text-black">{yourFeat}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Stats Grid - Gradient Cards */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
               <div key={i} className={cn(
                  "relative h-30 rounded-[24px] p-6 flex flex-col justify-between overflow-hidden shadow-sm text-white bg-gradient-to-br",
                  stat.gradient
               )}>
                  <div className="absolute top-3 right-3 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner">
                     <stat.icon className="w-7 h-7 opacity-80" />
                  </div>
                  
                  <div className="relative z-10 space-y-0.5">
                     <p className="text-[16px] font-medium opacity-80">{stat.label}</p>
                     <h3 className="text-4xl font-semibold">{stat.value}</h3>
                  </div>
               </div>
            ))}
         </div>

         {/* Main Workspace Areas */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recent Applicants */}
            <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm flex flex-col">
               <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                  <h2 className="text-[15px] font-medium text-black">Recent candidates</h2>
                  <Link href={`${basePath}/applicants`} className="text-[11px] font-medium text-indigo-600 hover:underline flex items-center gap-1">
                     View All <ChevronRight className="w-3 h-3" />
                  </Link>
               </div>

               <div className="divide-y divide-slate-50">
                  {dashboardData?.recent_applications && dashboardData.recent_applications.length > 0 ? (
                     dashboardData.recent_applications.slice(0, 5).map((app) => (
                        <div key={app.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors group/item">
                           <div className="relative w-10 h-10 rounded-lg border border-slate-100 bg-[#E0E7FF] overflow-hidden shrink-0">
                              <ApplicationAvatar
                                 src={app.job_seeker?.profile_photo}
                                 alt={app.job_seeker?.user?.name || "User"}
                                 initials={app.job_seeker?.user?.name?.split(' ').map((n: any) => n[0]).join('')}
                              />
                           </div>

                           <div className="flex-1 min-w-0">
                              <h4 className="text-[14px] font-medium text-black group-hover/item:text-indigo-600 transition-colors truncate">
                                 {app.job_seeker?.user?.name || "Applicant"}
                              </h4>
                              <p className="text-[11px] font-medium text-black/40 truncate">
                                 {app.job?.title}
                              </p>
                           </div>

                           <div className="flex items-center gap-4 shrink-0">
                              <span className="text-[10px] text-black/30 hidden sm:block">
                                 {new Date(app.created_at).toLocaleDateString('en-GB')}
                              </span>
                              <span className={cn(
                                 "px-2.5 py-0.5 rounded-lg text-[10px] font-medium border capitalize",
                                 app.status === 'applied' ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" :
                                 app.status === 'shortlisted' ? "bg-indigo-50 text-indigo-600 border-indigo-100/50" :
                                 "bg-slate-50 text-black/40 border-slate-100"
                              )}>
                                 {app.status}
                              </span>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="py-16 flex flex-col items-center justify-center text-center opacity-20">
                        <Users className="w-10 h-10 mb-2" />
                        <p className="text-xs font-medium">No recent candidates</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Active Vacancies */}
            <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm flex flex-col">
               <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                  <h2 className="text-[15px] font-medium text-black">Active vacancies</h2>
                  <Link href={`${basePath}/jobs`} className="text-[11px] font-medium text-indigo-600 hover:underline flex items-center gap-1">
                     Manage Jobs <ChevronRight className="w-3 h-3" />
                  </Link>
               </div>

               <div className="divide-y divide-slate-50">
                  {dashboardData?.recent_jobs && dashboardData.recent_jobs.length > 0 ? (
                     dashboardData.recent_jobs.slice(0, 5).map((job) => (
                        <div key={job.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors group/item">
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                 <h4 className="text-[14px] font-medium text-black group-hover/item:text-indigo-600 transition-colors truncate">
                                    {job.title}
                                 </h4>
                                 <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[9px] font-medium border shrink-0 capitalize",
                                    job.job_status === 'open' ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" : "bg-slate-50 text-black/40 border-slate-100"
                                 )}>
                                    {job.job_status}
                                 </span>
                              </div>
                              <div className="flex items-center gap-3 text-[10px] font-medium text-black/40">
                                 <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {new Date(job.created_at).toLocaleDateString('en-GB')}
                                 </div>
                                 <div className="flex items-center gap-1 text-indigo-600/60">
                                    <Users className="w-3 h-3" /> {job.job_applications_count || 0}
                                 </div>
                              </div>
                           </div>

                           <Link href={`${basePath}/jobs/view/${job.id}`}>
                              <Button size="sm" className="h-8 px-4 rounded-xl bg-white border border-slate-200 text-black hover:bg-slate-50 font-medium text-[10px] shrink-0 shadow-sm transition-all active:scale-95">
                                 Applicants
                              </Button>
                           </Link>
                        </div>
                     ))
                  ) : (
                     <div className="py-16 flex flex-col items-center justify-center text-center opacity-20">
                        <Briefcase className="w-10 h-10 mb-2" />
                        <p className="text-xs font-medium">No active vacancies</p>
                     </div>
                  )}
               </div>
            </div>

         </div>
      </div>
   );
}
