"use client";

import {
   Users,
   Briefcase,
   PlusCircle,
   CheckCircle2,
   Clock,
   Zap,
   CreditCard,
   Check,

} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface LatestJob {
   id: number;
   title: string;
   job_status: string;
   created_at: string;
   total_applications_count?: number;
   location?: string;
}

interface LatestApplication {
   id: number;
   status: string;
   created_at: string;
   job: {
      title: string;
   };
   job_seeker: {
      id: number;
      title: string;
      profile_photo: string | null;
      user: {
         name: string;
      };
      experience_years?: number;
   };
}

interface DashboardStats {
   total_jobs?: number;
   total_applications?: number;
   shortlisted_candidates?: number;
   total_recruiters?: number;
   total_remaining_credits?: string | number;
   active_featured_jobs?: number;
   subscription?: {
      plan_name: string;
      total_credits: number;
      used_credits: number;
      remaining_credits: number;
      expires_at: string;
      featured_jobs_total: number;
      featured_jobs_used: number;
      remaining_featured_jobs: number;
   };
   subscription_expiring_soon?: boolean;
   company_verification?: number;
   company_featured?: boolean;
   company_featured_until?: string;
   latest_jobs?: LatestJob[];
   latest_applications?: LatestApplication[];
   employer_profile?: {
      is_profile_verified?: number;
      company_name?: string;
   };
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
      <div className="w-full h-full flex items-center justify-center bg-[#E0E7FF] text-[#4338CA] font-medium text-xs">
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

export default function EmployerDashboardClient({
   welcomeName,
   dashboardData,
   userRole = "employer"
}: {
   welcomeName: string,
   dashboardData?: DashboardStats,
   userRole?: string
}) {
   const basePath = `/dashboard/${userRole}`;
   const sub = dashboardData?.subscription;

   const stats = [
      {
         label: "Total jobs",
         value: dashboardData?.total_jobs?.toString() || "0",
         subtext: "Active listings",
         icon: Briefcase,
         gradient: "from-[#4F46E5] to-[#3730A3]", // Indigo
         textColor: "text-white"
      },
      {
         label: "Total applicants",
         value: dashboardData?.total_applications?.toString() || "0",
         subtext: "Career seekers",
         icon: Users,
         gradient: "from-[#3B82F6] to-[#1E40AF]", // Blue
         textColor: "text-white"
      },
      {
         label: "Shortlisted",
         value: dashboardData?.shortlisted_candidates?.toString() || "0",
         subtext: "Top talent",
         icon: CheckCircle2,
         gradient: "from-[#10B981] to-[#047857]", // Green
         textColor: "text-white"
      },
      {
         label: "Remaining credits",
         value: dashboardData?.total_remaining_credits?.toString() || "0",
         subtext: "Account balance",
         icon: Zap,
         gradient: "from-[#F97316] to-[#C2410C]", // Orange
         textColor: "text-white"
      },
   ];

   return (
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-6 font-sans text-slate-800 pb-12">
         {/* Page Header */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
               <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-semibold text-black tracking-tight">Employer Dashboard</h1>
                  {dashboardData?.company_verification === 1 && (
                     <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-medium">
                        <Check className="w-2.5 h-2.5" /> Verified
                     </div>
                  )}
               </div>
               <p className="text-xs text-[#1E1B4B]">Welcome back, {dashboardData?.employer_profile?.company_name || welcomeName}</p>
            </div>

            <Link href={`${basePath}/post-job`}>
               <Button className="h-10 px-6 rounded-lg font-semibold text-xs bg-[#2563EB] hover:bg-[#1D4ED8] transition-all shadow-md shadow-blue-50 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Post a Job
               </Button>
            </Link>
         </div>

         {/* Subscription & Credits Intelligence Card */}
         {sub && (
            <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6 group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 rounded-full -mr-24 -mt-24 pointer-events-none transition-transform group-hover:scale-110 duration-1000" />
               <div className="relative z-10 flex gap-4 md:items-center shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-inner group-hover:rotate-6 transition-transform">
                     <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-semibold text-slate-400 capitalize mb-0.5">Current membership</p>
                     <h2 className="text-xl font-semibold text-black tracking-tight">{sub.plan_name}</h2>
                     <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-amber-500" /> Renewal: {new Date(sub.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                     </p>
                  </div>
               </div>

               <div className="relative z-10 flex flex-1 flex-wrap items-center justify-center sm:justify-start gap-8 lg:gap-14 lg:border-l lg:border-slate-100 lg:pl-10">
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] font-semibold text-slate-400 capitalize whitespace-nowrap">Total credits</span>
                     <p className="text-xl font-semibold text-black">{sub.total_credits}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] font-semibold text-slate-400 capitalize whitespace-nowrap">Utilized units</span>
                     <p className="text-xl font-semibold text-rose-500">{sub.used_credits}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] font-semibold text-slate-400 capitalize whitespace-nowrap">Balance remaining</span>
                     <div className="flex items-center gap-2">
                        <p className="text-xl font-semibold text-emerald-600">{sub.remaining_credits}</p>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     </div>
                  </div>
               </div>
               
               <Link href={`${basePath}/purchase-history`} className="relative z-10 lg:pl-4">
                  <Button variant="outline" className="h-9 px-6 rounded-xl border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold shadow-sm transition-all active:scale-95 whitespace-nowrap">
                     Update Management
                  </Button>
               </Link>
            </div>
         )}

