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

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'accepted' || s === 'hired') return "bg-emerald-500";
    if (s === 'rejected') return "bg-red-500";
    return "bg-blue-600";
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-0 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applied Jobs</h1>
        <p className="text-gray-500 text-sm mt-1 font-medium">Tracking {applications.length} applications</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
        </div>
      ) : applications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {applications.map((app) => (
            <div key={app.id} className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden shadow-none">
              {/* Header */}
              <div className="p-4 flex items-center justify-between border-b border-gray-50">
                <div className="h-10 w-10 border border-gray-100 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center p-1">
                  {app.job?.employer?.company_logo ? (
                    <img 
                      src={normalizeMediaUrl(app.job.employer.company_logo)} 
                      alt={app.job.employer.company_name} 
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Building2 className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-sm text-white ${getStatusColor(app.status)}`}>
                  {app.status || "Pending"}
                </span>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 space-y-1.5 min-h-[90px]">
                <h3 className="text-base font-bold text-gray-900 line-clamp-2">
                  {app.job?.title || "Position"}
                </h3>
                <p className="text-primary text-sm font-bold truncate">
                  {app.job?.employer?.company_name || app.company_name}
                </p>
                <div className="flex flex-wrap gap-3 pt-2 text-[10px] font-bold text-gray-400 uppercase">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.job?.location || "Remote"}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Applied {new Date(app.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-50 flex items-center gap-2">
                <Link href={`/${app.job?.slug || app.job_id}`} className="flex-1">
                  <button className={`w-full h-9 rounded text-xs font-bold text-white transition-opacity hover:opacity-90 ${getStatusColor(app.status)}`}>
                    View Details
                  </button>
                </Link>
                <button 
                  onClick={() => handleWithdraw(app.id)}
                  className="h-9 w-9 border border-red-100 rounded bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-200">
           <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-4" />
           <p className="text-gray-500 font-medium">No applications found.</p>
           <Link href="/jobs" className="mt-4 block">
             <Button variant="default">Explore Jobs</Button>
           </Link>
        </div>
      )}
    </div>
  );
}
