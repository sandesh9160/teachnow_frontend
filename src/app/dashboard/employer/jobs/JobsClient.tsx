"use client";

import { useState } from "react";
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Edit3, 
  Trash2, 
  Search, 
  PlusCircle, 
  Filter,
  CheckCircle2,
  Clock,
  MoreVertical,
  TrendingUp,
  Layout,
  FileText
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
}

interface JobsClientProps {
  initialData?: {
    status: boolean;
    total_jobs: number;
    data: Job[];
  };
}

const StatusBadge = ({ status }: { type: 'job' | 'admin', status: string }) => {
  const isOpen = status.toLowerCase() === 'open' || status.toLowerCase() === 'approved';
  
  return (
    <span className={cn(
      "px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest",
      isOpen 
      ? "bg-green-50 text-green-600 border border-green-100" 
      : "bg-gray-100 text-gray-500 border border-gray-200"
    )}>
      {status}
    </span>
  );
};

export default function JobsClient({ initialData }: JobsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'active' | 'expired' | 'featured'>('active');
  
  // High-resilience job discovery engine
  const activeJobs: Job[] = (initialData as any)?.active_jobs?.data || [];
  const expiredJobs: Job[] = (initialData as any)?.expired_jobs?.data || [];
  const featuredJobs = [...activeJobs, ...expiredJobs].filter(j => j.featured === 1);
  
  const jobs = activeTab === 'active' ? activeJobs : (activeTab === 'expired' ? expiredJobs : featuredJobs);
  
  const filteredJobs = jobs.filter((job: any) => 
    job?.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    job?.location?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const stats = [
    { 
      label: "Active Postings", 
      value: (initialData as any)?.active_jobs?.total || activeJobs.length, 
      icon: Briefcase, 
      color: "emerald" 
    },
    { 
      label: "Expired Listings", 
      value: (initialData as any)?.expired_jobs?.total || expiredJobs.length, 
      icon: Clock, 
      color: "gray" 
    },
    { 
      label: "Verified", 
      value: jobs.filter(j => j?.status === 'approved').length, 
      icon: CheckCircle2, 
      color: "indigo" 
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Manage Jobs</h1>
          <p className="text-xs text-gray-500 font-medium">Keep track of your current job listings and applications.</p>
        </div>
        
        <Link href="/dashboard/employer/post-job">
           <Button size="sm" className="h-10 px-6 rounded-lg font-bold text-xs tracking-widest shadow-md">
             <PlusCircle className="mr-2 w-4 h-4" />
             Post a New Job
           </Button>
        </Link>
      </div>

      {/* Mini Stats Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
            <div className={cn(
               "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
               s.color === 'blue' && "bg-blue-50 text-blue-600",
               s.color === 'emerald' && "bg-emerald-50 text-emerald-600",
               s.color === 'indigo' && "bg-indigo-50 text-indigo-600",
            )}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 tracking-widest">{s.label}</p>
              <h3 className="text-xl font-black text-gray-900">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar Controls */}
      <div className="bg-white p-2 rounded-xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
         <div className="flex-1 w-full sm:max-w-md relative scale-[0.98]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or location..." 
              className="h-8.5 pl-10 border-transparent bg-gray-50/50 focus:bg-white rounded-lg text-xs font-semibold" 
            />
         </div>

         <div className="flex items-center gap-1 bg-gray-50/50 p-1 rounded-xl border border-gray-100 font-bold">
            <button 
              onClick={() => setActiveTab('active')}
              className={cn(
                "px-5 py-1.5 rounded-lg text-[10px] transition-all",
                activeTab === 'active' 
                ? "bg-white text-primary shadow-sm border border-gray-100" 
                : "text-gray-400 hover:text-gray-600"
              )}
            >
              Active Postings ({activeJobs.length})
            </button>
            <button 
              onClick={() => setActiveTab('expired')}
              className={cn(
                "px-5 py-1.5 rounded-lg text-[10px] transition-all",
                activeTab === 'expired' 
                ? "bg-white text-gray-900 shadow-sm border border-gray-100" 
                : "text-gray-400 hover:text-gray-600"
              )}
            >
              Expired Listings ({expiredJobs.length})
            </button>
            <button 
              onClick={() => setActiveTab('featured')}
              className={cn(
                "px-5 py-1.5 rounded-lg text-[10px] transition-all flex items-center gap-1.5",
                activeTab === 'featured' 
                ? "bg-white text-indigo-600 shadow-sm border border-gray-100" 
                : "text-gray-400 hover:text-indigo-600 font-bold"
              )}
            >
              <TrendingUp className="w-3 h-3 text-indigo-400" />
              Featured Jobs ({featuredJobs.length})
            </button>
         </div>
      </div>

      {/* Jobs Hub Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                     <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wide">Job Post</th>
                     <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wide">Hiring Status</th>
                     <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wide">System Status</th>
                     <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wide">Featured</th>
                     <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wide text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {filteredJobs.length > 0 ? filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50/30 transition-colors group">
                       <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                             <span className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight">{job.title}</span>
                             <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(job.created_at).toLocaleDateString()}</span>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-5">
                          <StatusBadge type="job" status={job.job_status} />
                       </td>
                       <td className="px-6 py-5">
                          <StatusBadge type="admin" status={job.status} />
                       </td>
                       <td className="px-6 py-5">
                          <div className={cn(
                             "w-8 h-8 rounded-lg flex items-center justify-center border",
                             job.featured 
                             ? "bg-amber-50 text-amber-500 border-amber-100 shadow-sm" 
                             : "bg-gray-50 text-gray-300 border-gray-100 grayscale opacity-40"
                          )}>
                             <TrendingUp className="w-4 h-4" />
                          </div>
                       </td>
                       <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <Link href={`/dashboard/employer/jobs/view/${job.id}`}>
                                <Button size="sm" variant="outline" className="h-9 px-4 rounded-lg text-xs font-bold text-green-600 border-green-100 hover:bg-green-50 transition-colors">
                                   <Layout className="w-4 h-4 mr-2" /> View
                                </Button>
                             </Link>
                             <Link href={`/dashboard/employer/jobs/edit/${job.id}`}>
                                <Button size="sm" variant="outline" className="h-9 px-4 rounded-lg text-xs font-bold text-primary border-primary/10 hover:bg-primary/5 transition-colors">
                                   <Edit3 className="w-4 h-4 mr-2" /> Edit
                                </Button>
                             </Link>
                             <Button size="sm" variant="ghost" className="h-9 px-4 rounded-lg text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                             </Button>
                          </div>
                       </td>
                    </tr>
                  )) : (
                    <tr>
                       <td colSpan={5} className="px-6 py-24 text-center">
                          <div className="flex flex-col items-center gap-4">
                             <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-200">
                                <Briefcase className="w-8 h-8" />
                             </div>
                             <div className="space-y-1">
                                <p className="text-sm text-gray-900 font-bold">No active requirements</p>
                                <p className="text-xs text-gray-400 font-medium">Start launching new jobs to attract top teaching talent.</p>
                             </div>
                             <Link href="/dashboard/employer/post-job">
                                <Button size="sm" className="h-10 px-6 rounded-lg text-xs font-bold shadow-sm">Post new job</Button>
                             </Link>
                          </div>
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
