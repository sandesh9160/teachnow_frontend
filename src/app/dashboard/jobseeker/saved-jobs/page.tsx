"use client";

import { useEffect, useState } from "react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Loader2, BookmarkX, BookmarkCheck } from "lucide-react";
import JobCard from "@/shared/cards/JobCard/JobCard";
import { Job } from "@/types/homepage";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";

export default function SavedJobsPage() {
  const { getBookmarks, removeBookmark } = useBookmarks();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getBookmarks();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load saved jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [getBookmarks]);

  const handleRemove = async (jobId: string | number) => {
    try {
      await removeBookmark(jobId);
      toast.success("Job removed from saved list.");
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (error) {
      toast.error("Failed to remove saved job.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 drop-shadow-sm">Saved Jobs</h1>
        <p className="text-gray-500 mt-2">Jobs you have bookmarked for later consideration.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="relative group flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex-1 p-5">
                <JobCard 
                  id={job.id}
                  title={job.title}
                  company={job.employer?.company_name || ""}
                  location={job.location || ""}
                  type={job.job_type || ""}
                  salary={job.salary_min ? `₹${job.salary_min} - ₹${job.salary_max}` : "Not Disclosed"}
                  tags={[job.job_type, `${job.experience_required || 0} Yrs Exp`].filter(Boolean)}
                  posted={job.created_at ? new Date(job.created_at).toLocaleDateString() : ""}
                  slug={job.slug}
                  logo={job.employer?.company_logo}
                />
              </div>
              <div className="p-4 border-t border-gray-50 flex justify-between items-center bg-gray-50/50">
                <Link href={`/jobs/${job.slug || job.id}`}>
                  <Button variant="outline" size="sm">View Details</Button>
                </Link>
                <button 
                  onClick={() => handleRemove(job.id)}
                  className="flex items-center text-sm font-medium text-red-500 hover:text-red-700 transition"
                  title="Remove from saved"
                >
                  <BookmarkCheck className="w-4 h-4 mr-1" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <BookmarkX className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No saved jobs yet</h3>
          <p className="text-gray-500 max-w-sm mb-6">When you see a job you like, click the bookmark icon to save it here.</p>
          <Link href="/jobs">
            <Button variant="default">Browse Jobs</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
