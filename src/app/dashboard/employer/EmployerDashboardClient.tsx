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
   Loader2,
   RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { useState } from "react";
import Image from "next/image";
// import { format } from "date-fns";

interface LatestJob {
   id: number;
   title: string;
   job_status: string;
   created_at: string;
   expires_at: string;
   total_applications_count?: number;
   location?: string;
   company_logo?: string | null;
   employer_logo?: string | null;
   logo?: string | null;
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

interface ActiveSubscription {
   plan_name: string;
   job_credits_total: number;
   job_credits_used: number;
   job_credits_remaining: number;
   feature_credits_total: number;
   feature_credits_used: number;
   feature_credits_remaining: number;
   expires_at: string;
}

interface CreditsSummary {
   job_credits: {
      total: number;
      used: number;
      remaining: number;
   };
   feature_credits: {
      total: number;
      used: number;
      remaining: number;
   };
   active_subscriptions_count: number;
}

interface RecruiterInfo {
   id: number;
   name: string;
   email: string;
   jobs_used: number;
   featured_jobs_used: number;
}

interface SubscriptionHistoryItem {
   id: number;
   plan_name: string;
   purchase_date: string;
   starts_at: string;
   expires_at: string;
   status: string;
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
   active_subscription?: ActiveSubscription;
   credits_summary?: CreditsSummary;
   recruiters?: {
      data: RecruiterInfo[];
      total: number;
   };
   subscription_history?: SubscriptionHistoryItem[];
   subscription_expiring_soon?: boolean;
   company_verification?: number;
   is_featured?: number;
   company_featured?: boolean;
   company_featured_until?: string;
   featured_until?: string;
   employer?: {
      id: number;
      company_name?: string;
      company_logo?: string;
      featured_until?: string;
      is_featured?: number;
      is_verified?: number;
      is_profile_verified?: number;
   };
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
   const [isFeatured, setIsFeatured] = useState(
      dashboardData?.company_featured === true ||
      dashboardData?.is_featured === 1 ||
      dashboardData?.employer?.is_featured === 1 ||
      false
   );
   const [loadingFeature, setLoadingFeature] = useState(false);
   const employerId = dashboardData?.employer?.id;

