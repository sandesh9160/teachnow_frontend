"use client";

import { useState, useMemo, useEffect } from "react";
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
  Users,
  RefreshCw,
  Star,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  admin_featured?: number;
  applicants_count?: number;
}

interface PaginatedJobs {
  data: Job[];
  total: number;
  current_page: number;
  last_page: number;
}

interface RecruiterJobsClientProps {
  initialData?: {
    status: boolean;
    active_jobs?: PaginatedJobs;
    expired_jobs?: PaginatedJobs;
    total_jobs?: number;
  };
}

export default function RecruiterJobsClient({ initialData }: RecruiterJobsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const userRole = "recruiter";
  const basePath = `/dashboard/${userRole}`;

  const [searchTerm, setSearchTerm] = useState(searchParams?.get('search') || "");
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'expired' | 'featured'>('all');
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const activeJobs = initialData?.active_jobs?.data || [];
  const expiredJobs = initialData?.expired_jobs?.data || [];
  
  const jobs = useMemo(() => {
    const seen = new Set<number>();
    return [...activeJobs, ...expiredJobs].filter(job => {
      if (seen.has(job.id)) return false;
      seen.add(job.id);
      return true;
    });
  }, [activeJobs, expiredJobs]);

  const totalJobs = initialData?.total_jobs || (initialData?.active_jobs?.total || 0) + (initialData?.expired_jobs?.total || 0);

  // Handle server-side search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== (searchParams?.get('search') || "")) {
        const params = new URLSearchParams(searchParams || "");
        if (searchTerm) {
          params.set('search', searchTerm);
        } else {
          params.delete('search');
        }
        params.set('active_page', '1'); // Reset to first page on new search
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, searchParams, router, pathname]);

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

  // For recruiter dashboard, search is now handled on the server
  // But we still filter locally if needed for the current page's tabs
  const filteredJobs = partitionedJobs[activeTab];

  const handleAction = async (id: number, action: string) => {
    const actionLabel = action === 'filled' ? 'mark this job as filled' : 
                       action === 'delete' ? 'permanently delete this job' : 
                       'republish this job';

    toast(`Are you sure you want to ${actionLabel}?`, {
      style: { borderLeft: '4px solid #ef4444' },
      action: {
        label: action === 'filled' ? 'Mark Filled' : action === 'delete' ? 'Delete Job' : 'Republish',
        onClick: async () => {
          console.log(`Executing recruiter job action: ${action} for ID: ${id}`);
          setLoadingId(id);
          try {
            let endpoint = `recruiter/jobs/${action === 'delete' ? 'delete' : action}/${id}`;
            if (action === 'filled') {
              endpoint = `recruiter/jobs/${id}/filled`;
            } else if (action === 'republish') {
              endpoint = `recruiter/jobs/${id}/republish`;
            }
            
            const method = action === 'delete' ? "DELETE" : action === 'republish' ? "PUT" : "POST";
            console.log(`Calling recruiter endpoint: ${endpoint} with method: ${method}`);
            const res = await dashboardServerFetch<any>(endpoint, { method });
            console.log("Recruiter job action response:", res);
            
            if (res?.status) {
              toast.success(res.message || `Job ${action} successful`, { style: { borderLeft: '4px solid #10b981' } });
              router.refresh();
            } else {
              toast.error(res?.message || "Action failed");
            }
          } catch (e) {
            toast.error("An error occurred");
          } finally {
            setLoadingId(null);
          }
        }
      },
      cancel: {
        label: 'Keep it',
        onClick: () => {}
      }
    });
  };

  const handleToggleFeatured = async (id: number) => {
    console.log(`Toggling recruiter featured status for job ID: ${id}`);
    setLoadingId(id);
    try {
      const endpoint = `recruiter/job/${id}/toggle-feature`;
      console.log(`Calling recruiter toggle-feature endpoint: ${endpoint}`);
      const res = await dashboardServerFetch<any>(endpoint, { method: "POST" });
      console.log("Recruiter toggle feature response:", res);
      
      if (res?.status) {
        toast.success(res.message || "Featured status updated", { style: { borderLeft: '4px solid #10b981' } });
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
    <div suppressHydrationWarning className="max-w-6xl mx-auto px-4 py-4 space-y-6 font-sans text-slate-800 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Manage Job Posts</h1>
          <p className="text-[13px] font-medium text-slate-600">You have posted <span className="text-indigo-600 font-bold">{totalJobs}</span> teaching jobs in total.</p>
        </div>
        
        <Link href={`${basePath}/post-job`}>
           <Button className="h-10 px-5 rounded-xl font-semibold text-xs bg-[#312E81] hover:bg-[#1E1B4B] shadow-sm transition-all flex items-center gap-2">
             <PlusCircle className="w-4 h-4" />
             Post New Job
           </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-sm">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner", s.bg, s.text)}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 leading-none mb-0.5">{s.value}</h3>
              <p className="text-[11px] font-semibold text-slate-600 truncate">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-50/50 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All', count: partitionedJobs.all.length },
            { id: 'active', label: 'Active', count: partitionedJobs.active.length },
            { id: 'expired', label: 'Expired', count: partitionedJobs.expired.length },
            { id: 'featured', label: 'Featured', count: partitionedJobs.featured.length },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              suppressHydrationWarning={true}
              className={cn(
                "px-4 py-1.5 rounded-xl text-[12.5px] font-semibold transition-all whitespace-nowrap",
                activeTab === tab.id 
                ? "bg-[#312E81] text-white shadow-sm" 
                : "text-slate-900 hover:bg-white/50"
              )}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your jobs..." 
            className="h-10 pl-10 bg-white border-slate-100 rounded-xl text-[12.5px] font-medium focus:ring-1 focus:ring-indigo-100 shadow-xs" 
          />
        </div>
      </div>

      {/* Job Cards List */}
      <div className="space-y-3">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden p-4 group transition-all hover:shadow-md hover:border-indigo-100/50">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left: Job Info */}
                <div className="flex-1 space-y-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[15px] font-semibold text-slate-900 group-hover:text-[#312E81] transition-colors">{job.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                          (job.expires_at && new Date(job.expires_at) < now) ? "bg-amber-50 text-amber-600" :
                          (job.status === 'approved' || job.status === 'open') ? "bg-emerald-50 text-emerald-600" :
                          job.status === 'rejected' ? "bg-rose-50 text-rose-600" :
                          "bg-amber-50 text-amber-600"
                        )}>
                          {(job.expires_at && new Date(job.expires_at) < now) ? "Expired" : (job.status || job.job_status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-900">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-900">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Expires {job.expires_at ? new Date(job.expires_at).toLocaleDateString('en-GB') : 'N/A'}
                    </span>
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-900">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" /> Posted {new Date(job.created_at).toLocaleDateString('en-GB')}
                    </span>
                    {job.featured === 1 && job.featured_until && (
                      <span className="flex items-center gap-1.5 text-[12px] font-semibold text-indigo-600">
                        <TrendingUp className="w-3.5 h-3.5" /> Featured Until {new Date(job.featured_until).toLocaleDateString('en-GB')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0">
                  <Link href={`${basePath}/jobs/view/${job.id}`}>
                    <Button variant="outline" className="h-9 px-3.5 rounded-xl text-[12px] font-semibold text-slate-600 bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-indigo-400" /> View
                    </Button>
                  </Link>

                  {!(job.expires_at && new Date(job.expires_at) < now) && (
                    <Link href={`${basePath}/jobs/view/${job.id}/applicants`}>
                      <Button variant="outline" className="h-9 px-3.5 rounded-xl text-[12px] font-semibold text-indigo-700 bg-indigo-50 border-indigo-100 hover:bg-indigo-100 transition-all flex items-center gap-1.5 shadow-xs">
                        <Users className="w-3.5 h-3.5" /> 
                        Applicants 
                        {job.applicants_count !== undefined && (
                          <span className="ml-1 bg-white text-indigo-600 px-1.5 py-0.5 rounded-md text-[10px] font-bold shadow-xs">
                            {job.applicants_count || 0}
                          </span>
                        )}
                      </Button>
                    </Link>
                  )}
                  
                  <Link href={`${basePath}/jobs/edit/${job.id}`}>
                    <Button variant="outline" className="h-9 px-3.5 rounded-xl text-[12px] font-semibold text-slate-600 bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-indigo-400" /> Edit
                    </Button>
                  </Link>

                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const isExpiredFeatured = job.featured === 1 && job.featured_until && new Date(job.featured_until) < now;
                      if (job.featured === 0 || isExpiredFeatured) handleToggleFeatured(job.id);
                    }}
                    disabled={loadingId === job.id || (job.featured === 1 && job.admin_featured !== 1) || (job.featured === 1 && job.admin_featured === 1 && (!job.featured_until || new Date(job.featured_until) >= now))}
                    className={cn(
                      "h-9 px-3.5 rounded-xl text-[12px] font-semibold transition-all flex items-center gap-1.5",
                      (job.featured === 1 && job.admin_featured === 1 && (!job.featured_until || new Date(job.featured_until) >= now))
                        ? "bg-indigo-50 text-indigo-600 border-indigo-100 cursor-default"
                        : (job.featured === 1 && job.admin_featured !== 1)
                          ? "bg-amber-50 text-amber-600 border-amber-100 cursor-default"
                          : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                    )}
                  >
                    {loadingId === job.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Star className={cn("w-3.5 h-3.5", (job.featured === 1 && job.admin_featured === 1 && (!job.featured_until || new Date(job.featured_until) >= now)) ? "fill-amber-500 text-amber-500" : "text-slate-400")} />
                    )} 
                    {(job.featured === 1 && job.admin_featured === 1 && (!job.featured_until || new Date(job.featured_until) >= now)) 
                      ? "Featured" 
                      : (job.featured === 1 && job.admin_featured !== 1) 
                        ? "Awaiting" 
                        : "Feature"}
                  </Button>

                  {(job.expires_at && new Date(job.expires_at) < now) && (
                    <Button
                      onClick={() => handleAction(job.id, 'republish')}
                      disabled={loadingId === job.id}
                      variant="outline"
                      className="h-9 px-3.5 rounded-xl text-[12px] font-semibold text-indigo-600 bg-white border-indigo-50 hover:bg-indigo-50 hover:border-indigo-100 transition-all flex items-center gap-1.5"
                    >
                      {loadingId === job.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} 
                      Republish Job
                    </Button>
                  )}

                  {/* Delete button removed as per user request */}
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-16 flex flex-col items-center justify-center text-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-100 border border-slate-50">
              <Briefcase className="w-10 h-10" />
            </div>
            <div className="space-y-1.5">
              <p className="text-lg font-semibold text-slate-900">No jobs found</p>
              <p className="text-[13px] text-slate-400 font-medium">Try adjusting your filters or post a new listing.</p>
            </div>
            <Link href={`${basePath}/post-job`}>
              <Button className="h-11 px-7 rounded-xl font-semibold text-xs shadow-sm transition-all text-white bg-[#312E81]">
                Post a new job
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Pagination Section */}
      {(() => {
        const pagination = activeTab === 'expired' ? initialData?.expired_jobs : initialData?.active_jobs;
        const currentPage = pagination?.current_page || 1;
        const lastPage = pagination?.last_page || 0;

        if (lastPage <= 1) return null;

        const handlePageChange = (pg: number) => {
          const params = new URLSearchParams(searchParams || "");
          params.set('active_page', pg.toString());
          if (searchTerm) params.set('search', searchTerm);
          router.push(`${pathname}?${params.toString()}`);
        };

        return (
          <div className="flex items-center justify-center gap-2 pt-8 border-t border-slate-50">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="h-9 px-4 rounded-xl text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: lastPage }, (_, i) => i + 1).map((pg) => (
                <Button
                  key={pg}
                  onClick={() => handlePageChange(pg)}
                  className={cn(
                    "w-9 h-9 rounded-xl text-xs font-bold transition-all",
                    currentPage === pg
                      ? "bg-[#312E81] text-white shadow-md"
                      : "bg-white text-slate-600 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30"
                  )}
                >
                  {pg}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              disabled={currentPage === lastPage}
              onClick={() => handlePageChange(currentPage + 1)}
              className="h-9 px-4 rounded-xl text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        );
      })()}
    </div>
  );
}
