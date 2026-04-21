"use client";

import { useState } from "react";
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
  RefreshCw,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { cn } from "@/lib/utils";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
// import { formatDistanceToNow } from "date-fns";

interface Job {
  id: number;
  title: string;
  slug: string;
  location: string;
  job_type: string;
  job_status: string;
  status: string;
  school_name?: string;
  applicants_count?: number;
  views_count?: number;
  vacancies: number;
  salary_min: string;
  salary_max: string;
  created_at: string;
  expires_at: string;
  is_active: number;
  featured: number;
  featured_until?: string;
}

interface PaginatedJobs {
  data: Job[];
  current_page: number;
  last_page: number;
  total: number;
}

interface JobsClientProps {
  initialData?: {
    status: boolean;
    active_jobs?: PaginatedJobs;
    expired_jobs?: PaginatedJobs;
    closed_jobs?: PaginatedJobs;
    paused_jobs?: PaginatedJobs;
    drafts_jobs?: PaginatedJobs;
    total_applicants?: number;
    total_jobs?: number;
  };
}

export default function JobsClient({
  initialData,
  userRole = "employer"
}: JobsClientProps & { userRole?: string }) {
  const router = useRouter();
  const basePath = `/dashboard/${userRole}`;
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'paused' | 'closed' | 'drafts' | 'expired' | 'featured'>('all');
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const activeJobs: Job[] = initialData?.active_jobs?.data || [];
  const expiredJobs: Job[] = initialData?.expired_jobs?.data || [];
  const closedJobs: Job[] = initialData?.closed_jobs?.data || [];
  const pausedJobs: Job[] = initialData?.paused_jobs?.data || [];
  const draftsJobs: Job[] = initialData?.drafts_jobs?.data || [];

  const allJobs = [...activeJobs, ...pausedJobs, ...closedJobs, ...expiredJobs, ...draftsJobs].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const featuredJobs = allJobs.filter(j => j.featured === 1);

  const getFilteredJobs = () => {
    let source = allJobs;
    if (activeTab === 'active') source = activeJobs;
    else if (activeTab === 'expired') source = expiredJobs;
    else if (activeTab === 'featured') source = featuredJobs;

    return source.filter((job) =>
      job?.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      job?.location?.toLowerCase()?.includes(searchTerm.toLowerCase())
    );
  };

  const filteredJobs = getFilteredJobs();

  const handleAction = async (id: number, action: string) => {
    if (action === 'filled' && !confirm("Mark this job as filled? This will close the listing.")) return;
    setLoadingId(id);
    try {
      let endpoint = `employer/jobs/${action === 'delete' ? 'delete' : action}/${id}`;
      if (action === 'filled') {
        endpoint = `employer/jobs/${id}/filled`;
      } else if (action === 'republish') {
        endpoint = `employer/jobs/${id}/republish`;
      }
      const method = action === 'delete' ? "DELETE" : action === 'republish' ? "PUT" : "POST";
      const res = await dashboardServerFetch<any>(endpoint, { method });
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
    { label: "Active Jobs", value: activeJobs.length, icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
    { label: "Expired Jobs", value: expiredJobs.length, icon: Clock, bg: "bg-slate-50", text: "text-slate-400" },
    { label: "Featured Jobs", value: featuredJobs.length, icon: TrendingUp, bg: "bg-indigo-50", text: "text-indigo-600" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6 font-sans text-slate-800 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-xl font-semibold text-slate-900 ">Manage Job Posts</h1>
          <p className="text-[13px] font-medium text-slate-900">View and manage all your teaching job postings.</p>
        </div>

        <Link href={`${basePath}/post-job`}>
          <Button className="h-10 px-5 rounded-xl font-semibold text-xs bg-[#312E81] hover:bg-[#1E1B4B] shadow-sm transition-all flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className={cn("grid gap-3", stats.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 lg:grid-cols-4")}>
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
            { id: 'all', label: 'All', count: allJobs.length },
            { id: 'active', label: 'Active', count: activeJobs.length },
            { id: 'expired', label: 'Expired', count: expiredJobs.length },
            { id: 'featured', label: 'Featured', count: featuredJobs.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                        (job.job_status === 'expired' || new Date(job.expires_at) < new Date()) ? "bg-amber-50 text-amber-600" :
                        (job.job_status === 'active' || job.status === 'approved') ? "bg-emerald-50 text-emerald-600" :
                          job.job_status === 'closed' ? "bg-slate-50 text-slate-400" : "bg-amber-50 text-amber-600"
                      )}>
                        {(job.job_status === 'expired' || new Date(job.expires_at) < new Date()) ? "Expired" : (job.status || job.job_status)}
                      </span>
                      {job.featured === 1 && (
                        <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                          <TrendingUp className="w-2.5 h-2.5" /> Featured
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-900">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-900">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Expires {new Date(job.expires_at).toLocaleDateString('en-GB')}
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
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Link href={`${basePath}/jobs/view/${job.id}`}>
                    <Button variant="outline" className="h-9 px-3.5 rounded-xl text-[12px] font-semibold text-slate-600 bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-indigo-400" /> View
                    </Button>
                  </Link>

                  {!(job.job_status === 'expired' || new Date(job.expires_at) < new Date()) && (
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

                  {job.job_status === 'active' && (
                    <Button
                      onClick={() => handleAction(job.id, 'filled')}
                      disabled={loadingId === job.id}
                      variant="outline"
                      className="h-9 px-3.5 rounded-xl text-[12px] font-semibold text-emerald-500 bg-white border-emerald-50 hover:bg-emerald-50 hover:border-emerald-100 transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Filled
                    </Button>
                  )}
 
                  {(job.job_status === 'expired' || new Date(job.expires_at) < new Date()) && (
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
              <Button size="lg" className="h-11 px-7 rounded-xl font-semibold text-xs shadow-sm transition-all">
                Post a new job
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Pagination Section */}
      {(initialData?.active_jobs?.last_page || 0) > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8 border-t border-slate-50">
          <Button
            variant="outline"
            disabled={initialData?.active_jobs?.current_page === 1}
            onClick={() => router.push(`${basePath}/jobs?active_page=${(initialData?.active_jobs?.current_page || 1) - 1}`)}
            className="h-9 px-4 rounded-xl text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 disabled:opacity-50"
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: initialData?.active_jobs?.last_page || 0 }, (_, i) => i + 1).map((pg) => (
              <Button
                key={pg}
                onClick={() => router.push(`${basePath}/jobs?active_page=${pg}`)}
                className={cn(
                  "w-9 h-9 rounded-xl text-xs font-bold transition-all",
                  initialData?.active_jobs?.current_page === pg
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
            disabled={initialData?.active_jobs?.current_page === initialData?.active_jobs?.last_page}
            onClick={() => router.push(`${basePath}/jobs?active_page=${(initialData?.active_jobs?.current_page || 0) + 1}`)}
            className="h-9 px-4 rounded-xl text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
