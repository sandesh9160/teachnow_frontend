import { fetchAPI, normalizeMediaUrl } from "@/services/api/client";
import { Job, ApiResponse } from "@/types/homepage";

/* -------------------- HELPERS -------------------- */

/**
 * Normalizes a job object from the backend.
 * TRUSTS the backend response structure.
 * No slug generation, no fallback guessing.
 */
export function normalizeJob(job: any): Job {
  if (!job) return {} as Job;

  return {
    ...job,
    // Ensure company logo is normalized if it exists
    employer: job.employer && typeof job.employer === 'object'
      ? {
        ...job.employer,
        company_name: 
          job.employer.company_name || 
          job.employer.name || 
          job.employer.institution_name ||
          job.employer.institute_name ||
          job.employer.college_name ||
          job.employer.school_name ||
          job.employer.org_name ||
          job.employer.company || 
          job.employer.institution ||
          job.employer.institute ||
          job.employer.college ||
          job.employer.school ||
          job.employer.organization ||
          job.company_name ||
          job.employer_name ||
          job.institution_name ||
          job.institute_name ||
          job.college_name ||
          job.school_name ||
          job.org_name ||
          job.company ||
          job.institution ||
          job.institute ||
          job.college ||
          job.school ||
          job.organization ||
          "Confidential School",
        company_logo: normalizeMediaUrl(
          job.employer.company_logo ??
            job.employer.logo ??
            job.employer.company_image ??
            job.employer.company_logo_url ??
            job.company_logo ??
            job.logo ??
            job.school_logo ??
            null,
        ),
      }
      : {
        id: job.employer_id || job.employer?.id,
        company_name: 
          job.company_name || 
          job.employer_name || 
          job.institution_name ||
          job.institute_name ||
          job.college_name ||
          job.school_name ||
          job.org_name ||
          job.company || 
          job.institution ||
          job.institute ||
          job.college ||
          job.school ||
          job.organization ||
          (job.employer && typeof job.employer === "object" ? job.employer.company_name : "") ||
          "Confidential School",
        company_logo: normalizeMediaUrl(
          job.company_logo ||
          job.logo ||
          job.employer_logo ||
          job.school_logo ||
          ""
        ),
      },
  };
}

/**
 * Simple helper to safely extract an array from common response patterns
 * without scanning or guessing keys.
 */
function toArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (Array.isArray(data?.jobs)) return data.jobs;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

/* -------------------- API METHODS -------------------- */

/**
 * Fetch jobs directly using filters.
 * One function = One API.
 */
export async function getJobs(filters: Record<string, any> = {}): Promise<Job[]> {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.append(k, v.toString());
    });

    const query = params.toString();
    const res = await fetchAPI<ApiResponse<any>>(
      `/open/jobs${query ? "?" + query : ""}`,
      { silentStatusCodes: [404, 500] }
    );

    return toArray<Job>(res.data || res).map(normalizeJob);
  } catch (err: any) {
    console.error("getJobs error:", err);
    return [];
  }
}

/**
 * Fetch a single job directly by its SLUG or ID.
 * NO list searching, NO indirect lookups.
 * Endpoint: /open/jobs/{slug_or_id}
 */
export async function getJobBySlug(slug: string): Promise<Job | null> {
  const cleanSlug = (slug || "").replace(/^[:/]+/, "").replace(/\/+$/, "").trim();
  if (!cleanSlug) return null;

  try {
    const res = await fetchAPI<ApiResponse<any>>(
      `/open/jobs/${encodeURIComponent(cleanSlug)}`,
      { silentStatusCodes: [404, 500] }
    );

    // Minimal normalization
    const raw = res.data ?? res;
    const rawJob = raw.job ?? raw;

    if (!rawJob?.id) return null;

    let job = normalizeJob(rawJob);

    return {
      ...job,
      similar_jobs: toArray<Job>(raw.similar_jobs || raw.related_jobs).map(sj => {
        const nJob = normalizeJob(sj);
        // Propagate employer info to similar jobs if IDs match
        if (job.employer && nJob.employer_id === job.employer.id) {
          nJob.employer = job.employer;
        }
        return nJob;
      })
    };
  } catch (err: any) {
    if (err.status !== 404 && err.status !== 500) {
      console.error(`getJobBySlug error (${slug}):`, err);
    }
    return null;
  }
}

// Alias for consistency
export const getJobById = getJobBySlug;

/**
 * Fetch jobs for a specific category or SEO slug.
 * All categorization as defined by the backend.
 */
export async function getJobsForSlug(slug: string): Promise<Job[] | null> {
  const cleanSlug = (slug || "").replace(/^[:/]+/, "").replace(/\/+$/, "").trim();
  if (!cleanSlug) return null;

  // If backend supports category resolution via /open/category/{slug}
  const results = await getCategoryJobs(cleanSlug);
  return results;
}

/**
 * Fetch jobs by category ID or Slug.
 * Endpoint: /open/category/{categoryId}
 */
export async function getCategoryJobs(slug: string | number): Promise<any> {
  const cleanSlug = (slug || "").toString().replace(/\/+$/, "").trim();
  if (!cleanSlug) return null;

  try {
    const res = await fetchAPI<ApiResponse<any>>(
      `/open/category/${cleanSlug}`,
      { silentStatusCodes: [404, 500] }
    );
    const raw = res.data || res;
    const jobs = toArray<Job>(raw);

    // Preserve category metadata while guaranteeing a normalized jobs array.
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      return { ...raw, jobs: jobs.map(normalizeJob) };
    }
    return { jobs: jobs.map(normalizeJob) };
  } catch (err: any) {
    if (err.status !== 404 && err.status !== 500) {
      console.error(`getCategoryJobs error (${slug}):`, err);
    }
    return null;
  }
}

/* -------------------- SEARCH -------------------- */


/**
 * Search jobs using keyword and location.
 * Endpoint: /open/search/jobs/search?keyword=&location=
 */
export async function searchJobs(
  keyword: string,
  location: string,
  category_id?: string | number
): Promise<Job[]> {
  try {
    const normalizedKeyword = keyword?.trim() || "";
    const normalizedLocation = location?.trim() || "";

    // For city-based browsing, use the dedicated location API first.
    if (!normalizedKeyword && normalizedLocation && !category_id) {
      const byCityRes = await fetchAPI<ApiResponse<any>>(
        `/open/location/${encodeURIComponent(normalizedLocation)}/jobs/`,
        { silentStatusCodes: [404, 500] }
      );
      const byCityData = byCityRes.data || byCityRes;
      return toArray<Job>(byCityData).map(normalizeJob);
    }

    const params = new URLSearchParams();
    if (normalizedKeyword) params.set("keyword", normalizedKeyword);
    if (normalizedLocation) params.set("location", normalizedLocation);
    if (category_id) params.set("category_id", category_id.toString());

    const query = params.toString();
    const res = await fetchAPI<ApiResponse<any>>(
      `/open/search/jobs/search${query ? "?" + query : ""}`
    );
    const data = res.data || res;
    return toArray<Job>(data).map(normalizeJob);
  } catch (err: any) {
    if (err.status !== 404 && err.status !== 500) {
      console.error("searchJobs error:", err);
    }
    return [];
  }
}