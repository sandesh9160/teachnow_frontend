"use client";

import { useEffect, useState } from "react";
import { 
  Zap, 
  // Clock, 
  ArrowLeft, 
  Loader2, 
  Briefcase, 
  Star, 
  MapPin, 
  Calendar,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { Button } from "@/shared/ui/Buttons/Buttons";
// import { cn } from "@/lib/utils";

interface UsageData {
  subscription: {
     id: number;
     plan_name: string;
     starts_at: string;
     expires_at: string;
  };
  summary: {
     total_job_credits: number;
     used_job_credits: number;
     remaining_job_credits: number;
     total_feature_credits: number;
     used_feature_credits: number;
     remaining_feature_credits: number;
  };
  jobs: {
     data: Array<{
        job_id: number;
        title: string;
        location: string;
        created_by: string;
        created_at: string;
     }>;
     total: number;
  };
  featured_jobs: {
     data: Array<{
        job_id: number;
        title: string;
        location: string;
        featured_by: string;
        featured_at: string;
     }>;
     total: number;
  };
}

export default function UsageClient({ id }: { id: string }) {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        setLoading(true);
        const res = await dashboardServerFetch<{ status: boolean, data: UsageData }>(`employer/subscription/${id}/usage`);
        if (res.status) {
          setData(res.data);
        } else {
          setError("Failed to load usage data");
        }
      } catch (err) {
        setError("Error fetching usage data");
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500">Loading consumption records...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
           <Zap className="w-8 h-8" />
        </div>
        <div className="text-center">
           <h3 className="text-lg font-bold text-slate-900">Unable to load usage</h3>
           <p className="text-sm text-slate-500">{error || "Data not found"}</p>
        </div>
        <Link href="/dashboard/employer">
           <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
           </Button>
        </Link>
      </div>
    );
  }

   return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Link href="/dashboard/employer" className="hover:text-indigo-600 transition-colors text-[10px] font-semibold uppercase tracking-wider">Dashboard</Link>
            <ChevronRight className="w-2.5 h-2.5" />
            <Link href="/dashboard/employer/purchase-history" className="hover:text-indigo-600 transition-colors text-[10px] font-semibold uppercase tracking-wider">Billing</Link>
            <ChevronRight className="w-2.5 h-2.5" />
            <span className="text-indigo-600 font-semibold text-[10px] uppercase tracking-wider">Usage</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            {data.subscription.plan_name} Pack Consumption
          </h1>
          <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {new Date(data.subscription.starts_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – {new Date(data.subscription.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        
        <Link href="/dashboard/employer/purchase-history">
          <Button variant="outline" className="h-9 px-5 rounded-lg text-xs font-semibold border-indigo-100 text-indigo-600 hover:bg-indigo-50">
            Upgrade Plan
          </Button>
        </Link>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Job Post Credits</h3>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Active Pack</span>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-semibold text-slate-900 tracking-tight">{data.summary.used_job_credits}</p>
                <p className="text-[11px] font-medium text-slate-400 mt-1">
                   Used of {data.summary.total_job_credits} allocated
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-indigo-600 tracking-tight">{data.summary.remaining_job_credits}</p>
                <p className="text-[9px] font-semibold text-indigo-400 uppercase mt-0.5">Remaining</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Star className="w-4 h-4" />
                </div>
                <h3 className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Featured Credits</h3>
              </div>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-semibold text-indigo-600 tracking-tight">{data.summary.used_feature_credits}</p>
                <p className="text-[11px] font-medium text-indigo-400/70 mt-1">
                   Used of {data.summary.total_feature_credits} allocated
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-emerald-600 tracking-tight">{data.summary.remaining_feature_credits}</p>
                <p className="text-[9px] font-semibold text-emerald-500 uppercase mt-0.5">Remaining</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consumption Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Job Posts Consumption Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-slate-800">Job Posting History</h3>
            <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200/50">{data.jobs.total} logs</span>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-50">
              {data.jobs.data.length > 0 ? (
                data.jobs.data.map((job, idx) => (
                  <div key={`${job.job_id}-${idx}`} className="p-4 hover:bg-slate-50/50 transition-all flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-slate-900 truncate">{job.title}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-[10px] font-semibold text-slate-400 px-2 py-1 bg-slate-50 rounded border border-slate-100">
                      1 Credit
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-slate-300">
                  <Briefcase className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-xs font-medium">No records found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Featured Placement Consumption Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-indigo-900">Featured Placement History</h3>
            <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100/50">{data.featured_jobs.total} logs</span>
          </div>
          <div className="bg-white rounded-2xl border border-indigo-100/30 shadow-sm overflow-hidden">
            <div className="divide-y divide-indigo-50/30">
              {data.featured_jobs.data.length > 0 ? (
                data.featured_jobs.data.map((job, idx) => (
                  <div key={`${job.job_id}-feat-${idx}`} className="p-4 hover:bg-indigo-50/20 transition-all flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                      <Star className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-indigo-900 truncate">{job.title}</p>
                      <div className="flex items-center gap-3 text-[10px] text-indigo-400 font-medium">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(job.featured_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-[10px] font-semibold text-indigo-500 px-2 py-1 bg-indigo-50 rounded border border-indigo-100">
                      1 Credit
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-slate-300">
                  <Star className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-xs font-medium">No records found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
