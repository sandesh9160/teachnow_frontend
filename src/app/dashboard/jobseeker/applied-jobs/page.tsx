"use client";

import { useEffect, useState } from "react";
import { useApplications } from "@/hooks/useApplications";
import { Loader2, Briefcase} from "lucide-react";
import JobCard from "@/shared/cards/JobCard/JobCard";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Badge } from "@/shared/ui/Badge/Badge";

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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 drop-shadow-sm">Applied Jobs</h1>
        <p className="text-gray-500 mt-2">Track the status of jobs you have applied for.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row p-5 gap-6 items-start md:items-center">
                <div className="flex-1 w-full">
                  {/* Reuse JobCard inside if app.job is fully populated, otherwise manual layout */}
                  {app.job ? (
                    <JobCard 
                      id={app.job.id}
                      title={app.job.title}
                      company={app.job.employer?.company_name || "Unknown Company"}
                      location={app.job.location || "Remote"}
                      type={app.job.job_type || "Full-time"}
                      salary={app.job.salary_min ? `₹${app.job.salary_min} - ₹${app.job.salary_max}` : "Not disclosed"}
                      tags={[app.job.job_type, `${app.job.experience_required || 0} Yrs Exp`].filter(Boolean)}
                      posted={app.job.created_at ? new Date(app.job.created_at).toLocaleDateString() : "Recently"}
                      slug={app.job.slug}
                      logo={app.job.employer?.company_logo}
                    />
                  ) : (
                    <div>
                      <h3 className="font-bold text-lg">{app.job_title || "Unknown Job"}</h3>
                      <p className="text-sm text-gray-500">{app.company_name}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col md:items-end gap-3 w-full md:w-auto border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Status:</span>
                    <Badge variant={
                      app.status === 'accepted' ? 'success' : 
                      app.status === 'rejected' ? 'destructive' : 
                      'outline'
                    }>
                      {app.status || "Pending"}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-400">
                    Applied on: {new Date(app.created_at || Date.now()).toLocaleDateString()}
                  </span>
                  
                  <div className="flex gap-2 w-full md:w-auto mt-2">
                    <Link href={`/jobs/${app.job?.slug || app.job_id}`} className="flex-1 md:flex-auto">
                      <Button variant="outline" size="sm" className="w-full">View Job</Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleWithdraw(app.id)}
                    >
                      Withdraw
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Briefcase className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No applications yet</h3>
          <p className="text-gray-500 max-w-sm mb-6">Start applying to jobs to track their progress here.</p>
          <Link href="/jobs">
            <Button variant="default">Explore Jobs</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