   const handleToggleFeatured = async () => {
      if (!employerId) {
         toast.error("Employer ID not found");
         return;
      }
      setLoadingFeature(true);
      try {
         const res = await dashboardServerFetch<{ status: boolean, message?: string }>(`employer/${employerId}/toggle-feature`, {
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

   // Support both old and new backend structure for compatibility
   const sub = dashboardData?.active_subscription || dashboardData?.subscription;
   const credits = dashboardData?.credits_summary;

   // Pre-calculate credits for clean UI logic
   const jobTotal = credits?.job_credits?.total ?? (sub && 'job_credits_total' in sub ? (sub as any).job_credits_total : (sub && 'total_credits' in sub ? (sub as any).total_credits : 0));
   const jobRemaining = credits?.job_credits?.remaining ?? (sub && 'job_credits_remaining' in sub ? (sub as any).job_credits_remaining : (sub && 'remaining_credits' in sub ? (sub as any).remaining_credits : 0));
   const featTotal = credits?.feature_credits?.total ?? (sub && 'feature_credits_total' in sub ? (sub as any).feature_credits_total : (sub && 'featured_jobs_total' in sub ? (sub as any).featured_jobs_total : 0));
   const featRemaining = credits?.feature_credits?.remaining ?? (sub && 'feature_credits_remaining' in sub ? (sub as any).feature_credits_remaining : (sub && 'remaining_featured_jobs' in sub ? (sub as any).remaining_featured_jobs : 0));

   const stats = [
      {
         label: "Total jobs",
         value: dashboardData?.total_jobs?.toString() || "0",
         icon: Briefcase,
         gradient: "from-[#4F46E5] to-[#3730A3]", // Indigo
         textColor: "text-white"
      },
      {
         label: "Total applicants",
         value: dashboardData?.total_applications?.toString() || "0",
         icon: Users,
         gradient: "from-[#3B82F6] to-[#1E40AF]", // Blue
         textColor: "text-white"
      },
      {
         label: "Shortlisted",
         value: dashboardData?.shortlisted_candidates?.toString() || "0",
         icon: CheckCircle2,
         gradient: "from-[#10B981] to-[#047857]", // Green
         textColor: "text-white"
      },
      {
         label: "Team members",
         value: dashboardData?.total_recruiters?.toString() || "0",
         icon: Users,
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
                  <h1 className="text-xl sm:text-2xl font-semibold text-black tracking-tight">Institute Dashboard</h1>
                  {(dashboardData?.employer?.is_verified === 1 || dashboardData?.employer_profile?.is_profile_verified === 1) && (
                     <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium border border-emerald-100">
                        <Check className="w-3.5 h-3.5" /> Verified
                     </div>
                  )}
               </div>
               <p className="text-sm font-medium text-slate-700 mt-1">Welcome back, {dashboardData?.employer?.company_name || dashboardData?.employer_profile?.company_name || welcomeName}</p>
            </div>

            <Link href={`${basePath}/post-job`}>
               <Button className="h-10 px-6 rounded-lg font-semibold text-xs bg-[#2563EB] hover:bg-[#1D4ED8] transition-all shadow-md shadow-blue-50 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Post a Job
               </Button>
            </Link>
         </div>

         {/* Subscription & Credits Intelligence Card */}
         {sub && (
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6 group max-w-6xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 pointer-events-none transition-transform group-hover:scale-110 duration-1000" />

               <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 flex-1">
                  {/* Left: Plan Info */}
                  <div className="flex gap-3 items-center shrink-0">
                     <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-inner group-hover:rotate-6 transition-transform shrink-0">
                        <CreditCard className="w-5 h-5" />
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-wider">Current Plan</span>
                           <h2 className="text-lg font-bold text-black leading-none">{sub.plan_name}</h2>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 mt-1">
                           <Clock className="w-3 h-3 text-amber-500" /> Renewal: {new Date(sub.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                     </div>
                  </div>

                  <div className="h-10 w-px bg-slate-100 hidden lg:block" />

                  {/* Middle: Credits Grid (Allocation & Balance) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 lg:max-w-2xl">
                     {/* Active Allocation Box */}
                     <div className="bg-slate-50/50 border border-slate-100/50 rounded-xl p-3 transition-all hover:bg-slate-50 group/active">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Allocation</span>
                           <div className="flex items-center gap-1 px-1 py-0.5 bg-emerald-50 rounded-full border border-emerald-100/50">
                              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[7px] font-bold text-emerald-600 uppercase">Live</span>
                           </div>
                        </div>
                        <div className="flex justify-between items-end">
                           <div>
                              <span className="text-[10px] font-medium text-slate-500 block">Job posts</span>
                              <p className="text-lg font-bold text-slate-900 leading-none">{jobTotal}</p>
                           </div>
                           <div className="text-right">
                              <span className="text-[10px] font-medium text-slate-500 block">Featured</span>
                              <p className="text-lg font-bold text-slate-900 leading-none">{featTotal}</p>
                           </div>
                        </div>
                     </div>

                     {/* Remaining Balance Box */}
                     <div className="bg-indigo-50/30 border border-indigo-100/30 rounded-xl p-3 transition-all hover:bg-indigo-50/50 group/remaining">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">Remaining Balance</span>
                           <span className="text-[7px] font-bold text-indigo-600 uppercase bg-indigo-100/50 px-1 py-0.5 rounded">Available</span>
                        </div>
                        <div className="flex justify-between items-end">
                           <div>
                              <span className="text-[10px] font-medium text-indigo-400 block">Job posts</span>
                              <p className="text-lg font-bold text-indigo-600 leading-none">{jobRemaining}</p>
                           </div>
                           <div className="text-right">
                              <span className="text-[10px] font-medium text-indigo-400 block">Featured</span>
                              <p className="text-lg font-bold text-indigo-600 leading-none">{featRemaining}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right: Upgrade Plan Button */}
               <Link href="/dashboard/employer/purchase-history" className="relative z-10 shrink-0 self-end lg:self-center">
                  <Button variant="outline" className="h-9 px-6 rounded-xl border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50 text-indigo-700 text-xs font-bold shadow-sm transition-all active:scale-95 whitespace-nowrap">
                     Upgrade Plan
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

               </div>
            ))}
         </div>

         {/* Promotion Hub - Full Width Sophisticated Design with Toggle */}
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
                     {(() => {
                        const date = dashboardData?.company_featured_until || dashboardData?.featured_until || dashboardData?.employer?.featured_until;
                        if (!date) return <p className="text-[11px] text-slate-400 font-medium tracking-tight">Status: Standard Placement</p>;

                        const isExpired = new Date(date) < new Date();
                        const formattedDate = new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

                        if (isFeatured && !isExpired) {
                           return <p className="text-[11px] text-indigo-600 font-bold flex items-center gap-1"><Zap className="w-2.5 h-2.5" /> Active until {formattedDate}</p>;
                        }
                        return <p className="text-[11px] text-slate-400 font-medium tracking-tight">Featured status ended on {formattedDate}</p>;
                     })()}
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  <span className={cn("text-[11px] font-bold uppercase tracking-wider transition-colors", isFeatured ? "text-indigo-600" : "text-slate-400")}>
                     {isFeatured ? "Featured" : "Standard"}
                  </span>
                  <button
                     onClick={handleToggleFeatured}
                     disabled={loadingFeature}
                     className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none shadow-inner",
                        isFeatured ? "bg-indigo-600" : "bg-slate-200",
                        loadingFeature && "opacity-50 cursor-not-allowed"
                     )}
                  >
                     <span
                        className={cn(
                           "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm",
                           isFeatured ? "translate-x-6" : "translate-x-1"
                        )}
                     />
                     {loadingFeature && (
                        <div className="absolute inset-0 flex items-center justify-center">
                           <Loader2 className="w-3 h-3 animate-spin text-white/40" />
                        </div>
                     )}
                  </button>
               </div>
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
                     dashboardData.latest_applications.slice(0, 5).map((app, idx) => (
                        <div key={`${app.id}-${idx}`} className="px-4 py-3 flex flex-wrap items-center gap-3 hover:bg-slate-50/50 transition-colors cursor-pointer group">
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
                              <Button variant="outline" size="sm" className={cn("h-6 px-2.5 rounded-md border text-[10px] font-medium capitalize", getStatusStyles(app.status))}>
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
                     dashboardData.latest_jobs.slice(0, 5).map((job, idx) => (
                        <div key={`${job.id}-${idx}`} className="px-4 py-3 flex gap-3 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                           <div className="relative w-10 h-10 rounded-lg border border-slate-100 bg-slate-50 overflow-hidden shrink-0">
                              <ApplicationAvatar
                                 src={job.company_logo || job.employer_logo || job.logo || null}
                                 alt={job.title}
                                 initials={job.title?.charAt(0)}
                              />
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2">
                                 <h4 className="text-[13px] font-semibold text-[#1E1B4B] group-hover:text-primary transition-colors flex-1 min-w-0 line-clamp-1">
                                    {job.title}
                                 </h4>
                                 <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[9px] font-semibold shrink-0 capitalize",
                                    (job.job_status === 'expired' || new Date(job.expires_at) < new Date()) ? "bg-amber-100 text-amber-700" : getJobStatusStyles(job.job_status)
                                 )}>
                                    {(job.job_status === 'expired' || new Date(job.expires_at) < new Date()) ? "Expired" : job.job_status}
                                 </span>
                              </div>
                              <div className="flex items-center justify-between gap-2 flex-wrap mt-1">
                                 <span className="flex items-center gap-1 text-[10px] text-slate-400"><Clock className="w-2.5 h-2.5" /> {new Date(job.created_at).toLocaleDateString('en-GB')}</span>
                                 <div className="flex items-center gap-2">
                                    {(job.job_status === 'expired' || new Date(job.expires_at) < new Date()) && (
                                       <Button
                                          onClick={() => handleJobAction(job.id, 'republish')}
                                          disabled={loadingJobId === job.id}
                                          size="sm"
                                          className="h-7 px-3 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-[10px] flex items-center gap-1.5"
                                       >
                                          {loadingJobId === job.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                          Republish
                                       </Button>
                                    )}
                                    {!(job.job_status === 'expired' || new Date(job.expires_at) < new Date()) && (
                                       <Link href={`${basePath}/jobs/view/${job.id}/applicants`}>
                                          <Button size="sm" className="h-6 px-2.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 font-medium text-[10px] flex items-center gap-1.5">
                                             <Users className="w-3 h-3" />
                                             <span className="hidden xs:inline">Applicants</span>
                                             {job.total_applications_count !== undefined && (
                                                <span className="bg-indigo-600 text-white px-1 rounded-md text-[9px] font-bold">
                                                   {job.total_applications_count || 0}
                                                </span>
                                             )}
                                          </Button>
                                       </Link>
                                    )}
                                    <Link href={`${basePath}/jobs/view/${job.id}`}>
                                       <Button size="sm" className="h-6 px-2.5 rounded-md bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 font-medium text-[10px]">View</Button>
                                    </Link>
                                 </div>
                              </div>
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

         {/* Management Intelligence: Team & Subscriptions Side-by-Side */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
            {/* Hiring Team Table */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col group">
               <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-2">
                     <Users className="w-4 h-4 text-indigo-600" />
                     <h2 className="text-[14px] font-semibold text-black">Hiring Team</h2>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                     {dashboardData?.total_recruiters || 0} Members
                  </span>
               </div>
               <div className="divide-y divide-slate-50">
                  {dashboardData?.recruiters?.data && dashboardData.recruiters.data.length > 0 ? (
                     dashboardData.recruiters.data.map((recruiter, idx) => (
                        <div key={`${recruiter.id}-${idx}`} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 hover:bg-slate-50/50 transition-colors">
                           <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-bold text-slate-900 truncate">{recruiter.name}</p>
                              <p className="text-[11px] text-slate-500 font-medium truncate">{recruiter.email}</p>
                           </div>
                           <div className="flex items-center gap-4 shrink-0">
                              <div className="text-center">
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Posts</p>
                                 <p className="text-[13px] font-bold text-slate-800">{recruiter.jobs_used}</p>
                              </div>
                              <div className="text-center">
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Featured</p>
                                 <p className="text-[13px] font-bold text-indigo-600">{recruiter.featured_jobs_used}</p>
                              </div>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="py-12 flex flex-col items-center justify-center text-center opacity-30">
                        <Users className="w-10 h-10 mb-2" />
                        <p className="text-[11px] font-bold">No recruiters assigned</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Subscription Lifecycle History */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col group">
               <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-2">
                     <Clock className="w-4 h-4 text-amber-600" />
                     <h2 className="text-[14px] font-semibold text-black">Subscription Timeline</h2>
                  </div>
                  {dashboardData?.credits_summary?.active_subscriptions_count && dashboardData.credits_summary.active_subscriptions_count > 1 && (
                     <span className="text-[10px] font-semibold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full animate-pulse">
                        {dashboardData.credits_summary.active_subscriptions_count} Active Packs
                     </span>
                  )}
               </div>
               <div className="divide-y divide-slate-50">
                  {dashboardData?.subscription_history && dashboardData.subscription_history.length > 0 ? (
                     dashboardData.subscription_history.map((item, idx) => (
                        <div key={idx} className="px-4 py-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 hover:bg-slate-50/50 transition-colors">
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                 <p className="text-[13px] font-semibold text-slate-900">{item.plan_name}</p>
                                 {new Date(item.expires_at) < new Date() && (
                                    <span className="text-[8px] text-rose-500 font-semibold uppercase border border-rose-100 px-1 rounded">Exp</span>
                                 )}
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                 {new Date(item.starts_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – {new Date(item.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                              </p>
                           </div>
                           <div className="flex items-center gap-3 shrink-0 ml-auto">
                              <p className="text-[10px] text-slate-400">{new Date(item.purchase_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                              <span className={cn(
                                 "px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize",
                                 item.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                              )}>
                                 {item.status}
                              </span>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="py-12 flex flex-col items-center justify-center text-center opacity-30">
                        <Clock className="w-10 h-10 mb-2" />
                        <p className="text-[11px] font-bold">No historical data available</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
