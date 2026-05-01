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
  const [meta, setMeta] = useState<{
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  } | null>(null);

  const fetchJobs = useCallback(async (opts?: { 
    keyword?: string; 
    location?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      setError(null);
      setLoading(true);
      const kw = opts?.keyword?.trim() ?? "";
      const loc = opts?.location?.trim() ?? "";
      const page = opts?.page ?? 1;
      const limit = opts?.limit ?? 10;
      
      // If we have search params, use the specialized search endpoint
      let endpoint = (kw || loc) ? "open/search/jobs/search" : "open/jobs/";
      let query = [];
      if (kw) query.push(`keyword=${encodeURIComponent(kw)}`);
      if (loc) query.push(`location=${encodeURIComponent(loc)}`);
      query.push(`page=${page}`);
      query.push(`per_page=${limit}`);
      
      if (query.length) endpoint += `?${query.join("&")}`;
      
      const res = await dashboardServerFetch<any>(endpoint, { method: "GET" });
      
      // The backend returns { status: true, total_jobs: 26, data: { current_page: 1, data: [...], total: 26, ... } }
      // Or sometimes just { data: [...] } for search results
      const root = res?.data ?? res;
      
      // Determine the source for jobs array
      // 1. root.data (nested in pagination object)
      // 2. root.search_jobs (specific to search endpoint)
      // 3. root itself (if it's an array)
      const searchSource = root?.data || root?.search_jobs || (Array.isArray(root) ? root : null);
      const similarSource = res?.similar_jobs || root?.similar_jobs;
      
      const jobsList = toArray<any>(searchSource).map(normalizeJob);
      const similarList = toArray<any>(similarSource).map(normalizeJob);
      
      // Extract pagination meta - prioritize the data object if it has current_page
      if (root && typeof root === "object" && "current_page" in root) {
        setMeta({
          current_page: Number(root.current_page),
          last_page: Number(root.last_page),
          total: Number(root.total || res?.total_jobs || jobsList.length),
          per_page: Number(root.per_page || 10),
        });
      } else if (res?.total_jobs) {
        // Fallback for non-paginated root responses that still provide a total count
        setMeta({
          current_page: 1,
          last_page: 1,
          total: Number(res.total_jobs),
          per_page: Number(res.total_jobs),
        });
      } else {
        setMeta(null);
      }
      
      // Deduplicate similar jobs against main results
      const uniqueSimilar = similarList.filter(
        sj => !jobsList.some(j => String(j.id) === String(sj.id))
      );
      
      setJobs(jobsList);
      setSimilarJobs(uniqueSimilar);
    } catch (e: unknown) {
      setJobs([]);
      setSimilarJobs([]);
      setMeta(null);
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
    meta,
    fetchJobs,
    fetchJobDetails,
  };
}
