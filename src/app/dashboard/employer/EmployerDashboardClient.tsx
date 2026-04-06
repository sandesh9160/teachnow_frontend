"use client";

import { 
  Users, 
  Briefcase, 
  TrendingUp,
  PlusCircle,
  // Clock,
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
          <h1 className="text-xl font-bold text-gray-900 tracking-tight text-primary">Employer Dashboard</h1>
          <p className="text-xs text-gray-500 font-medium">
             Welcome, <span className="text-gray-900 font-bold">{welcomeName}</span>. Your portal is synchronized and up to date.
          </p>
        </div>
        
        <Link href="/dashboard/employer/post-job">
          <Button size="sm" className="h-9 px-6 rounded-lg font-bold text-xs tracking-widest shadow-sm">
            <PlusCircle className="mr-2 w-4 h-4" />
            Launch New Job
          </Button>
        </Link>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-all">
             <div className="flex items-start justify-between mb-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  stat.color === 'blue' && "bg-blue-50 text-blue-600",
                  stat.color === 'indigo' && "bg-indigo-50 text-indigo-600",
                  stat.color === 'emerald' && "bg-emerald-50 text-emerald-600",
                  stat.color === 'purple' && "bg-purple-50 text-purple-600",
                )}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-gray-400 capitalize">{stat.trend}</span>
             </div>
             
             <div className="space-y-0.5">
                <p className="text-[9px] font-bold tracking-widest text-gray-400">{stat.label}</p>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
             </div>
          </div>
        ))}
      </div>

      {/* Compact Alert Section - Prominent Placement */}
      {dashboardData?.company_verification !== 1 && (
         <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-amber-500 border border-amber-100 shadow-sm shrink-0">
                 <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                <span className="font-bold tracking-tight">Profile verification: Under review.</span> Your profile is currently under review by our admin team. Complete your profile to expedite approval.
              </p>
            </div>
            <Link href="/dashboard/employer/company-profile">
               <Button size="sm" variant="outline" className="h-8 px-4 rounded-lg bg-white text-amber-600 border-amber-200 hover:bg-amber-50 text-[10px] font-bold">
                  Manage Profile
               </Button>
            </Link>
         </div>
      )}

      {/* Compact Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
         {/* Latest Applications - High Density List */}
         <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm flex flex-col min-h-[400px]">
            <div className="px-5 py-3 border-b bg-gray-50/20 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-[10px] font-bold text-gray-900 tracking-widest">Recent Applications</h2>
               </div>
               <Link href="/dashboard/employer/applicants" className="text-[9px] font-bold text-primary tracking-widest hover:underline flex items-center gap-1">
                  View Trackings <ArrowRight className="w-3 h-3" />
               </Link>
            </div>
            
            <div className="flex-1 overflow-hidden">
               {dashboardData?.latest_applications && dashboardData.latest_applications.length > 0 ? (
                  <div className="divide-y border-t border-gray-50">
                     {dashboardData.latest_applications.slice(0, 5).map((app) => (
                        <div key={app.id} className="p-4 hover:bg-gray-50/50 transition-colors flex items-center gap-4">
                           <div className="relative w-10 h-10 rounded-full border bg-gray-100 overflow-hidden shrink-0">
                              {app.job_seeker.profile_photo ? (
                                 <Image 
                                    src={getFullImageUrl(app.job_seeker.profile_photo)!} 
                                    alt={app.job_seeker.user.name} 
                                    fill 
                                    className="object-cover" 
                                 />
                              ) : (
                                 <Users className="w-5 h-5 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                              )}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-gray-900 truncate">{app.job_seeker.user.name}</h4>
                              <p className="text-[10px] text-gray-500 truncate mt-0.5">{app.job_seeker.title} • <span className="font-bold text-primary">{app.job.title}</span></p>
                           </div>
                           <div className="text-right shrink-0">
                              <span className={cn(
                                 "inline-flex px-2 py-0.5 rounded text-[8px] font-black tracking-widest",
                                 app.status === 'shortlisted' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-gray-100 text-gray-500"
                              )}>
                                 {app.status}
                              </span>
                              <p className="text-[8px] text-gray-400 mt-1 font-bold">{new Date(app.created_at).toLocaleDateString()}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50/10">
                     <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center mb-4 border border-gray-100 shadow-inner">
                        <Users className="w-8 h-8 text-gray-200" />
                     </div>
                     <h3 className="text-base font-bold text-gray-900 mb-1">No New Applicants</h3>
                     <p className="text-xs text-gray-400 max-w-sm mb-6 font-medium">Sit tight! Applications will appear here as soon as teachers apply to your listings.</p>
                     <Link href="/dashboard/employer/post-job">
                        <Button variant="outline" size="sm" className="h-9 px-6 rounded-lg text-[10px] font-bold tracking-widest border border-gray-200">Post More Jobs</Button>
                     </Link>
                  </div>
               )}
            </div>
         </div>

         {/* Sidebar Area: Quick Jobs & Status */}
         <div className="space-y-4">
            {/* Quick Jobs Section */}
            <div className="bg-white rounded-xl border shadow-sm flex flex-col">
               <div className="px-5 py-3 border-b bg-gray-50/20 flex items-center justify-between">
                  <h2 className="text-[10px] font-bold text-gray-900 tracking-widest">Active Listings</h2>
                  <Link href="/dashboard/employer/my-jobs" className="text-[9px] font-bold text-primary tracking-widest hover:underline flex items-center gap-1">Manage <ArrowRight className="w-3 h-3" /></Link>
               </div>
               <div className="divide-y max-h-[300px] overflow-y-auto">
                  {dashboardData?.latest_jobs && dashboardData.latest_jobs.length > 0 ? (
                     dashboardData.latest_jobs.map((job) => (
                        <div key={job.id} className="p-3 hover:bg-gray-50 transition-colors">
                           <div className="flex items-start justify-between">
                              <h4 className="text-[11px] font-bold text-gray-800 truncate pr-4">{job.title}</h4>
                              <span className={cn(
                                 "text-[8px] font-black px-1.5 py-0.5 rounded",
                                 job.job_status === 'open' ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                              )}>
                                 {job.job_status}
                              </span>
                           </div>
                           <div className="flex items-center gap-3 mt-1.5 text-[9px] text-gray-400 font-bold tracking-widest">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(job.created_at).toLocaleDateString()}</span>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="p-6 text-center text-[11px] text-gray-400 font-medium">No jobs posted yet.</div>
                  )}
               </div>
            </div>

            {/* Verification Status Banner (Always Compact) */}
            <div className={cn(
               "p-4 rounded-xl border relative overflow-hidden",
               dashboardData?.company_verification === 1 
               ? "bg-emerald-50 border-emerald-100" 
               : "bg-amber-50 border-amber-100"
            )}>
               <div className="flex items-start gap-3 relative z-10">
                  {dashboardData?.company_verification === 1 ? (
                     <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                     <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  )}
                  <div className="space-y-1">
                     <h4 className={cn(
                        "text-[10px] font-black tracking-widest",
                        dashboardData?.company_verification === 1 ? "text-emerald-700" : "text-amber-700"
                     )}>
                        Profile Status
                     </h4>
                     <p className={cn(
                        "text-[11px] font-medium leading-relaxed",
                        dashboardData?.company_verification === 1 ? "text-emerald-700/70" : "text-amber-700/70"
                     )}>
                        {dashboardData?.company_verification === 1 
                           ? "Your profile is fully verified and public." 
                           : "Your profile is currently under review by our admin team."}
                     </p>
                  </div>
               </div>
            </div>

            {/* Quick Action Link */}
            <Link href="/dashboard/employer/post-job" className="block group">
               <div className="bg-primary p-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-between group-hover:scale-[1.02] transition-transform">
                  <div className="space-y-0.5">
                     <p className="text-[10px] font-black text-white/60 tracking-widest">Growth</p>
                     <h4 className="text-xs font-black text-white tracking-tight">Post New Teacher Requirement</h4>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                     <PlusCircle className="w-5 h-5" />
                  </div>
               </div>
            </Link>
         </div>
      </div>
    </div>
  );
}
