"use client";

import { useEffect, useState } from "react";
import { useApplications } from "@/hooks/useApplications";
import {
  Loader2,
  MapPin,
  Clock,
  Briefcase,
  Building2,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { normalizeMediaUrl } from "@/services/api/client";

export default function AppliedJobsPage() {
  const { getApplications, withdrawApplication } = useApplications();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const data = await getApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [getApplications]);

  const handleWithdraw = async (applicationId: string | number) => {
    if (!confirm("Are you sure you want to withdraw this application?")) return;
    try {
      await withdrawApplication(applicationId);
      toast.success("Application withdrawn.");
      setApplications((prev) => prev.filter((a) => a.id !== applicationId));
    } catch (error) {
      toast.error("Failed to withdraw application.");
    }
  };

  const getStatusStyles = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'accepted' || s === 'hired') return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (s === 'rejected' || s === 'declined') return "bg-rose-50 text-rose-600 border-rose-100";
    if (s === 'shortlisted') return "bg-indigo-50 text-indigo-600 border-indigo-100";
    return "bg-blue-50 text-blue-600 border-blue-100";
  };

  const stats = {
    total: applications.length,
    shortlisted: applications.filter(a => a.status?.toLowerCase() === 'shortlisted').length,
    rejected: applications.filter(a => a.status?.toLowerCase() === 'rejected' || a.status?.toLowerCase() === 'declined').length,
    applied: applications.filter(a => a.status?.toLowerCase() === 'applied' || !a.status).length
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 md:px-0 mt-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Applied Jobs</h1>
        <Link href="/jobs">
          <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 font-semibold h-10 px-6 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
            Browse More Jobs
          </Button>
        </Link>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, textColor: 'text-primary' },
          { label: 'Shortlisted', value: stats.shortlisted, textColor: 'text-indigo-600' },
          { label: 'Rejected', value: stats.rejected, textColor: 'text-rose-600' },
          { label: 'Applied', value: stats.applied, textColor: 'text-emerald-600' }
        ].map((s, idx) => (
          <div key={idx} className="flex flex-col bg-white border border-slate-100 rounded-xl min-h-[85px] items-center justify-center transition-all duration-300">
            <span className={`text-2xl font-bold ${s.textColor} leading-none tracking-tight`}>{s.value}</span>
            <span className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2`}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="border-b border-slate-100 pb-4" />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary/10" />
        </div>
      ) : applications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {applications.map((app) => (
            <div key={app.id} className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-primary/20 hover:-translate-y-1 transition-all duration-300">
              {/* Header */}
              <div className="p-4 flex items-center justify-between border-b border-slate-50 bg-primary/5">
                <div className="h-10 w-10 border border-primary/10 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center p-1.5 group-hover:border-primary/20 transition-colors">
                  {app.job?.employer?.company_logo ? (
                    <img
                      src={normalizeMediaUrl(app.job.employer.company_logo)}
                      alt={app.job.employer.company_name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Building2 className="w-5 h-5 text-slate-300 group-hover:text-primary/40 transition-colors" />
                  )}
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${getStatusStyles(app.status)}`}>
                  {app.status || "Pending"}
                </span>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 space-y-1.5">
                <h3 className="text-[15px] font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
                  {app.job?.title || "Position Title"}
                </h3>
                <p className="text-slate-500 text-xs font-semibold">
                  {app.job?.employer?.company_name || app.company_name}
                </p>
                <div className="flex flex-wrap gap-y-1 gap-x-4 pt-3">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 capitalize">
                    <MapPin className="w-3.5 h-3.5 text-slate-300" />
                    {app.job?.location || "Remote"}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                    {new Date(app.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-slate-50 flex items-center gap-2 bg-slate-50/10">
                <Link href={`/jobs/${app.job?.slug || app.job_id}`} className="flex-1">
                  <button className="w-full h-9 rounded-lg text-[11px] font-bold bg-primary text-white hover:bg-secondary transition-all">
                    View Details
                  </button>
                </Link>
                <button
                  onClick={() => handleWithdraw(app.id)}
                  className="h-9 w-9 border border-rose-100 rounded-lg bg-white flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                  title="Withdraw Application"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500 font-bold text-lg mb-2">No applications found</p>
          <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8 font-medium">You haven't applied to any roles yet. Start exploring or building your resume.</p>
          <Link href="/jobs">
            <Button variant="default" className="rounded-xl px-10 h-11 font-bold">Explore Jobs</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
