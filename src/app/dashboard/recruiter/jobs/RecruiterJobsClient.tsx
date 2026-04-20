"use client";

import { useState, useMemo } from "react";
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Edit3, 
  Search, 
  PlusCircle, 
  Clock,
  TrendingUp,
  Eye,
  CheckCircle2,
  Pause,
  Play,
  XCircle,
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
  featured_until?: string;
  applications_count?: number;
}

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
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'expired' | 'featured'>('all');
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const now = new Date();

  // Partition jobs
  const partitionedJobs = useMemo(() => {
    return {
      all: jobs,
      active: jobs.filter(j => (j.status === 'approved' || j.status === 'open') && (j.expires_at ? new Date(j.expires_at) >= now : true)),
      expired: jobs.filter(j => j.expires_at ? new Date(j.expires_at) < now : false),
      featured: jobs.filter(j => j.featured === 1)
    };
  }, [jobs, now]);

  const getFilteredJobs = () => {
    let source = partitionedJobs[activeTab];
    return source.filter((job) => 
      job?.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      job?.location?.toLowerCase()?.includes(searchTerm.toLowerCase())
    );
  };

  const filteredJobs = getFilteredJobs();

  const handleAction = async (id: number, action: string) => {
    setLoadingId(id);
    try {
      const endpoint = `recruiter/jobs/${action === 'delete' ? 'delete' : action}/${id}`;
      const res = await dashboardServerFetch<any>(endpoint, { method: "POST" });
      if (res?.status) {
        toast.success(res.message || `Job ${action} successful`);
        router.refresh();
      } else {
        toast.error(res?.message || "Action failed");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setLoadingId(null);
    }
  };

  const stats = [
    { label: "Active Jobs", value: partitionedJobs.active.length, icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
    { label: "Expired Jobs", value: partitionedJobs.expired.length, icon: Clock, bg: "bg-slate-50", text: "text-slate-400" },
    { label: "Featured Jobs", value: partitionedJobs.featured.length, icon: TrendingUp, bg: "bg-indigo-50", text: "text-indigo-600" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6 font-sans text-black pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-xl font-medium text-black tracking-tight">Manage Job Posts</h1>
          <p className="text-[13px] font-medium text-black/40">You have posted <span className="text-indigo-600 font-bold">{totalJobs}</span> teaching jobs in total.</p>
        </div>
        
        <Link href={`${basePath}/post-job`}>
           <Button className="h-10 px-5 rounded-xl font-medium text-xs bg-[#312E81] hover:bg-[#1E1B4B] shadow-sm transition-all flex items-center gap-2 text-white">
             <PlusCircle className="w-4 h-4" />
             Post New Job
           </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:border-slate-200">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", s.bg, s.text)}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-medium text-black leading-none mb-1">{s.value}</h3>
              <p className="text-[11px] font-medium text-black opacity-40">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-[18px] border border-slate-100 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All', count: partitionedJobs.all.length },
            { id: 'active', label: 'Active', count: partitionedJobs.active.length },
            { id: 'expired', label: 'Expired', count: partitionedJobs.expired.length },
            { id: 'featured', label: 'Featured', count: partitionedJobs.featured.length },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-5 py-1.5 rounded-[14px] text-[12.5px] font-medium transition-all whitespace-nowrap",
                activeTab === tab.id 
                ? "bg-[#312E81] text-white shadow-md shadow-indigo-100" 
                : "text-black opacity-40 hover:opacity-100 hover:bg-white"
              )}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your jobs..." 
            className="h-10 pl-10 bg-white border-slate-100 rounded-xl text-[12.5px] font-medium focus:ring-2 focus:ring-indigo-100 shadow-sm" 
          />
        </div>
      </div>

      {/* Job Cards List */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden p-5 group transition-all hover:border-indigo-100/30">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Left: Job Info */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-[16px] font-medium text-black group-hover:text-[#312E81] transition-colors">{job.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-medium border",
                          (job.status === 'approved' || job.status === 'open') ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          job.status === 'rejected' ? "bg-rose-50 text-rose-600 border-rose-100" :
                          "bg-amber-50 text-amber-600 border-amber-100"
                        )}>
                          {job.status}
                        </span>
                        {job.featured === 1 && (
                          <span className="bg-[#4F46E5] text-white px-2.5 py-0.5 rounded-[6px] text-[10px] font-medium flex items-center gap-1.5 shadow-sm">
                            <TrendingUp className="w-3 h-3" /> Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <span className="flex items-center gap-1.5 text-[12px] font-medium text-black opacity-60">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1.5 text-[12px] font-medium text-black opacity-60">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Expires {job.expires_at ? new Date(job.expires_at).toLocaleDateString('en-GB') : 'N/A'}
                    </span>
                    <span className="flex items-center gap-1.5 text-[12px] font-medium text-black opacity-60">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" /> Posted {new Date(job.created_at).toLocaleDateString('en-GB')}
                    </span>
                    {job.featured === 1 && job.featured_until && (
                      <span className="flex items-center gap-1.5 text-[12px] font-medium text-indigo-600">
                        <TrendingUp className="w-3.5 h-3.5" /> Featured Until {new Date(job.featured_until).toLocaleDateString('en-GB')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0 pt-4 lg:pt-0 border-t lg:border-none border-slate-50">
                  <Link href={`${basePath}/jobs/view/${job.id}`}>
                    <Button variant="outline" className="h-9 px-4 rounded-xl text-[11px] font-medium text-black/70 border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-indigo-400" /> View
                    </Button>
                  </Link>
                  
                  <Link href={`${basePath}/jobs/edit/${job.id}`}>
                    <Button variant="outline" className="h-9 px-4 rounded-xl text-[11px] font-medium text-black/70 border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4 text-indigo-400" /> Edit
                    </Button>
                  </Link>

                  {(job.job_status === 'active' || job.status === 'approved') ? (
                    <Button 
                      onClick={() => handleAction(job.id, 'pause')}
                      disabled={loadingId === job.id}
                      variant="outline" 
                      className="h-9 px-4 rounded-xl text-[11px] font-medium text-black/70 border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1.5"
                    >
                      <Pause className="w-3.5 h-3.5 text-indigo-400" /> Pause
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleAction(job.id, 'resume')}
                      disabled={loadingId === job.id}
                      variant="outline" 
                      className="h-9 px-4 rounded-xl text-[11px] font-medium text-black/70 border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 text-indigo-400" /> Resume
                    </Button>
                  )}

                  <Button 
                    onClick={() => handleAction(job.id, 'close')}
                    disabled={loadingId === job.id}
                    variant="outline" 
                    className="h-9 px-4 rounded-xl text-[11px] font-medium text-rose-500 border-rose-50 bg-rose-50/5 hover:bg-rose-50 hover:border-rose-100 transition-all flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Close
                  </Button>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[32px] border border-dashed border-slate-200 py-16 flex flex-col items-center justify-center text-center gap-5 shadow-sm">
            <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200">
              <Briefcase className="w-10 h-10" />
            </div>
            <div className="space-y-1.5">
              <p className="text-lg font-medium text-black">No jobs found</p>
              <p className="text-[13px] text-black/40 font-medium px-4">Try adjusting your filters or post a new listing.</p>
            </div>
            <Link href={`${basePath}/post-job`}>
              <Button className="h-11 px-7 rounded-xl font-medium text-xs bg-[#312E81] text-white transition-all shadow-md shadow-indigo-100">
                Post new job
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
