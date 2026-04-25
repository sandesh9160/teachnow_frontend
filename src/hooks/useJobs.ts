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
  const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async (opts?: { keyword?: string; location?: string }) => {
    try {
      setError(null);
      setLoading(true);
      const kw = opts?.keyword?.trim() ?? "";
      const loc = opts?.location?.trim() ?? "";
      
      // If we have search params, use the specialized search endpoint
      let endpoint = (kw || loc) ? "open/search/jobs/search" : "open/jobs";
      let query = [];
      if (kw) query.push(`keyword=${encodeURIComponent(kw)}`);
      if (loc) query.push(`location=${encodeURIComponent(loc)}`);
      if (query.length) endpoint += `?${query.join("&")}`;
      
      const res = await dashboardServerFetch<any>(endpoint, { method: "GET" });
      
      // Robust extraction from multiple possible response shapes
      const root = res?.data ?? res;
      const searchSource = root?.search_jobs || res?.search_jobs;
      const similarSource = root?.similar_jobs || res?.similar_jobs;
      
      // If searchSource is present, use it; otherwise fallback to the root as a flat array
      const jobsList = toArray<any>(searchSource || root).map(normalizeJob);
      
      // Extract similar jobs if they exist
      const similarList = toArray<any>(similarSource).map(normalizeJob);
      
      // Deduplicate similar jobs against main results
      const uniqueSimilar = similarList.filter(
        sj => !jobsList.some(j => String(j.id) === String(sj.id))
      );
      
      setJobs(jobsList);
      setSimilarJobs(uniqueSimilar);
    } catch (e: unknown) {
      setJobs([]);
      setSimilarJobs([]);
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
    similarJobs,
    jobDetails,
    loading,
    error,
    fetchJobs,
    fetchJobDetails,
  };
}
