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
    filters?: Partial<any>;
  }) => {
    try {
      setError(null);
      setLoading(true);
      const kw = opts?.keyword?.trim() ?? "";
      const loc = opts?.location?.trim() ?? "";
      const page = opts?.page ?? 1;
      const limit = opts?.limit ?? 10;
      const filters = opts?.filters ?? {};
      
      // If we have search params OR filters, use the specialized search endpoint
      const hasFilters = Object.values(filters).some(v => 
        Array.isArray(v) ? v.length > 0 : (v !== undefined && v !== null && v !== "")
      );

      let endpoint = (kw || loc || hasFilters) ? "open/search/jobs/search" : "open/jobs";
      let query = [];
      if (kw) {
        query.push(`keyword=${encodeURIComponent(kw)}`);
      }
      if (loc) query.push(`location=${encodeURIComponent(loc)}`);
      query.push(`page=${page}`);
      query.push(`per_page=${limit}`);

      // Append filters — use key[] notation for arrays (required by Laravel/PHP)
      Object.entries(filters).forEach(([key, values]) => {
        if (Array.isArray(values) && values.length > 0) {
          values.forEach(val => {
            query.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(String(val))}`);
          });
        } else if (values !== undefined && values !== null && values !== "") {
          query.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(values))}`);
        }
      });
      
      if (query.length) endpoint += `?${query.join("&")}`;
      
      console.log("🔍 [useJobs] Final endpoint URL:", endpoint);
      const res = await dashboardServerFetch<any>(endpoint, { method: "GET" });
      console.log("📦 [useJobs] Raw API response:", {
        hasSearchJobs: !!res?.search_jobs,
        searchJobsTotal: res?.search_jobs?.total,
        searchJobsDataLength: res?.search_jobs?.data?.length,
        hasData: !!res?.data,
        topLevelKeys: res ? Object.keys(res) : [],
      });
      
      let jobsList: Job[] = [];
      let similarList: Job[] = [];
      let paginationMeta: any = null;

      // Determine the main data source and pagination metadata
      if (res?.search_jobs) {
        // Case A: Explicit search results container
        const source = res.search_jobs;
        jobsList = toArray<any>(source).map(normalizeJob);
        paginationMeta = (source && typeof source === "object") ? source : res;
      } else if (res?.data && typeof res.data === "object" && !Array.isArray(res.data)) {
        // Case B: Nested in 'data' (standard paginated response)
        const source = res.data;
        jobsList = toArray<any>(source.data || source).map(normalizeJob);
        paginationMeta = ("current_page" in source) ? source : null;
      } else if (res?.data && Array.isArray(res.data)) {
        // Case C: Flat 'data' array
        jobsList = res.data.map(normalizeJob);
        paginationMeta = ("current_page" in res) ? res : null;
      } else if (Array.isArray(res)) {
        // Case D: Pure array
        jobsList = res.map(normalizeJob);
      } else if (res && typeof res === "object") {
        // Case E: Flat object might be paginated
        jobsList = toArray<any>(res.data || res).map(normalizeJob);
        paginationMeta = ("current_page" in res) ? res : null;
      }

      // Capture similar jobs
      const similarSource = res?.similar_jobs || res?.data?.similar_jobs;
      similarList = toArray<any>(similarSource).map(normalizeJob);

      // Finalize Meta
      if (paginationMeta) {
        const total = Number(paginationMeta.total || res?.total_jobs || jobsList.length);
        const perPage = Number(paginationMeta.per_page || limit || 10);
        setMeta({
          current_page: Number(paginationMeta.current_page || page || 1),
          last_page: Number(paginationMeta.last_page || Math.ceil(total / perPage) || 1),
          total: total,
          per_page: perPage,
        });
      } else if (res?.total_jobs) {
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
