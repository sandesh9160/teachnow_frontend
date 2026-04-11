"use client";

import { useEffect, useState } from "react";
import { useApplications } from "@/hooks/useApplications";
import {
  Loader2,
  Briefcase,
  Building2,
  Trash2,
  MapPin
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
// import { Button } from "@/shared/ui/Buttons/Buttons";
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
    toast("Withdraw this application?", {
      action: {
        label: "Withdraw",
        onClick: async () => {
          try {
            await withdrawApplication(applicationId);
            toast.success("Application withdrawn.");
            setApplications((prev) => prev.filter((a) => a.id !== applicationId));
          } catch (error) {
            toast.error("Failed to withdraw application.");
          }
        }
      }
    });
  };

  const getStatusStyles = (status: string) => {
    const s = status?.toLowerCase();
    // Green theme for positive states (Accepted, Hired, Shortlisted)
    if (s === 'accepted' || s === 'hired') return "bg-emerald-50 text-emerald-700 border-2 border-emerald-500/40";
    if (s === 'shortlisted') return "bg-emerald-50 text-emerald-700 border-2 border-emerald-400/50";

    // Rose theme for negative states (Rejected)
    if (s === 'rejected' || s === 'declined') return "bg-rose-50 text-rose-700 border-2 border-rose-400/40";

    // Slate for neutral (Pending)
    return "bg-slate-50 text-slate-600 border-2 border-slate-300";
  };

  const stats = {
    total: applications.length,
    shortlisted: applications.filter(a => a.status?.toLowerCase() === 'shortlisted').length,
    rejected: applications.filter(a => a.status?.toLowerCase() === 'rejected' || a.status?.toLowerCase() === 'declined').length,
    applied: applications.filter(a => a.status?.toLowerCase() === 'applied' || !a.status).length
  };

  const [showAll, setShowAll] = useState(false);
  const mobileLimit = 3;

  // For mobile specifically, we can use a separate variable or logic
  const mobileApps = showAll ? applications : applications.slice(0, mobileLimit);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 px-5 md:px-10 mt-6 lg:mt-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-black tracking-tight">My Applications</h1>
          <p className="text-[12px] font-semibold text-indigo-600">You have {applications.length} active applications</p>
        </div>
        <Link href="/jobs">
          <button className="h-10 px-6 rounded-xl border border-slate-300 bg-white text-black text-xs font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
            Find more jobs
          </button>
        </Link>
      </div>

      {/* Stats row - Compact & Vibrant */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[
          { label: 'Total jobs', value: stats.total, color: 'from-blue-600 to-indigo-700', bg: 'bg-indigo-50/40' },
          { label: 'Shortlisted', value: stats.shortlisted, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50/40' },
          { label: 'Rejected', value: stats.rejected, color: 'from-rose-500 to-orange-600', bg: 'bg-rose-50/40' },
          { label: 'Pending', value: stats.applied, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50/40' }
        ].map((s, idx) => (
          <div key={idx} className={`border border-slate-300 rounded-2xl p-5 shadow-sm relative overflow-hidden group transition-all hover:shadow-md ${s.bg}`}>
            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${s.color} opacity-5 rounded-full -mr-8 -mt-8`} />
            <span className={`text-2xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent leading-none`}>{s.value}</span>
            <span className="block text-[11px] font-bold text-black mt-1">{s.label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 bg-white rounded-2xl border border-slate-300 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-200 mb-4" />
          <p className="text-[11px] font-bold text-black">Loading your applications...</p>
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-10">
          {/* Mobile List View */}
          <div className="md:hidden space-y-4">
            {mobileApps.map((app) => (
              <div key={app.id} className="bg-white border border-slate-300 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/[0.03] rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-125 duration-700" />
                <div className="relative z-10 flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 shrink-0 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-2 shadow-sm">
                        {app.job?.employer?.company_logo ? (
                          <img src={normalizeMediaUrl(app.job.employer.company_logo)} alt="" className="h-full w-full object-contain" />
                        ) : (
                          <Building2 className="w-6 h-6 text-indigo-200" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-black line-clamp-1">{app.job?.title || "Job Title"}</h3>
                        <p className="text-[11px] font-bold text-indigo-700 mt-1 line-clamp-1">{app.job?.employer?.company_name || app.company_name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black border ${getStatusStyles(app.status)} shadow-sm`}>
                      {app.status || "Applied"}
                    </span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-[10px] font-bold text-black">{app.job?.location || "Location"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200 pt-5 mt-1">
                    <span className="text-[10px] font-bold text-slate-700">Applied on {new Date(app.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <div className="flex items-center gap-3">
                      <Link href={`/dashboard/jobseeker/applied-jobs/${app.id}`}>
                        <button className="h-9 px-5 rounded-xl text-[10px] font-bold bg-white border border-slate-300 text-black hover:bg-slate-50">Details</button>
                      </Link>
                      <button onClick={() => handleWithdraw(app.id)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-rose-50 border border-rose-200 text-rose-600 shadow-sm hover:bg-rose-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {applications.length > mobileLimit && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full h-12 bg-white border border-slate-300 rounded-2xl text-[11px] font-bold text-black hover:bg-slate-50 shadow-sm transition-all"
              >
                {showAll ? "Show less" : `View more (+${applications.length - mobileLimit})`}
              </button>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-sm mt-8">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-bold text-black">
                  <th className="px-8 py-5">School / Company</th>
                  <th className="px-6 py-5">Job title</th>
                  <th className="px-6 py-5 text-center">Status</th>
                  <th className="px-6 py-5 text-center">Applied on</th>
                  <th className="px-8 py-5 text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="group hover:bg-indigo-50/10 transition-colors border-b border-slate-50 last:border-0">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 shrink-0 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-2 shadow-sm group-hover:shadow transition-all group-hover:border-indigo-200">
                          {app.job?.employer?.company_logo ? (
                            <img src={normalizeMediaUrl(app.job.employer.company_logo)} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <Building2 className="w-5.5 h-5.5 text-indigo-400" />
                          )}
                        </div>
                        <span className="text-[13px] font-bold text-black truncate max-w-[200px]">{app.job?.employer?.company_name || app.company_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <h3 className="text-[13px] font-black text-black line-clamp-1">{app.job?.title || "Role"}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3 h-3 text-indigo-500" />
                        <p className="text-[10px] font-bold text-slate-700">{app.job?.location || "Location not specified"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center px-3.5 py-1.5 rounded-lg text-[10px] font-black border shadow-sm ${getStatusStyles(app.status)}`}>
                        {app.status || "Applied"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center text-[11px] text-black font-bold tracking-tight">
                      {new Date(app.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/dashboard/jobseeker/applied-jobs/${app.id}`}>
                          <button className="h-9 px-5 rounded-xl text-[11px] font-bold text-indigo-700 bg-white border border-slate-300 hover:bg-indigo-700 hover:text-white hover:border-indigo-700 transition-all active:scale-[0.98] shadow-sm">View details</button>
                        </Link>
                        <button onClick={() => handleWithdraw(app.id)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-2xl border border-slate-300 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full -ml-16 -mt-16" />
          <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-slate-100">
            <Briefcase className="w-10 h-10 text-slate-400" />
          </div>
          <p className="text-black font-bold text-xl mb-2">No applications yet</p>
          <p className="text-slate-800 text-xs max-w-xs mx-auto mb-10 font-bold leading-relaxed">You haven't applied to any jobs yet. Start searching to find your next opportunity!</p>
          <Link href="/jobs">
            <button className="px-10 h-12 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95">Browse jobs</button>
          </Link>
        </div>
      )}
    </div>
  );
}
