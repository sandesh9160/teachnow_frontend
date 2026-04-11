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
  Users,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";

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
  const s = status.toLowerCase();
  const isOpen = s === 'open' || s === 'approved' || s === 'active';
  const isPending = s === 'pending';
  const isClosed = s === 'closed' || s === 'expired' || s === 'rejected' || s === 'declined';
  
  if (isOpen) return (
    <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-700 border-2 border-emerald-500/40 shadow-sm">
       {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
  
  if (isPending) return (
    <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-amber-50 text-amber-700 border-2 border-amber-400/40 shadow-sm">
       {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  if (isClosed) return (
    <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-rose-50 text-rose-700 border-2 border-rose-400/40 shadow-sm">
       {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  return (
    <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-50 text-slate-600 border-2 border-slate-300 shadow-sm">
       {status.charAt(0).toUpperCase() + status.slice(1)}
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
  const router = useRouter();
  const userRole = "recruiter";
  const basePath = `/dashboard/${userRole}`;
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'Active' | 'Pending' | 'Expired' | 'Featured'>('Active');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    toast("Delete this job listing?", {
      id: `confirm-delete-${id}`,
      duration: Infinity,
      description: "Applicants will no longer be able to see this post.",
      action: {
        label: "Delete",
        onClick: async () => {
          setDeletingId(id);
          try {
            const res = await dashboardServerFetch<any>(`recruiter/jobs/delete/${id}`, {
              method: "POST"
            });

            if (res?.status) {
              toast.success(res.message || "Job deleted successfully");
              router.refresh();
            } else {
              toast.error(res?.message || "Failed to delete job");
            }
          } catch (e: any) {
            toast.error(e.message || "An unexpected error occurred");
          } finally {
            setDeletingId(null);
          }
        }
      },
      actionButtonStyle: {
        backgroundColor: '#e11d48',
        color: 'white'
      },
      cancel: {
        label: "Keep",
        onClick: () => {}
      }
    });
  };
  
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
        className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors mb-2 group w-fit"
      >
        <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Overview
      </button>

      {/* Compact Header */}
      <div className="flex items-center justify-between gap-4 border-b pb-4 border-slate-100">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Job Inventory</h1>
          <p className="text-[12px] text-slate-400 font-medium">Review and control your <span className="text-indigo-600 font-semibold">{totalJobs}</span> job listings</p>
        </div>
        
        <Link href={`${basePath}/post-job`}>
           <Button size="sm" className="h-9 px-4 rounded-xl font-semibold text-[10px] shadow-lg shadow-indigo-600/10 whitespace-nowrap bg-indigo-600 hover:bg-indigo-700">
             <PlusCircle className="mr-1.5 w-3.5 h-3.5" />
             <span className="hidden xs:inline">Post New Job</span>
             <span className="xs:hidden">Post</span>
           </Button>
        </Link>
      </div>

      {/* Mini Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { 
            label: "Active Openings", 
            value: partitionedJobs.active.length, 
            icon: Briefcase, 
            subLabel: "Operational",
            bg: "bg-emerald-50", 
            text: "text-emerald-500",
            dotBg: "bg-emerald-500",
            dotText: "text-emerald-600"
          },
          { 
            label: "Pending Review", 
            value: partitionedJobs.pending.length, 
            icon: AlertCircle, 
            subLabel: "Awaiting",
            bg: "bg-amber-50", 
            text: "text-amber-500",
            dotBg: "bg-amber-500",
            dotText: "text-amber-600"
          },
          { 
            label: "Closed Jobs", 
            value: partitionedJobs.expired.length, 
            icon: Clock, 
            subLabel: "History",
            bg: "bg-slate-50", 
            text: "text-slate-400",
            dotBg: "bg-slate-300",
            dotText: "text-slate-500"
          },
          { 
            label: "Featured Jobs", 
            value: partitionedJobs.featured.length, 
            icon: TrendingUp, 
            subLabel: "Featured",
            bg: "bg-indigo-50", 
            text: "text-indigo-500",
            dotBg: "bg-indigo-500",
            dotText: "text-indigo-600"
          },
        ].map((s, i) => (
          <div key={i} className={cn(
            "bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-slate-200 transition-all cursor-default",
            i > 1 ? "hidden lg:flex flex-col" : "flex flex-col" 
          )}>
            <div className={cn(
              "absolute -top-4 -right-4 w-20 h-20 rounded-full transition-transform group-hover:scale-110 opacity-60",
              s.bg
            )} />
            <div className="absolute top-4 right-4 shrink-0 z-20">
               <s.icon className={cn("w-5 h-5", s.text)} />
            </div>
            
            <div className="relative z-10 space-y-1.5">
              <p className="text-[11px] font-medium text-slate-400">{s.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 leading-none">{s.value}</h3>
              <div className="flex items-center gap-1.5 pt-0.5">
                 <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", s.dotBg)} />
                 <span className={cn("text-[10px] font-bold tracking-tight", s.dotText)}>{s.subLabel}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
         <div className="flex-1 w-full md:max-w-xs relative scale-[0.98]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Find a listing..." 
              className="h-9 pl-10 border-slate-100 bg-slate-50/50 focus:bg-white rounded-xl text-xs font-medium focus:ring-1 focus:ring-indigo-500/10 placeholder:text-slate-400" 
            />
         </div>

         <div className="flex items-center gap-1 bg-slate-50/50 p-1 rounded-xl border border-slate-100 font-medium overflow-x-auto no-scrollbar max-w-full">
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
                    "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                    activeTab === tab.id 
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200" 
                    : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {tab.label} <span className="opacity-50 ml-0.5 text-[10px]">{tab.count}</span>
                </button>
            ))}
         </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 gap-4 pb-10">
         {filteredJobs.length > 0 ? filteredJobs.map((job) => {
            const isExpired = job.expires_at ? new Date(job.expires_at) < now : false;
            const isPending = job.status === 'pending';
            const isActive = (job.status === 'approved' || job.status === 'open') && !isExpired;
            
            return (
              <div key={job.id} className="bg-white rounded-2xl border border-slate-300 shadow-sm hover:shadow-lg transition-all p-4 md:p-5 group relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/[0.03] rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-125 duration-700" />
                 
                 <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                       <div className={cn(
                          "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border",
                          job.featured ? "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm" :
                          isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" :
                          isPending ? "bg-amber-50 text-amber-600 border-amber-100/50" :
                          "bg-slate-50 text-slate-400 border-slate-100 shadow-inner"
                       )}>
                          {job.featured ? <TrendingUp className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                       </div>
                     <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                           <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate max-w-[200px] sm:max-w-none tracking-tight">{job.title}</h3>
                           <div className="flex items-center gap-1.5">
                              <StatusBadge status={job.job_status} />
                              <StatusBadge status={job.status} />
                           </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5">
                           <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                             <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> {job.location}
                           </span>
                           <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                             <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Expires {job.expires_at ? new Date(job.expires_at).toLocaleDateString('en-GB') : 'N/A'}
                           </span>
                           <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                             <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" /> <span className="text-blue-600 font-bold">{job.applications_count ?? 0}</span> Applicants
                           </span>
                           <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                             <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" /> Posted {new Date(job.created_at).toLocaleDateString('en-GB')}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                     <Link href={`${basePath}/jobs/view/${job.id}`} className="flex-1 sm:flex-none">
                        <Button variant="outline" className="w-full h-8 px-3 rounded-xl text-xs font-bold text-emerald-600 border-emerald-100 hover:bg-emerald-50 whitespace-nowrap shadow-sm">
                           <Layout className="w-3 h-3 mr-1.5" /> View
                        </Button>
                     </Link>
                     <Link href={`${basePath}/jobs/edit/${job.id}`} className="flex-1 sm:flex-none">
                        <Button variant="outline" className="w-full h-8 px-3 rounded-xl text-xs font-bold text-indigo-600 border-indigo-100 hover:bg-indigo-50 whitespace-nowrap shadow-sm">
                           <Edit3 className="w-3 h-3 mr-1.5" /> Edit
                        </Button>
                     </Link>
                     <Button 
                       onClick={() => handleDelete(job.id)}
                       disabled={deletingId === job.id}
                       variant="ghost" 
                       className="h-8 px-2 rounded-xl text-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                     >
                        {deletingId === job.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                     </Button>
                  </div>
               </div>
            </div>
            );
          }) : (
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
