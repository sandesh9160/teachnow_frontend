/**
 * Server- and client-safe job fetching (no React hooks).
 * Use this from Server Components and route handlers.
 */
import { fetchAPI } from "@/services/api/client";
import { getJobs as getJobsFromService, getJobDetails } from "@/services/api/job.service";
import { normalizeJob, toArray } from "@/lib/jobs/normalizeJob";
import type { ApiResponse, Job } from "@/types/homepage";

/** Record shape returned by some category endpoints. */
export type CategoryJobsRecord = {
  jobs?: Job[];
  data?: Job[];
  name?: string;
  category_name?: string;
};

export type CategoryJobsResult = Job[] | null | CategoryJobsRecord;

export { normalizeJob, toArray } from "@/lib/jobs/normalizeJob";
export { getJobDetails };
export const getJobBySlug = getJobDetails;
export const getJobById = getJobDetails;

export async function getJobs(filters: Record<string, unknown> = {}): Promise<Job[]> {
  return getJobsFromService(filters);
}

export async function getJobsForSlug(slug: string): Promise<Job[] | null> {
  const cleanSlug = (slug || "").replace(/^[:/]+/, "").replace(/\/+$/, "").trim();
  if (!cleanSlug) return null;
  const results = await getCategoryJobs(cleanSlug);
  if (!results) return null;
  if (Array.isArray(results)) return results;
  const j = results.jobs;
  return Array.isArray(j) ? j : null;
}

export async function getCategoryJobs(slug: string | number): Promise<CategoryJobsResult> {
  const cleanSlug = slug.toString().replace(/\/+$/, "").trim();
  if (!cleanSlug) return null;

  try {
    const res = await fetchAPI<ApiResponse<unknown>>(`/open/category/${cleanSlug}`, {
      silentStatusCodes: [404, 500],
    });
    const raw = (res.data ?? res) as Record<string, unknown>;
    const jobs = toArray<Job>(raw);

    const mapped = jobs.map(normalizeJob);
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const rec: CategoryJobsRecord = { ...raw, jobs: mapped };
      return rec;
    }
    return { jobs: mapped };
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status !== 404 && status !== 500) {
      //console.error(`getCategoryJobs error (${slug}):`, err);
    }
    return null;
  }
}

export async function fullSearchJobs(
  keyword: string,
  location: string,
  category_id?: string | number
): Promise<{ jobs: Job[]; similarJobs: Job[] }> {
  try {
    const params = new URLSearchParams();
    if (keyword?.trim()) params.set("keyword", keyword.trim());
    if (location?.trim()) params.set("location", location.trim());
    if (category_id) params.set("category_id", category_id.toString());

    const query = params.toString();
    const res = await fetchAPI<ApiResponse<any>>(`/open/search/jobs/search${query ? "?" + query : ""}`);
    const raw = (res.data ?? res);
    
    const mainJobs = toArray<Job>(raw?.search_jobs || raw).map(normalizeJob);
    const similarJobs = toArray<Job>(raw?.similar_jobs).map(normalizeJob);

    return { 
      jobs: mainJobs, 
      similarJobs: similarJobs.filter(sj => !mainJobs.some(j => String(j.id) === String(sj.id))) 
    };
  } catch (err: unknown) {
    return { jobs: [], similarJobs: [] };
  }
}

export async function searchJobs(
  keyword: string,
  location: string,
  category_id?: string | number
): Promise<Job[]> {
  const result = await fullSearchJobs(keyword, location, category_id);
  return result.jobs;
}

export async function fetchJobsPaginated(opts?: { 
  keyword?: string; 
  location?: string;
  page?: number;
  limit?: number;
  filters?: Partial<any>;
}): Promise<{ jobs: Job[]; meta?: { total: number; last_page: number; current_page: number; per_page: number }; similarJobs?: Job[]; error?: string }> {
  try {
    const kw = opts?.keyword?.trim() ?? "";
    const loc = opts?.location?.trim() ?? "";
    const page = opts?.page ?? 1;
    const limit = opts?.limit ?? 10;
    const filters = opts?.filters ?? {};
    
    // If we have search params OR filters, use the specialized search endpoint
    const hasFilters = Object.values(filters).some(v => 
      Array.isArray(v) ? v.length > 0 : (v !== undefined && v !== null && v !== "")
    );

    let endpoint = (kw || loc || hasFilters) ? "/open/search/jobs/search" : "/open/jobs";
    let query = [];
    if (kw) query.push(`keyword=${encodeURIComponent(kw)}`);
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
    
    const queryString = query.length ? `?${query.join("&")}` : "";
    const res = await fetchAPI<any>(`${endpoint}${queryString}`);
    
    let jobsList: Job[] = [];
    let similarList: Job[] = [];
    let paginationMeta: any = null;

    if (res?.search_jobs) {
      const source = res.search_jobs;
      jobsList = toArray<any>(source.data || source).map(normalizeJob);
      paginationMeta = (source && typeof source === "object") ? source : res;
    } else if (res?.data && typeof res.data === "object" && !Array.isArray(res.data)) {
      const source = res.data;
      jobsList = toArray<any>(source.data || source).map(normalizeJob);
      paginationMeta = ("current_page" in source) ? source : null;
    } else if (res?.data && Array.isArray(res.data)) {
      jobsList = res.data.map(normalizeJob);
      paginationMeta = ("current_page" in res) ? res : null;
    } else if (Array.isArray(res)) {
      jobsList = res.map(normalizeJob);
    } else if (res && typeof res === "object") {
      jobsList = toArray<any>(res.data || res).map(normalizeJob);
      paginationMeta = ("current_page" in res) ? res : null;
    }

    const similarSource = res?.similar_jobs || res?.data?.similar_jobs;
    similarList = toArray<any>(similarSource).map(normalizeJob);

    let metaResult: any = undefined;
    if (paginationMeta) {
      const total = Number(paginationMeta.total || res?.total_jobs || jobsList.length);
      const perPage = Number(paginationMeta.per_page || limit || 10);
      metaResult = {
        current_page: Number(paginationMeta.current_page || page || 1),
        last_page: Number(paginationMeta.last_page || Math.ceil(total / perPage) || 1),
        total: total,
        per_page: perPage,
      };
    } else if (res?.total_jobs) {
      metaResult = {
        current_page: 1,
        last_page: 1,
        total: Number(res.total_jobs),
        per_page: Number(res.total_jobs),
      };
    }

    const uniqueSimilar = similarList.filter(
      sj => !jobsList.some(j => String(j.id) === String(sj.id))
    );

    return {
      jobs: jobsList,
      meta: metaResult,
      similarJobs: uniqueSimilar
    };
  } catch (err: any) {
    return {
      jobs: [],
      error: err instanceof Error ? err.message : "Failed to load jobs"
    };
  }
}
