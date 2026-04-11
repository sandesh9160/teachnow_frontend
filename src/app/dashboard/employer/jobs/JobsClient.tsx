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
  Clock,
  TrendingUp,
  Layout,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { cn } from "@/lib/utils";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

const StatusBadge = ({ status }: { status: string }) => {
  const isOpen = status.toLowerCase() === 'open' || status.toLowerCase() === 'approved';
  
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-normal whitespace-nowrap",
      isOpen 
      ? "bg-green-50 text-green-600 border border-green-100/50" 
      : "bg-slate-50 text-slate-400 border border-slate-200"
    )}>
      {status}
    </span>
  );
};

export default function JobsClient({ 
  initialData,
  userRole = "employer"
}: { 
  initialData?: JobsClientProps["initialData"],
  userRole?: string
}) {
  const router = useRouter();
  const basePath = `/dashboard/${userRole}`;
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'active' | 'expired' | 'featured'>('active');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  const activeJobs: Job[] = (initialData as any)?.active_jobs?.data || [];
  const expiredJobs: Job[] = (initialData as any)?.expired_jobs?.data || [];
  const featuredJobs = [...activeJobs, ...expiredJobs].filter(j => j.featured === 1);
  
  const jobsSource = activeTab === 'active' ? activeJobs : (activeTab === 'expired' ? expiredJobs : featuredJobs);
  
  const filteredJobs = jobsSource.filter((job: any) => 
    job?.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    job?.location?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    toast("Delete this job listing? This action cannot be undone.", {
      action: {
        label: "Delete",
        onClick: async () => {
          setDeletingId(id);
          try {
            const res = await dashboardServerFetch<any>(`employer/jobs/delete/${id}`, {
              method: "DELETE"
            });

            if (res?.status) {
              toast.success("Job deleted successfully");
              router.refresh();
            } else {
              toast.error(res?.message || "Failed to delete job");
              if (res?.message?.includes("Method Not Allowed")) {
                const retryRes = await dashboardServerFetch<any>(`employer/jobs/delete/${id}`, {
                  method: "POST"
                });
                if (retryRes?.status) {
                  toast.success("Job deleted successfully");
                  router.refresh();
                  return;
                }
              }
            }
          } catch (e) {
            toast.error("An unexpected error occurred");
          } finally {
            setDeletingId(null);
          }
        }
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4 font-sans text-slate-700 pb-20">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-slate-100">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Manage jobs</h1>
          <p className="text-xs font-medium text-slate-400">Review and control your job listings</p>
        </div>
        
        <Link href={`${basePath}/post-job`} className="w-full sm:w-auto">
           <Button size="sm" className="h-10 w-full px-5 rounded-xl font-semibold text-xs transition-all shadow-sm">
             <PlusCircle className="mr-2 w-4 h-4" />
             Post a job
           </Button>
        </Link>
      </div>

      {/* Mini Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label: "Active", value: activeJobs.length, icon: Briefcase, color: "emerald" },
          { label: "Expired", value: expiredJobs.length, icon: Clock, color: "gray" },
          { label: "Featured", value: featuredJobs.length, icon: TrendingUp, color: "indigo" },
        ].map((s, i) => (
          <div key={i} className={cn(
            "bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 transition-transform active:scale-[0.98]",
            i === 2 ? "hidden lg:flex" : "" 
          )}>
            <div className={cn(
               "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner",
               s.color === 'gray' && "bg-slate-100 text-slate-500",
               s.color === 'emerald' && "bg-emerald-50 text-emerald-600",
               s.color === 'indigo' && "bg-indigo-50 text-indigo-600",
            )}>
              <s.icon className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-slate-400">{s.label}</p>
              <h3 className="text-base font-semibold text-slate-900 leading-none">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
         <div className="flex-1 w-full md:max-w-xs relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search listings..." 
              className="h-10 pl-10 border-transparent bg-slate-50/50 focus:bg-white rounded-xl text-xs font-medium" 
            />
         </div>

         <div className="flex items-center gap-1 bg-slate-50/50 p-1 rounded-xl border border-slate-100 font-medium overflow-x-auto no-scrollbar max-w-full">
            {[
                { id: 'active', label: 'Active', count: activeJobs.length },
                { id: 'expired', label: 'Expired', count: expiredJobs.length },
                { id: 'featured', label: 'Featured', count: featuredJobs.length },
            ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                    activeTab === tab.id 
                    ? "bg-white text-primary shadow-sm border border-slate-100" 
                    : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {tab.label} ({tab.count})
                </button>
            ))}
         </div>
      </div>

      {/* Jobs Grid (Responsive) */}
      <div className="grid grid-cols-1 gap-4">
         {filteredJobs.length > 0 ? filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-4 group relative overflow-hidden">
               <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                     <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-inner transition-transform group-hover:scale-105",
                        job.featured ? "bg-amber-50 text-amber-500 border-amber-100" : "bg-slate-50 text-slate-400 border-slate-100"
                     )}>
                        {job.featured ? <TrendingUp className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
                     </div>
                     <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 pr-8 sm:pr-0">
                           <h3 className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors truncate max-w-full">{job.title}</h3>
                           <div className="flex flex-wrap items-center gap-1.5">
                              <StatusBadge status={job.job_status} />
                              <StatusBadge status={job.status} />
                           </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                           <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                           <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400"><Calendar className="w-3.5 h-3.5" /> Expires {new Date(job.expires_at).toLocaleDateString('en-GB')}</span>
                           <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-400"><Clock className="w-3.5 h-3.5" /> Posted {new Date(job.created_at).toLocaleDateString('en-GB')}</span>
                        </div>
                     </div>
                     
                     <div className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0">
                        <Button 
                          onClick={() => handleDelete(job.id)}
                          disabled={deletingId === job.id}
                          variant="ghost" 
                          className="h-9 w-9 p-0 rounded-xl text-red-500 hover:bg-red-50 transition-all font-semibold border border-transparent hover:border-red-100 active:scale-95"
                        >
                           {deletingId === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-50">
                     <Link href={`${basePath}/jobs/view/${job.id}`}>
                        <Button variant="outline" className="w-full h-11 px-3 rounded-xl text-xs font-semibold text-emerald-600 border-emerald-100 hover:bg-emerald-50 active:scale-[0.98] transition-all shadow-sm">
                           <Layout className="w-4 h-4 mr-2" /> View
                        </Button>
                     </Link>
                     <Link href={`${basePath}/jobs/edit/${job.id}`}>
                        <Button variant="outline" className="w-full h-11 px-3 rounded-xl text-xs font-semibold text-primary border-primary/10 hover:bg-primary/5 active:scale-[0.98] transition-all shadow-sm">
                           <Edit3 className="w-4 h-4 mr-2" /> Edit
                        </Button>
                     </Link>
                  </div>
               </div>
            </div>
         )) : (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 py-16 flex flex-col items-center justify-center text-center gap-4">
               <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200 border border-slate-100 shadow-inner">
                  <Briefcase className="w-10 h-10" />
               </div>
               <div className="space-y-1.5">
                  <p className="text-base font-semibold text-slate-900 tracking-tight">No jobs found</p>
                  <p className="text-xs text-slate-400 font-medium">Try adjusting your search criteria or post a new job.</p>
               </div>
               <Link href={`${basePath}/post-job`} className="w-full max-w-[200px]">
                  <Button size="sm" className="h-11 w-full px-6 rounded-xl font-semibold text-xs shadow-md transition-all">Post a job</Button>
               </Link>
            </div>
         )}
      </div>
    </div>
  );
}
