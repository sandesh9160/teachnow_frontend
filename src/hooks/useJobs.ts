"use client";

import { useState, useCallback } from "react";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import type { Job } from "@/types/homepage";
import type { JobDetails } from "@/types/jobs";

import { normalizeJob, toArray } from "@/lib/jobs/normalizeJob";

/** Re-export for client-only modules; Server Components should import from `@/lib/jobs/api`. */
export { normalizeJob, toArray };
export {
  getJobs,
  getJobDetails,
  getJobBySlug,
  getJobById,
  getJobsForSlug,
  getCategoryJobs,
  searchJobs,
} from "@/lib/jobs/api";

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async (opts?: { keyword?: string; location?: string }) => {
    try {
      setError(null);
      setLoading(true);
      const kw = opts?.keyword?.trim() ?? "";
      const loc = opts?.location?.trim() ?? "";
      let endpoint = "open/jobs";
      let query = [];
      if (kw) query.push(`keyword=${encodeURIComponent(kw)}`);
      if (loc) query.push(`location=${encodeURIComponent(loc)}`);
      if (query.length) endpoint += `?${query.join("&")}`;
      const res = await dashboardServerFetch<any>(endpoint, { method: "GET" });
      
      // Use toArray to handle nested paginated data and normalize results
      const rawData = res?.data ?? res;
      const jobsList = toArray<any>(rawData).map(normalizeJob);
      
      setJobs(jobsList);
    } catch (e: unknown) {
      setJobs([]);
      setError(e instanceof Error ? e.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJobDetails = useCallback(async (slug: string) => {
    try {
      setError(null);
      setLoading(true);
      const endpoint = `open/jobs/${encodeURIComponent(slug)}`;
      const res = await dashboardServerFetch<any>(endpoint, { method: "GET" });
      const detail = res?.data ?? null;
      setJobDetails(detail);
      if (!detail) setError("Job not found");
    } catch (e: unknown) {
      setJobDetails(null);
      setError(e instanceof Error ? e.message : "Failed to load job");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    jobs,
    jobDetails,
    loading,
    error,
    fetchJobs,
    fetchJobDetails,
  };
}
