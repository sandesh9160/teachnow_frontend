"use client";

import { useEffect, useState } from "react";
import { useApplications } from "@/hooks/useApplications";
import {
  Loader2,
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
    const displayedApps = showAll ? applications : applications.slice(0, applications.length); // Default to all on desktop
    
    // For mobile specifically, we can use a separate variable or logic
    const mobileApps = showAll ? applications : applications.slice(0, mobileLimit);

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 md:px-0 mt-4">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Applied Jobs</h1>
                <Link href="/jobs">
                    <Button variant="outline" className="rounded-lg border-slate-200 text-slate-600 font-bold h-9 px-4 text-xs hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                        Browse More
                    </Button>
                </Link>
            </div>

            {/* Stats row removed or kept? Keep but very compact */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total', value: stats.total, color: 'from-blue-500 to-indigo-600' },
                    { label: 'Shortlisted', value: stats.shortlisted, color: 'from-indigo-500 to-purple-600' },
                    { label: 'Rejected', value: stats.rejected, color: 'from-rose-500 to-orange-600' },
                    { label: 'Active', value: stats.applied, color: 'from-emerald-500 to-teal-600' }
                ].map((s, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                        <span className={`text-lg font-black bg-linear-to-r ${s.color} bg-clip-text text-transparent leading-none`}>{s.value}</span>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-1">{s.label}</span>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary/10" />
                </div>
            ) : applications.length > 0 ? (
                <div className="space-y-4">
                    {/* Mobile List View - Visible only on mobile */}
                    <div className="md:hidden space-y-3">
                        {mobileApps.map((app) => (
                            <div key={app.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex gap-3">
                                        <div className="h-10 w-10 shrink-0 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden flex items-center justify-center p-1">
                                            {app.job?.employer?.company_logo ? (
                                                <img src={normalizeMediaUrl(app.job.employer.company_logo)} alt="" className="h-full w-full object-contain" />
                                            ) : (
                                                <Building2 className="w-5 h-5 text-slate-200" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{app.job?.title || "Role"}</h3>
                                            <p className="text-[11px] font-medium text-slate-500">{app.job?.employer?.company_name || app.company_name}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${getStatusStyles(app.status)}`}>
                                        {app.status || "Applied"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                                    <span className="text-[10px] text-slate-400">Applied {new Date(app.created_at).toLocaleDateString()}</span>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/jobs/${app.job?.slug || app.job_id}`}>
                                            <button className="h-7 px-3 rounded-lg text-[10px] font-bold text-primary border border-primary/20">Details</button>
                                        </Link>
                                        <button onClick={() => handleWithdraw(app.id)} className="h-7 w-7 flex items-center justify-center rounded-lg border border-rose-100 text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {applications.length > mobileLimit && (
                            <button 
                                onClick={() => setShowAll(!showAll)}
                                className="w-full py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50"
                            >
                                {showAll ? "Show Less" : `View More (+${applications.length - mobileLimit})`}
                            </button>
                        )}
                    </div>

                    {/* Desktop Table View - Hidden on mobile */}
                    <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse table-auto">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400">
                                    <th className="px-6 py-3 pl-8">Institution</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Location</th>
                                    <th className="px-6 py-3 text-center">Date</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                    <th className="px-6 py-3 text-right pr-8">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {applications.map((app) => (
                                    <tr key={app.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 pl-8">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 shrink-0 bg-white border border-slate-100 rounded-lg overflow-hidden flex items-center justify-center p-1 shadow-sm">
                                                    {app.job?.employer?.company_logo ? (
                                                        <img src={normalizeMediaUrl(app.job.employer.company_logo)} alt="" className="h-full w-full object-contain" />
                                                    ) : (
                                                        <Building2 className="w-4 h-4 text-slate-200" />
                                                    )}
                                                </div>
                                                <span className="text-xs font-medium text-slate-600 truncate max-w-[150px]">{app.job?.employer?.company_name || app.company_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <h3 className="text-xs font-bold text-slate-800 line-clamp-1">{app.job?.title || "Role"}</h3>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                                            {app.job?.location || "Remote"}
                                        </td>
                                        <td className="px-6 py-4 text-center text-[11px] text-slate-400 font-medium">
                                            {new Date(app.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyles(app.status)}`}>
                                                {app.status || "Applied"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 pr-8 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/jobs/${app.job?.slug || app.job_id}`}>
                                                    <button className="h-8 px-4 rounded-lg text-[11px] font-bold text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all">Details</button>
                                                </Link>
                                                <button onClick={() => handleWithdraw(app.id)} className="h-8 w-8 flex items-center justify-center rounded-lg border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
