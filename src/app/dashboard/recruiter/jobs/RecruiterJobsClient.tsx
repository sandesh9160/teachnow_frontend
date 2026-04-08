"use client";

import { useState, useMemo } from "react";
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Edit3, 
  Trash2, 
  Search, 
  PlusCircle, 
  Clock,
  TrendingUp,
  Layout,
  AlertCircle,
  ChevronLeft,
  Users
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { cn } from "@/lib/utils";

interface Job {
  id: number;
  title: string;
  slug: string;
  location: string;
  job_type: string;
  job_status: string;
  status: string;
  vacancies: number;
  salary_min: string;
  salary_max: string;
  created_at: string;
  expires_at: string;
  is_active: number;
  featured: number;
  applications_count?: number;
}

const StatusBadge = ({ status }: { status: string }) => {
  const isOpen = status.toLowerCase() === 'open' || status.toLowerCase() === 'approved';
  const isPending = status.toLowerCase() === 'pending';
  
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-md text-xs font-semibold tracking-normal border",
      isOpen 
      ? "bg-green-50 text-green-600 border-green-100/50" 
      : isPending
      ? "bg-amber-50 text-amber-600 border-amber-100/50"
      : "bg-gray-100 text-gray-400 border border-gray-200"
    )}>
      {status}
    </span>
  );
};

