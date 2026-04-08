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
   Calendar,
   Quote,
   Star
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

const ApplicationAvatar = ({ src, alt }: { src: string | null, alt: string }) => {
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
      <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-200">
        <Users className="w-5 h-5" />
      </div>
    );
  }

  return (
    <Image
       src={fullUrl}
       alt={alt}
       fill
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

   const stats = [
      {
         label: "Open listings",
         value: dashboardData?.total_jobs?.toString() || "0",
         icon: Briefcase,
         color: "blue",
         trend: "Active"
      },
      {
         label: "Total applicants",
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
         trend: "Pool"
      },
      {
         label: "Account Status",
         value: dashboardData?.company_verification === 1 ? "Verified" : "Pending",
         icon: TrendingUp,
         color: dashboardData?.company_verification === 1 ? "green" : "purple",
         trend: "Status"
      },
   ];

   const mockTestimonials = [
      {
         id: 1,
         name: "Dr. Sarah Johnson",
         role: "Principal",
         institution: "St. Xavier's Academy",
         message: "TeachNow has revolutionized how we find specialized teaching staff. The quality of candidates is unparalleled.",
         rating: 5
      },
      {
         id: 2,
         name: "Robert Chen",
         role: "HR Director",
         institution: "International School Group",
         message: "The dashboard is incredibly intuitive. Managing multiple job postings and applicants has never been easier.",
         rating: 5
      }
   ];

   return (
      <div className="max-w-6xl mx-auto px-4 py-4 space-y-6 font-sans text-slate-700 pb-12">
         {/* Simple Header */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1">
               <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Employer dashboard</h1>
               <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-400">Welcome, {welcomeName}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-xs font-medium text-emerald-500">Live system synchronized</span>
               </div>
            </div>

            <Link href={`${basePath}/post-job`}>
               <Button size="sm" className="h-10 px-6 rounded-xl font-semibold text-xs transition-all shadow-sm active:scale-95 text-white">
                  <PlusCircle className="w-4 h-4 mr-2" /> Post a job
               </Button>
            </Link>
         </div>

         {/* Stats Grid */}
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
               <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity -mr-8 -mt-8 rounded-full" />

                  <div className="flex items-start justify-between mb-4 relative z-10 font-medium">
                     <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105",
                        stat.color === 'blue' && "bg-blue-50 text-blue-600 border-blue-100",
                        stat.color === 'indigo' && "bg-indigo-50 text-indigo-600 border-indigo-100",
                        stat.color === 'emerald' && "bg-emerald-50 text-emerald-600 border-emerald-100",
                        stat.color === 'green' && "bg-emerald-50 text-emerald-600 border-emerald-100",
                        stat.color === 'purple' && "bg-purple-50 text-purple-600 border-purple-100",
                     )}>
                        <stat.icon className="w-5 h-5" />
                     </div>
                     <span className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-md border",
                        stat.color === 'blue' && "text-blue-500 border-blue-100 bg-blue-50/30",
                        stat.color === 'indigo' && "text-indigo-500 border-indigo-100 bg-indigo-50/30",
                        stat.color === 'emerald' && "text-emerald-500 border-emerald-100 bg-emerald-50/30",
                        stat.color === 'green' && "text-emerald-500 border-emerald-100 bg-emerald-50/30",
                        stat.color === 'purple' && "text-purple-500 border-purple-100 bg-purple-50/30",
                     )}>{stat.trend}</span>
                  </div>

                  <div className="space-y-0.5 relative z-10">
                     <p className="text-[11px] font-medium text-slate-400">{stat.label}</p>
                     <h3 className="text-xl font-bold text-slate-900 leading-tight">{stat.value}</h3>
                  </div>
               </div>
            ))}
         </div>

         {/* Admin Notice */}
         {dashboardData?.company_verification !== 1 && (
            <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-500 border border-amber-100 shadow-inner shrink-0">
                     <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                     <p className="text-xs font-semibold text-amber-900">Verification in progress</p>
                     <p className="text-xs text-amber-800/70 font-medium leading-relaxed">
                        Your institution profile is currently under review by our administration.
                     </p>
                  </div>
               </div>
               <Link href={`${basePath}/institution-verification`} className="w-full sm:w-auto">
                  <Button size="sm" variant="outline" className="h-9 w-full px-5 rounded-xl bg-white text-amber-600 border-amber-200 hover:bg-amber-50 text-xs font-semibold transition-all">
                     View status
                  </Button>
               </Link>
            </div>
         )}

         {/* Main Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Recent Applications */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col min-h-[460px] overflow-hidden">
               <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between font-medium">
                  <div className="flex items-center gap-2.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                     <h2 className="text-xs font-semibold text-slate-800">Recent applications</h2>
                  </div>
                  <Link href={`${basePath}/applicants`} className="text-[11px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1.5 transition-all active:scale-95">
                     View all <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
               </div>

               <div className="flex-1">
                  {dashboardData?.latest_applications && dashboardData.latest_applications.length > 0 ? (
                     <div className="divide-y divide-slate-50">
                        {dashboardData.latest_applications.slice(0, 6).map((app) => (
                           <div key={app.id} className="p-4 hover:bg-slate-50/30 transition-colors flex items-center gap-4 group cursor-pointer">
                              <div className="relative w-11 h-11 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform flex items-center justify-center">
                                 <ApplicationAvatar 
                                    src={app.job_seeker.profile_photo} 
                                    alt={app.job_seeker.user.name} 
                                 />
                              </div>
                              <div className="flex-1 min-w-0 font-medium">
                                 <h4 className="text-sm font-semibold text-slate-900 truncate flex items-center gap-2">
                                    {app.job_seeker.user.name}
                                    <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 italic">{app.job_seeker.title}</span>
                                 </h4>
                                 <p className="text-[11px] text-slate-500 truncate mt-1">Applied for <span className="text-primary font-semibold">{app.job.title}</span></p>
                              </div>
                              <div className="text-right shrink-0">
                                 <span className={cn(
                                    "px-2 py-0.5 rounded-md text-[10px] font-semibold border shadow-sm",
                                    app.status === 'shortlisted' ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                 )}>
                                    {app.status}
                                 </span>
                                 <p className="text-[10px] text-slate-300 mt-1.5 font-medium">{new Date(app.created_at).toLocaleDateString()}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50/10">
                        <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                           <Users className="w-8 h-8 text-slate-100" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">No applications yet</h3>
                        <p className="text-xs text-slate-400 max-w-xs mb-6 font-medium leading-relaxed">Candidates will appear here as soon as they apply for your job posts.</p>
                        <Link href={`${basePath}/post-job`}>
                           <Button variant="outline" size="sm" className="h-10 px-6 rounded-xl text-xs font-semibold border-slate-200 hover:bg-slate-50 transition-all shadow-sm">Post a job</Button>
                        </Link>
                     </div>
                  )}
               </div>
            </div>

            {/* Sidebar Active Positions */}
            <div className="space-y-5">
               <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between font-medium">
                     <h2 className="text-xs font-semibold text-slate-900">Active positions</h2>
                     <Link href={`${basePath}/jobs`} className="text-[11px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1.5 transition-all active:scale-95">
                        Manage <ArrowRight className="w-3.5 h-3.5" />
                     </Link>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-[360px] overflow-y-auto custom-scrollbar">
                     {dashboardData?.latest_jobs && dashboardData.latest_jobs.length > 0 ? (
                        dashboardData.latest_jobs.map((job) => (
                           <div key={job.id} className="p-4 hover:bg-slate-50/30 transition-all group flex items-start gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner group-hover:border-primary/20 transition-all">
                                 <Briefcase className="w-4.5 h-4.5 text-slate-300 group-hover:text-primary transition-colors" />
                              </div>
                              <div className="min-w-0 flex-1">
                                 <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-xs font-semibold text-slate-800 group-hover:text-primary transition-colors truncate">{job.title}</h4>
                                    <span className={cn(
                                       "text-[10px] font-semibold px-1.5 py-0.5 rounded-md border",
                                       job.job_status === 'open' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                    )}>
                                       {job.job_status}
                                    </span>
                                 </div>
                                 <p className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400 font-medium">
                                    <Calendar className="w-3 h-3 text-slate-300" /> Posted on {new Date(job.created_at).toLocaleDateString()}
                                 </p>
                              </div>
                           </div>
                        ))
                     ) : (
                        <div className="p-10 text-center text-xs text-slate-300 font-medium">No open positions found.</div>
                     )}
                  </div>
               </div>

               {/* Profile Progress / Action */}
               <Link href={`${basePath}/post-job`} className="block group font-medium">
                  <div className="bg-primary p-5 rounded-xl shadow-xl shadow-primary/10 flex items-center justify-between hover:translate-y-[-2px] transition-all relative overflow-hidden text-white">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
                     <div className="space-y-1 relative z-10">
                        <p className="text-[10px] font-semibold text-white/50">Grow your team</p>
                        <h4 className="text-sm font-bold tracking-tight">Post a new opening</h4>
                     </div>
                     <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform relative z-10 shadow-lg">
                        <PlusCircle className="w-6 h-6" />
                     </div>
                  </div>
               </Link>
            </div>
         </div>

         {/* Dashboard Testimonials Section */}
         <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2.5 font-medium">
               <Quote className="w-4 h-4 text-primary" />
               <h2 className="text-xs font-semibold text-slate-800 uppercase tracking-tight">What other employers say</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-50">
               {mockTestimonials.map((testimonial) => (
                  <div key={testimonial.id} className="p-6 space-y-4 hover:bg-slate-50/20 transition-colors">
                     <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                           <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        ))}
                     </div>
                     
                     <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                        "{testimonial.message}"
                     </p>
                     
                     <div className="flex items-center gap-3 pt-2">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                           {testimonial.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                           <p className="text-xs font-bold text-slate-900 truncate">{testimonial.name}</p>
                           <p className="text-[10px] font-semibold text-slate-400 truncate uppercase tracking-tighter">
                              {testimonial.role} at {testimonial.institution}
                           </p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
}
