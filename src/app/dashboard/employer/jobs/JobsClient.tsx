"use client";

import { useState } from "react";
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Search, 
  PlusCircle, 
  Filter,
  CheckCircle2,
  Clock,
  MoreVertical,
  TrendingUp
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
  const jobs = initialData?.data || [];
  
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: "Total postings", value: initialData?.total_jobs || 0, icon: Briefcase, color: "blue" },
    { label: "Currently open", value: jobs.filter(j => j.job_status === 'open').length, icon: TrendingUp, color: "emerald" },
    { label: "Verified listings", value: jobs.filter(j => j.status === 'approved').length, icon: CheckCircle2, color: "indigo" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Requirement center</h1>
          <p className="text-xs text-gray-500 font-medium">Manage your active, expired, and upcoming job listings.</p>
        </div>
        
        <Link href="/dashboard/employer/post-job">
           <Button size="sm" className="h-10 px-6 rounded-lg font-bold text-xs tracking-widest shadow-md">
             <PlusCircle className="mr-2 w-4 h-4" />
             Launch new requirement
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
      <div className="bg-white p-2 rounded-xl border shadow-sm flex flex-col sm:flex-row items-center gap-2">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or location..." 
              className="h-9 pl-10 border-transparent bg-gray-50/50 focus:bg-white rounded-lg text-xs" 
            />
         </div>
         <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg text-xs font-bold border-gray-200">
               <Filter className="w-3.5 h-3.5 mr-2" /> Filter
            </Button>
         </div>
      </div>

      {/* Jobs Hub Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
               <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                     <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wide">Requirement title</th>
                     <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wide">Status / Visibility</th>
                     <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wide">Compensation & Type</th>
                     <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wide">Performance & Dates</th>
                     <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wide text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {filteredJobs.length > 0 ? filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50/30 transition-colors group">
                       <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                             <span className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight">{job.title}</span>
                             <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                                <span className={cn(
                                   "px-1.5 py-0.5 rounded text-[9px] font-bold",
                                   job.featured ? "text-amber-600 bg-amber-50 border border-amber-100" : "text-gray-400"
                                )}>
                                   {job.featured ? "Featured" : "Regular"}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-5">
                          <div className="flex flex-col gap-2">
                             <StatusBadge type="job" status={job.job_status} />
                             <StatusBadge type="admin" status={job.status} />
                          </div>
                       </td>
                       <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                             <span className="text-sm text-gray-900 font-bold tracking-tight">LPA {job.salary_min.split('.')[0]} - {job.salary_max.split('.')[0]}</span>
                             <span className="text-xs text-gray-500 font-medium capitalize">{job.job_type.replace('_', ' ')}</span>
                          </div>
                       </td>
                       <td className="px-6 py-5">
                          <div className="space-y-2">
                             <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" /> Published: {new Date(job.created_at).toLocaleDateString()}
                             </div>
                             {job.expires_at && (
                                <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
                                   <Clock className="w-3.5 h-3.5" /> Deadline: {new Date(job.expires_at).toLocaleDateString()}
                                </div>
                             )}
                          </div>
                       </td>
                       <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <Link href={`/jobs/${job.slug}`} target="_blank">
                                <Button size="sm" variant="outline" className="h-9 px-4 rounded-lg text-xs font-bold text-green-600 border-green-100 hover:bg-green-50 transition-colors">
                                   <ExternalLink className="w-4 h-4 mr-2" /> View
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