export default function RecruiterJobsClient({ 
  jobs,
  totalJobs 
}: { 
  jobs: Job[];
  totalJobs: number;
}) {
  const userRole = "recruiter";
  const basePath = `/dashboard/${userRole}`;
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'Active' | 'Pending' | 'Expired' | 'Featured'>('Active');
  
  const now = new Date();

  // Partition jobs based on status and dates
  const partitionedJobs = useMemo(() => {
    return {
      active: jobs.filter(j => (j.status === 'approved' || j.status === 'open') && (j.expires_at ? new Date(j.expires_at) >= now : true)),
      pending: jobs.filter(j => j.status === 'pending'),
      expired: jobs.filter(j => j.expires_at ? new Date(j.expires_at) < now : false),
      featured: jobs.filter(j => j.featured === 1)
    };
  }, [jobs, now]);

  const jobsSource = 
    activeTab === 'Active' ? partitionedJobs.active : 
    activeTab === 'Pending' ? partitionedJobs.pending : 
    activeTab === 'Expired' ? partitionedJobs.expired : 
    partitionedJobs.featured;
  
  const filteredJobs = jobsSource.filter((job) => 
    job?.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    job?.location?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
      {/* Back Button */}
      <button 
        onClick={() => window.history.back()} 
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-primary transition-colors mb-2 group w-fit"
      >
        <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Overview
      </button>

      {/* Compact Header */}
      <div className="flex items-center justify-between gap-4 border-b pb-4 border-gray-100">
        <div>
          <h1 className="text-xl font-semibold text-primary ">Job Inventory</h1>
          <p className="text-sm text-gray-400 font-medium ">Review and control your {totalJobs} job listings</p>
        </div>
        
        <Link href={`${basePath}/post-job`}>
           <Button size="sm" className="h-9 px-4 rounded-lg font-semibold text-xs  shadow-md whitespace-nowrap">
             <PlusCircle className="mr-2 w-3.5 h-3.5" />
             <span className="hidden xs:inline">Post Job</span>
             <span className="xs:hidden">Post</span>
           </Button>
        </Link>
      </div>

      {/* Mini Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active", value: partitionedJobs.active.length, icon: Briefcase, color: "emerald" },
          { label: "Pending", value: partitionedJobs.pending.length, icon: AlertCircle, color: "amber" },
          { label: "Expired", value: partitionedJobs.expired.length, icon: Clock, color: "gray" },
          { label: "Featured", value: partitionedJobs.featured.length, icon: TrendingUp, color: "indigo" },
        ].map((s, i) => (
          <div key={i} className={cn(
            "bg-white p-3 rounded-xl border shadow-sm flex items-center gap-3",
            i > 1 ? "hidden lg:flex" : "flex" 
          )}>
            <div className={cn(
               "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
               s.color === 'gray' && "bg-gray-100 text-gray-500",
               s.color === 'emerald' && "bg-emerald-50 text-emerald-600",
               s.color === 'amber' && "bg-amber-50 text-amber-600",
               s.color === 'indigo' && "bg-indigo-50 text-indigo-600",
            )}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">{s.label}</p>
              <h3 className="text-base font-semibold text-slate-900 leading-none">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="bg-white p-2 rounded-xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
         <div className="flex-1 w-full md:max-w-xs relative scale-[0.98]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter listings..." 
              className="h-8.5 pl-10 border-transparent bg-gray-50/50 focus:bg-white rounded-lg text-xs font-semibold focus:ring-1 focus:ring-primary/10" 
            />
         </div>

         <div className="flex items-center gap-1 bg-gray-50/50 p-1 rounded-xl border border-gray-100 font-semibold overflow-x-auto no-scrollbar max-w-full">
            {[
                { id: 'Active', label: 'Active', count: partitionedJobs.active.length },
                { id: 'Pending', label: 'Pending', count: partitionedJobs.pending.length },
                { id: 'Expired', label: 'Expired', count: partitionedJobs.expired.length },
                { id: 'Featured', label: 'Featured', count: partitionedJobs.featured.length },
            ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-semibold  transition-all whitespace-nowrap",
                    activeTab === tab.id 
                    ? "bg-white text-primary shadow-sm border border-gray-100" 
                    : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  {tab.label} ({tab.count})
                </button>
            ))}
         </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 gap-3 pb-10">
         {filteredJobs.length > 0 ? filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-4 group">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                     <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                        job.featured 
                          ? "bg-amber-50 text-amber-600 border-amber-100 shadow-sm" 
                          : "bg-blue-50 text-blue-600 border-blue-100/50"
                     )}>
                        {job.featured ? <TrendingUp className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                     </div>
                     <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                           <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors truncate max-w-[200px] sm:max-w-none">{job.title}</h3>
                           <div className="flex items-center gap-1.5">
                              <StatusBadge status={job.job_status} />
                              <StatusBadge status={job.status} />
                           </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1">
                           <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                             <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> {job.location}
                           </span>
                           <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                             <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Expires {job.expires_at ? new Date(job.expires_at).toLocaleDateString('en-GB') : 'N/A'}
                           </span>
                           <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                             <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" /> {job.applications_count ?? 0} Applied
                           </span>
                           <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                             <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Posted on {new Date(job.created_at).toLocaleDateString('en-GB')}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                     <Link href={`${basePath}/jobs/view/${job.id}`} className="flex-1 sm:flex-none">
                        <Button variant="outline" className="w-full h-8 px-3 rounded-lg text-sm font-semibold text-emerald-600 border-emerald-100 hover:bg-emerald-50 whitespace-nowrap">
                           <Layout className="w-3.5 h-3.5 mr-1.5" /> View
                        </Button>
                     </Link>
                     <Link href={`${basePath}/jobs/edit/${job.id}`} className="flex-1 sm:flex-none">
                        <Button variant="outline" className="w-full h-8 px-3 rounded-lg text-sm font-semibold text-primary border-primary/10 hover:bg-primary/5 whitespace-nowrap">
                           <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
                        </Button>
                     </Link>
                     <Button variant="ghost" className="h-8 px-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                     </Button>
                  </div>
               </div>
            </div>
         )) : (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 flex flex-col items-center justify-center text-center gap-4">
               <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-200">
                  <Briefcase className="w-8 h-8" />
               </div>
               <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900 ">No jobs found</p>
                  <p className="text-sm text-gray-400 font-medium">Try adjusting your search criteria or post a new job.</p>
               </div>
               <Link href={`${basePath}/post-job`}>
                  <Button size="sm" className="h-9 px-6 rounded-xl font-semibold text-sm  shadow-md">Post Job</Button>
               </Link>
            </div>
         )}
      </div>
    </div>
  );
}
