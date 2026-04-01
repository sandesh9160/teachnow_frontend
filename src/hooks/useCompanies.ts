import { fetchAPI, normalizeMediaUrl } from "@/services/api/client";
import { Institution, Job, ApiResponse } from "@/types/homepage";

/* -------------------- HELPERS -------------------- */

/**
 * Normalizes an institution object from the backend.
 * TRUSTS backend for slug and identification.
 */
function normalizeInstitution(comp: any): Institution {
  if (!comp) return {} as Institution;
  return {
    ...comp,
    company_name: comp.company_name || comp.employer_name || comp.name || comp.company || comp.school_name || comp.school || comp.institution_name || comp.institution || comp.org_name || comp.organization || "Confidential School",
    company_logo: normalizeMediaUrl(comp.company_logo || comp.logo || comp.company_image || comp.company_logo_url || null),
  };
}

/**
 * Normalizes a job object from the backend.
 */
function normalizeJob(job: any): Job {
  if (!job) return {} as Job;
  return {
    ...job,
    employer: job.employer
      ? normalizeInstitution(job.employer)
      : {
        id: job.employer_id,
        company_name: job.company_name || job.employer_name || job.name || "Confidential School",
        company_logo: "",
      },
  };
}

/**
 * Simple helper to safely extract an array.
 */
function toArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

/* -------------------- API METHODS -------------------- */

/**
 * Fetch list of companies directly.
 * One function = One API.
 * Endpoint: /open/home/featured-companies
 */



export async function getCompanies(filters: Record<string, any> = {}): Promise<Institution[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.append(k, v.toString());
  });

  try {
    const res = await fetchAPI<ApiResponse<any>>(
      `/open/home/featured-companies${params.toString() ? "?" + params.toString() : ""}`,
      { silentStatusCodes: [404, 500] }
    );
    const data = res.data || res;
    return toArray<Institution>(data).map(normalizeInstitution);
  } catch (err: any) {
    console.error("getCompanies error:", err);
    return [];
  }
}

/**
 * Fetches a single company profile AND its associated jobs from a direct endpoint.
 * NO list search, NO fallbacks.
 * Endpoint: /open/company/{id_or_slug}/profile
 */


export async function getCompanyProfileWithJobs(
  slugOrId: string | number
): Promise<{ company: Institution; jobs: Job[] } | null> {
  const slug = (slugOrId || "").toString().replace(/^[:/]+/, "").replace(/\/+$/, "").trim();
  if (!slug) return null;

  try {
    // 1. Try standard profile endpoint
    let res = await fetchAPI<ApiResponse<any>>(
      `/open/company/${encodeURIComponent(slug)}/profile`,
      { silentStatusCodes: [404, 500] }
    );
    
    // 2. Fallback: Try direct company endpoint (some IDs use this instead of profile/jobs)
    if (!res || (!(res as any).data && !(res as any).company_name && !(res as any).name)) {
       res = await fetchAPI<ApiResponse<any>>(
        `/open/company/${encodeURIComponent(slug)}`,
        { silentStatusCodes: [404, 500] }
      );
    }

    if (!res) return null;
    
    // Minimal normalization, direct from backend
    const raw = res.data ?? res;
    // Some responses might have { status, company, jobs } while others have the company at the root
    const company = normalizeInstitution(raw.company || raw.institution || raw.employer || raw);
    
    if (!company?.id && !raw.id) return null;

    const jobs = toArray<Job>(raw.jobs || raw.associated_jobs || []).map((j: any) => normalizeJob({
      ...j,
      employer: company
    }));

    return { company, jobs };
  } catch (error: any) {
    if (error.status !== 404 && error.status !== 500) {
      console.error(`getCompanyProfileWithJobs error (${slugOrId}):`, error);
    }
    return null;
  }
}


/**
 * Fetch just the company institution.
 */
export async function getCompanyBySlug(slug: string): Promise<Institution | null> {
  const profile = await getCompanyProfileWithJobs(slug);
  return profile?.company ?? null;
}

// Alias for consistency
export const getCompanyProfile = getCompanyBySlug;
export const getCompanyBySlugWithJobs = getCompanyProfileWithJobs;
