"use client";

import { useEffect, useState } from "react";
import { useApplications } from "@/hooks/useApplications";
import { Briefcase, Building2, MapPin, ExternalLink, Clock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

import { normalizeMediaUrl } from "@/services/api/client";

function formatDate(iso: string | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export default function AppliedJobsPage() {
  const { getApplications } = useApplications();
  const [applications, setApplications] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchApps = async (page: number = 1) => {
    try {
      setLoading(true);
      const res: any = await getApplications(page);

      let dataArray: any[] = [];
      let paginationObj: any = null;

      // Deep scan for data array and pagination info
      if (Array.isArray(res)) {
        dataArray = res;
      } else if (res && typeof res === 'object') {
        // Find the applications array
        const possibleArray = res.data?.data || res.data || res.applications || res.items || [];
        dataArray = Array.isArray(possibleArray) ? possibleArray : [];

        // Find pagination info (look for links or current_page)
        if (res.links || res.current_page) {
          paginationObj = res;
        } else if (res.data?.links || res.data?.current_page) {
          paginationObj = res.data;
        } else if (res.meta?.links || res.meta?.current_page) {
          paginationObj = res.meta;
        }
      }

      setApplications(dataArray);
      setPagination(paginationObj);

      console.log("AppliedJobs Page Data Load:", { arrayLength: dataArray.length, hasPagination: !!paginationObj });
    } catch (error) {
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps(1);
  }, []);

  const handlePageChange = (page: number) => {
    if (page) fetchApps(page);
  };

  const decodeLabel = (label: string) => {
    if (!label) return "";
    return label.replace("&laquo;", "«").replace("&raquo;", "»").replace("Previous", "Prev").replace("Next", "Next");
  };

  // ... rest of logic stays same (getStatusStyles, stats, etc)
  const getStatusStyles = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'interview scheduled' || s === 'interviews' || s === 'shortlisted' || s === 'hired')
      return "bg-[#E8FBF2] text-[#059669]";
    if (s === 'under review' || s === 'reviewing' || s === 'accepted')
      return "bg-[#EEF2FF] text-[#4F46E5]";
    if (s === 'applied' || s === 'pending')
      return "bg-[#F1F5F9] text-[#1E293B]";
    if (s === 'rejected' || s === 'declined')
      return "bg-[#FEF2F2] text-[#DC2626]";
    return "bg-[#F1F5F9] text-[#1E293B]";
  };

  const stats = {
    total: pagination?.total || applications.length,
    underReview: applications.filter(a => ['under review', 'reviewing', 'accepted'].includes(a.status?.toLowerCase())).length,
    interviews: applications.filter(a => ['interview scheduled', 'interviews', 'shortlisted'].includes(a.status?.toLowerCase())).length,
    applied: applications.filter(a => !a.status || a.status?.toLowerCase() === 'applied').length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-20 pt-1 px-4 md:px-0">
      {/* Page Header - Compact */}
      <div className="space-y-0">
        <h1 className="text-[22px] font-bold text-black">My Applications</h1>
        <p className="text-[12px] text-slate-600 font-medium">Manage your progress</p>
      </div>

      {/* Stats row - Ultra Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Review', value: stats.underReview },
          { label: 'Interviews', value: stats.interviews },
          { label: 'Applied', value: stats.applied }
        ].map((s, idx) => (
          <div key={idx} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-lg font-bold text-black leading-tight">{s.value}</span>
            <span className="text-[10px] font-bold text-slate-500 capitalize">{s.label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-50">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0" />
                      <div className="space-y-2">
                        <div className="h-4 w-48 bg-slate-100 rounded" />
                        <div className="h-3 w-32 bg-slate-50 rounded" />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="h-6 w-20 bg-slate-50 rounded-full" />
                      <div className="h-6 w-12 bg-slate-50 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-50">
              {applications.map((app) => (
                <div key={app.id} className="p-4 px-6 hover:bg-slate-50/50 group transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-lg bg-[#E8F1FF] flex items-center justify-center shrink-0 border border-[#BFDBFE] overflow-hidden">
                        {app.job?.employer?.company_logo ? (
                          <Image
                            src={normalizeMediaUrl(app.job.employer.company_logo)}
                            alt={app.job.employer.company_name || "Company Logo"}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        ) : (
                          <span className="text-[#0046B5] font-bold text-sm uppercase">
                            {app.job?.title?.[0] || app.job?.employer?.company_name?.[0] || "A"}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-[13px] font-bold text-black truncate leading-none mb-1">{app.job?.title || "Position Title"}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-slate-600 font-medium">
                          <div className="flex items-center gap-1 min-w-0">
                            <Building2 className="w-2.5 h-2.5 shrink-0 opacity-40" />
                            <span className="text-[10.5px] font-medium truncate">{app.job?.employer?.company_name || app.company_name || "Enterprise"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 shrink-0 opacity-40" />
                            <span className="text-[10.5px] font-medium truncate">{app.job?.location || "Remote"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 shrink-0 opacity-40" />
                            <span className="text-[10.5px] font-medium truncate whitespace-nowrap">{formatDate(app.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 md:gap-8">
                      <span className={`px-3 py-0.5 rounded-full text-[10.5px] font-bold whitespace-nowrap shadow-sm/5 ${getStatusStyles(app.status)}`}>
                        {app.status || "Applied"}
                      </span>
                      <Link
                        href={`/dashboard/jobseeker/applied-jobs/${app.id}`}
                        aria-label={`View details for ${app.job?.title || 'application'}`}
                        className="flex items-center gap-1 text-[12px] font-bold text-slate-700 hover:text-[#0046B5] transition-colors"
                      >
                        View <ExternalLink className="w-3 h-3 opacity-60" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Buttons - Always show if available to meet user requirement */}
          {pagination?.links && pagination.links.length > 0 && (
            <div className="flex justify-center items-center gap-1.5 pt-2">
              {pagination.links.map((link: any, i: number) => (
                <button
                  key={i}
                  disabled={!link.url || link.active}
                  onClick={() => {
                    const url = link.url;
                    if (url) {
                      const match = url.match(/[?&]page=(\d+)/);
                      const pageNum = match ? parseInt(match[1]) : 1;
                      handlePageChange(pageNum);
                    }
                  }}
                  className={`min-w-[32px] h-8 px-2 rounded-lg text-[11px] font-bold transition-all ${link.active
                      ? "bg-[#0046B5] text-white shadow-md shadow-blue-900/10"
                      : !link.url
                        ? "text-slate-300 cursor-not-allowed"
                        : "bg-white border border-slate-100 text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                >
                  {decodeLabel(link.label)}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl py-16 px-6 text-center border border-slate-100 shadow-sm flex flex-col items-center">
          <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-7 h-7 text-slate-300" />
          </div>
          <h3 className="text-base font-bold text-black mb-1">No applications yet</h3>
          <p className="text-[11px] text-black opacity-70 max-w-xs mx-auto mb-6 font-medium leading-relaxed">
            Ready for your next step? Start browsing jobs.
          </p>
          <Link href="/jobs">
            <button className="px-8 h-9 bg-indigo-600 text-white rounded-xl text-[11px] font-bold hover:bg-indigo-700 transition-all">Browse Jobs</button>
          </Link>
        </div>
      )}
    </div>
  );
}
