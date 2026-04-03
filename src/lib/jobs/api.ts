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

export async function searchJobs(
  keyword: string,
  location: string,
  category_id?: string | number
): Promise<Job[]> {
  try {
    const normalizedKeyword = keyword?.trim() || "";
    const normalizedLocation = location?.trim() || "";

    if (!normalizedKeyword && normalizedLocation && !category_id) {
      const byCityRes = await fetchAPI<ApiResponse<unknown>>(
        `/open/location/${encodeURIComponent(normalizedLocation)}/jobs/`,
        { silentStatusCodes: [404, 500] }
      );
      const byCityData = (byCityRes.data ?? byCityRes) as unknown;
      return toArray<Job>(byCityData).map(normalizeJob);
    }

    const params = new URLSearchParams();
    if (normalizedKeyword) params.set("keyword", normalizedKeyword);
    if (normalizedLocation) params.set("location", normalizedLocation);
    if (category_id) params.set("category_id", category_id.toString());

    const query = params.toString();
    const res = await fetchAPI<ApiResponse<unknown>>(`/open/search/jobs/search${query ? `?${query}` : ""}`);
    const data = (res.data ?? res) as unknown;
    return toArray<Job>(data).map(normalizeJob);
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status !== 404 && status !== 500) {
      //console.error("searchJobs error:", err);
    }
    return [];
  }
}