         {/* Stats Grid - Live Data Only */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((stat, i) => (
               <div key={i} className={cn(
                  "relative h-28 rounded-[16px] p-4 flex flex-col justify-between overflow-hidden shadow-sm",
                  "bg-gradient-to-br", stat.gradient, stat.textColor
               )}>
                  <div className="absolute top-3 right-3 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                     <stat.icon className="w-6 h-6 opacity-80" />
                  </div>
                  
                  <div className="relative z-10 space-y-0.5">
                     <p className="text-[11px] font-medium opacity-90">{stat.label}</p>
                     <h3 className="text-3xl font-semibold tracking-tight">{stat.value}</h3>
                  </div>
                  
                  <div className="relative z-10">
                     <p className="text-[10px] opacity-70 italic">{stat.subtext}</p>
                  </div>
               </div>
            ))}
         </div>

         {/* Main Content Grid: Live Lists Only */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent Applicants Column */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col group">
               <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <h2 className="text-[14px] font-semibold text-black">Recent candidates</h2>
               </div>

               <div className="divide-y divide-slate-50">
                  {dashboardData?.latest_applications && dashboardData.latest_applications.length > 0 ? (
                     dashboardData.latest_applications.slice(0, 5).map((app) => (
                        <div key={app.id} className="px-5 py-3 flex items-center gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                           <div className="relative w-10 h-10 rounded-lg border border-slate-100 bg-[#E0E7FF] overflow-hidden shrink-0">
                              <ApplicationAvatar 
                                 src={app.job_seeker.profile_photo} 
                                 alt={app.job_seeker.user.name} 
                                 initials={app.job_seeker.user.name.split(' ').map(n=>n[0]).join('')}
                              />
                           </div>
                           
                           <div className="flex-1 min-w-0">
                              <h4 className="text-[14px] font-semibold text-[#1E1B4B] group-hover:text-primary transition-colors truncate">
                                 {app.job_seeker.user.name}
                              </h4>
                              <p className="text-[11px] text-[#1E1B4B]">
                                 Applied for {app.job.title}
                              </p>
                           </div>

                           <div className="flex items-center gap-3 shrink-0">
                              <span className="text-[10px] text-black opacity-40 hidden sm:block">
                                 {new Date(app.created_at).toLocaleDateString('en-GB')}
                              </span>
                              <Button variant="outline" size="sm" className="h-7 px-3 rounded-md bg-white text-[#10B981] border-[#D1FAE5] hover:bg-[#ECFDF5] text-[10px] font-semibold capitalize">
                                 {app.status}
                              </Button>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="py-12 flex flex-col items-center justify-center text-center opacity-30">
                        <Users className="w-10 h-10 mb-2" />
                        <p className="text-xs font-semibold">No recent applicants</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Recent Job Posts Column */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col group">
               <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <h2 className="text-[14px] font-semibold text-black">Active vacancies</h2>
               </div>

               <div className="divide-y divide-slate-50">
                  {dashboardData?.latest_jobs && dashboardData.latest_jobs.length > 0 ? (
                     dashboardData.latest_jobs.slice(0, 5).map((job) => (
                        <div key={job.id} className="px-5 py-3 flex items-center gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                 <h4 className="text-[14px] font-semibold text-[#1E1B4B] group-hover:text-primary transition-colors truncate">
                                    {job.title}
                                 </h4>
                                 <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[9px] font-semibold shrink-0 capitalize",
                                    job.job_status === 'open' ? "bg-[#D1FAE5] text-[#059669]" : "bg-slate-100 text-slate-600"
                                 )}>
                                    {job.job_status}
                                 </span>
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-[#1E1B4B]">
                                 <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {new Date(job.created_at).toLocaleDateString('en-GB')}</span>
                              </div>
                           </div>

                           <Button size="sm" className="h-7 px-3 rounded-md bg-white border border-slate-200 text-[#1E1B4B] hover:bg-slate-50 font-semibold text-[10px] shrink-0">
                              Applicants
                           </Button>
                        </div>
                     ))
                  ) : (
                     <div className="py-12 flex flex-col items-center justify-center text-center opacity-30">
                        <Briefcase className="w-10 h-10 mb-2" />
                        <p className="text-xs font-semibold">No recent posts</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
