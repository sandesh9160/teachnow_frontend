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
   ShieldCheck,
   Building2,
   Loader2,
   RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";

interface LatestJob {
   id: number;
   title: string;
   job_status: string;
   created_at: string;
   expires_at: string;
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

const getStatusStyles = (status: string) => {
   const s = String(status || "").toLowerCase();
   if (s === "applied") return "text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-100";
   if (s === "shortlisted" || s === "shortlist") return "text-emerald-600 border-emerald-100 bg-emerald-50 hover:bg-emerald-100";
   if (s === "interview" || s === "interviewing") return "text-amber-600 border-amber-100 bg-amber-50 hover:bg-amber-100";
   if (s === "hired") return "text-indigo-600 border-indigo-100 bg-indigo-50 hover:bg-indigo-100";
   if (s === "rejected") return "text-rose-600 border-rose-100 bg-rose-50 hover:bg-rose-100";
   return "text-slate-600 border-slate-100 bg-slate-50 hover:bg-slate-100";
};

const getJobStatusStyles = (status: string) => {
   const s = String(status || "").toLowerCase();
   if (s === "open" || s === "active") return "bg-emerald-100 text-emerald-700";
   if (s === "closed" || s === "expired") return "bg-rose-100 text-rose-700";
   if (s === "draft" || s === "pending") return "bg-amber-100 text-amber-700";
   return "bg-slate-100 text-slate-700";
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
   const [isFeatured, setIsFeatured] = useState(dashboardData?.company_featured || false);
   const [loadingFeature, setLoadingFeature] = useState(false);
   const employerId = (dashboardData as any)?.employer?.id;

   const handleToggleFeatured = async () => {
      if (!employerId) {
         toast.error("Employer ID not found");
         return;
      }
      setLoadingFeature(true);
      try {
         const res = await dashboardServerFetch(`employer/${employerId}/toggle-feature`, {
            method: "POST"
         });
         if (res.status === true) {
            setIsFeatured(!isFeatured);
            toast.success(res.message || "Featured status updated");
         } else {
            toast.error(res.message || "Failed to update featured status");
         }
      } catch (err) {
         toast.error("Error updating featured status");
      } finally {
         setLoadingFeature(false);
      }
   };

   const [loadingJobId, setLoadingJobId] = useState<number | null>(null);

   const handleJobAction = async (id: number, action: string) => {
      setLoadingJobId(id);
      try {
         const endpoint = action === 'republish' ? `employer/jobs/${id}/republish` : `employer/jobs/${id}/filled`;
         const res = await dashboardServerFetch(endpoint, { method: "PUT" });
         if (res.status === true) {
            toast.success(res.message || `Job ${action} success`);
            window.location.reload();
         } else {
            toast.error(res.message || "Action failed");
         }
      } catch (err) {
         toast.error("Error processing request");
      } finally {
         setLoadingJobId(null);
      }
   };

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
                  {(dashboardData as any)?.employer?.is_verified === 1 && (
                     <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-medium">
                        <Check className="w-2.5 h-2.5" /> Verified
                     </div>
                  )}
               </div>
               <p className="text-xs text-[#1E1B4B]">Welcome back, {(dashboardData as any)?.employer?.company_name || dashboardData?.employer_profile?.company_name || welcomeName}</p>
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

               {/* <Link href="/pricing-plans" className="relative z-10 lg:pl-4">
                  <Button variant="outline" className="h-9 px-6 rounded-xl border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold shadow-sm transition-all active:scale-95 whitespace-nowrap">
                     Upgrade plan
                  </Button>
               </Link> */}
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

         {/* Quick Management Hub - Sentenced-case & Color-enriched */}
         <div className="space-y-3">
            <h2 className="text-[14px] font-semibold text-slate-500 tracking-tight ml-1">Workspace Focus</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
               {[
                  { label: "Manage Jobs", icon: Briefcase, href: `${basePath}/jobs`, color: "bg-blue-600 text-white", border: "border-blue-100", bg: "bg-blue-50/30" },
                  { label: "Hiring Team", icon: ShieldCheck, href: `${basePath}/recruiters`, color: "bg-indigo-600 text-white", border: "border-indigo-100", bg: "bg-indigo-50/30" },
                  { label: "Institution Profile", icon: Building2, href: `${basePath}/company-profile`, color: "bg-amber-600 text-white", border: "border-amber-100", bg: "bg-amber-50/30" },
               ].map((item, idx) => (
                  <Link key={idx} href={item.href} className="group">
                     <div className={cn(
                        "h-16 rounded-xl border bg-white p-3 flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-95",
                        item.border, item.bg
                     )}>
                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center transition-all group-hover:scale-110 shadow-sm", item.color)}>
                           <item.icon className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-[13px] font-semibold text-slate-800 tracking-tight">{item.label}</span>
                     </div>
                  </Link>
               ))}
            </div>
         </div>

         {/* Promotion Hub - Full Width Sophisticated Design */}
         <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col group p-6">
            <div className="flex items-center justify-between mb-5">
               <div className="space-y-1">
                  <div className="flex items-center gap-2">
                     <h2 className="text-[14px] font-semibold text-slate-500 tracking-tight">Promotion Hub</h2>
                     {isFeatured && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold animate-in zoom-in duration-500">Live Status</span>
                     )}
                  </div>
                  <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                     Feature your institution on the homepage to reach a wider audience of top-tier education professionals.
                  </p>
               </div>
               <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner shrink-0",
                  isFeatured ? "bg-indigo-600 text-white shadow-indigo-100 scale-105" : "bg-slate-50 text-slate-300"
               )}>
                  <Zap className={cn("w-5 h-5", isFeatured && "animate-pulse")} />
               </div>
            </div>

            <div className={cn(
               "p-4 rounded-xl border transition-all duration-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4",
               isFeatured ? "bg-indigo-50/30 border-indigo-100" : "bg-slate-50/50 border-slate-100"
            )}>
               <div className="flex items-center gap-3.5">
                  <div className={cn(
                     "w-6 h-6 rounded-lg flex items-center justify-center border transition-all duration-300",
                     isFeatured ? "bg-indigo-600 border-indigo-500 text-white shadow-sm" : "bg-white border-slate-100 text-slate-200"
                  )}>
                     {isFeatured ? <Check className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />}
                  </div>
                  <div className="space-y-0.5">
                     <span className="text-[13px] font-bold text-slate-900 block leading-none">Home Page Visibility</span>
                     {dashboardData?.company_featured_until && isFeatured ? (
                        <p className="text-[11px] text-indigo-600 font-semibold">Active until {new Date(dashboardData.company_featured_until).toLocaleDateString('en-GB')}</p>
                     ) : (
                        <p className="text-[11px] text-slate-400 font-medium tracking-tight">Status: Standard Placement</p>
                     )}
                  </div>
               </div>

               <Button 
                  onClick={handleToggleFeatured}
                  disabled={loadingFeature}
                  className={cn(
                     "h-9 px-6 rounded-xl text-[11px] font-bold transition-all active:scale-95 shadow-sm",
                     isFeatured 
                        ? "bg-slate-800 text-white hover:bg-slate-900" 
                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
                  )}
               >
                  {loadingFeature ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isFeatured ? "Stop Featuring" : "Go Featured Now"}
               </Button>
            </div>
         </div>

         {/* Tables Grid: Recent Data */}
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
                                 initials={app.job_seeker.user.name.split(' ').map(n => n[0]).join('')}
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
                              <Button variant="outline" size="sm" className={cn("h-7 px-3 rounded-md border text-[10px] font-semibold capitalize", getStatusStyles(app.status))}>
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
                                    (job.job_status === 'expired' || new Date(job.expires_at) < new Date()) ? "bg-amber-100 text-amber-700" : getJobStatusStyles(job.job_status)
                                 )}>
                                    {(job.job_status === 'expired' || new Date(job.expires_at) < new Date()) ? "Expired" : job.job_status}
                                 </span>
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-[#1E1B4B]">
                                 <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {new Date(job.created_at).toLocaleDateString('en-GB')}</span>
                              </div>
                           </div>

                              <div className="flex items-center gap-2">
                                 {(job.job_status === 'expired' || new Date(job.expires_at) < new Date()) && (
                                    <Button 
                                       onClick={() => handleJobAction(job.id, 'republish')}
                                       disabled={loadingJobId === job.id}
                                       size="sm" 
                                       className="h-7 px-3 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-[10px] shrink-0 flex items-center gap-1.5"
                                    >
                                       {loadingJobId === job.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                       Republish
                                    </Button>
                                 )}
                                 {!(job.job_status === 'expired' || new Date(job.expires_at) < new Date()) && (
                                    <Link href={`${basePath}/jobs/view/${job.id}/applicants`}>
                                       <Button size="sm" className="h-7 px-3 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 font-semibold text-[10px] shrink-0 flex items-center gap-1.5">
                                          <Users className="w-3.5 h-3.5" />
                                          Applicants
                                          {job.total_applications_count !== undefined && (
                                             <span className="ml-0.5 bg-indigo-600 text-white px-1 rounded-md text-[9px] font-bold">
                                                {job.total_applications_count || 0}
                                             </span>
                                          )}
                                       </Button>
                                    </Link>
                                 )}
                                 <Link href={`${basePath}/jobs/view/${job.id}`}>
                                    <Button size="sm" className="h-7 px-3 rounded-md bg-white border border-slate-200 text-[#1E1B4B] hover:bg-slate-50 font-semibold text-[10px] shrink-0">
                                       View
                                    </Button>
                                 </Link>
                              </div>
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
