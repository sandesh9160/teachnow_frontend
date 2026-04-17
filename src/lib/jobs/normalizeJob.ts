import { normalizeMediaUrl } from "@/services/api/client";
import type { Job } from "@/types/homepage";

/**
 * Normalizes a job object from the backend.
 * Guaranteed idempotent and resilient to flat/nested structures.
 */
export function normalizeJob(job: unknown): Job {
  if (!job || typeof job !== "object") return {} as Job;
  const j = job as Record<string, any>;

  // Detect if j.employer is already a normalized object or a raw one
  const employerObj = (j.employer && typeof j.employer === "object") ? (j.employer as Record<string, any>) : null;
  
  const companyName = 
    employerObj?.company_name || 
    employerObj?.name || 
    employerObj?.institution_name || 
    employerObj?.school_name || 
    j.company_name ||
    j.institution_name ||
    j.org_name ||
    j.employer_name ||
    j.name ||
    "Confidential School";

  const institutionType = 
    j.institution_type || 
    employerObj?.institution_type || 
    j.employer_type || 
    j.type || 
    "";

  // We construct a fresh object while preserving any other existing fields
  return {
    ...j,
    // Standardize key metadata at the top level for reliability
    company_name: companyName,
    institution_type: institutionType,
    institutionType: institutionType,
    employer: {
      ...(employerObj || {}),
      id: employerObj?.id || j.employer_id,
      company_name: companyName,
      institution_type: institutionType,
      company_logo: normalizeMediaUrl(
        employerObj?.company_logo ||
        employerObj?.logo ||
        j.company_logo ||
        j.logo ||
        j.employer_logo ||
        ""
      ),
    }
  } as Job;
}

export function toArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const d = data as Record<string, unknown> | null | undefined;
  if (d?.data && Array.isArray(d.data)) return d.data as T[];
  if (Array.isArray(d?.jobs)) return d.jobs as T[];
  if (Array.isArray(d?.results)) return d.results as T[];
  if (Array.isArray(d?.items)) return d.items as T[];
  return [];
}
