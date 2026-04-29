"use client";

import { Briefcase, MapPin, Calendar, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Buttons/Buttons";

interface Job {
  id: number;
  title: string;
  location: string;
  job_status: string;
  created_at: string;
  expires_at: string;
  applicants_count?: number;
  user?: {
    id: number;
    name: string;
    email: string;
  }
}

interface RecruiterJobsClientProps {
  initialData: {
    status: boolean;
    data?: {
      jobs?: {
        data: Job[];
        total: number;
        current_page: number;
        last_page: number;
      };
      recruiter?: {
        id: number;
        name: string;
        email: string;
      };
    };
  };
  // recruiterId: string;
}

export default function RecruiterJobsClient({ initialData }: RecruiterJobsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  console.log("[RecruiterJobsClient] Initializing with data:", initialData);
  const jobsData = initialData?.data?.jobs;
  const jobs = Array.isArray(initialData?.data) 
    ? initialData.data 
    : (jobsData?.data || []);
  const recruiter = initialData?.data?.recruiter;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams || "");
    params.set('active_page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Recruiter Info Card - Compact */}
      {recruiter && (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-lg shadow-inner shrink-0">
              {recruiter.name[0]}
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold text-slate-900 leading-tight truncate">{recruiter.name}</h2>
              <p className="text-[11px] font-medium text-slate-400 truncate">{recruiter.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4 py-2 bg-slate-50/50 rounded-xl border border-slate-100">
            <div className="text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Postings</p>
              <p className="text-sm font-bold text-slate-900">{jobs.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Jobs List - Compact */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Posted Jobs</h3>
        </div>
        
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl border border-slate-100 shadow-xs p-3.5 group transition-all hover:shadow-sm hover:border-indigo-100/50">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1.5">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{job.title}</h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter",
                      job.job_status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {job.job_status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                      <MapPin className="w-3 h-3 text-indigo-400" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                      <Calendar className="w-3 h-3 text-indigo-400" /> Expires: {job.expires_at && !isNaN(new Date(job.expires_at).getTime()) ? new Date(job.expires_at).toLocaleDateString('en-GB') : "Not Specified"}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                      <Clock className="w-3 h-3 text-indigo-400" /> Posted: {job.created_at && !isNaN(new Date(job.created_at).getTime()) ? new Date(job.created_at).toLocaleDateString('en-GB') : "Recently"}
                    </span>
                  </div>
                </div>

                <Link href={`/dashboard/employer/jobs/view/${job.id}`}>
                  <button className="h-8 px-4 rounded-lg text-[11px] font-bold text-indigo-600 bg-white border border-indigo-50 hover:bg-indigo-50 hover:border-indigo-100 transition-all flex items-center gap-1.5 shrink-0">
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-200">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-slate-900">No jobs posted yet</p>
              <p className="text-[11px] text-slate-400 font-medium">No active listings from this member.</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Section - Compact */}
      {(jobsData?.last_page || 0) > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 border-t border-slate-50">
          <Button
            variant="outline"
            size="sm"
            disabled={jobsData?.current_page === 1}
            onClick={() => handlePageChange((jobsData?.current_page || 1) - 1)}
            className="h-8 px-3 rounded-lg text-[11px] font-bold text-slate-500 border-slate-100 hover:bg-slate-50 disabled:opacity-50"
          >
            Prev
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: jobsData?.last_page || 0 }, (_, i) => i + 1).map((pg) => (
              <Button
                key={pg}
                size="sm"
                onClick={() => handlePageChange(pg)}
                className={cn(
                  "w-8 h-8 rounded-lg text-[11px] font-bold transition-all",
                  jobsData?.current_page === pg
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30"
                )}
              >
                {pg}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={jobsData?.current_page === jobsData?.last_page}
            onClick={() => handlePageChange((jobsData?.current_page || 0) + 1)}
            className="h-8 px-3 rounded-lg text-[11px] font-bold text-slate-500 border-slate-100 hover:bg-slate-50 disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
