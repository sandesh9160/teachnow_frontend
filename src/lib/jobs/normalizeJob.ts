import { normalizeMediaUrl } from "@/services/api/client";
import type { Job } from "@/types/homepage";

/**
 * Normalizes a job object from the backend.
 */
export function normalizeJob(job: unknown): Job {
  if (!job || typeof job !== "object") return {} as Job;
  const j = job as Record<string, unknown>;

  return {
    ...(j as unknown as Job),
    employer:
      j.employer && typeof j.employer === "object"
        ? {
            ...(j.employer as Record<string, unknown>),
            company_name:
              (j.employer as { company_name?: string }).company_name ||
              (j.employer as { name?: string }).name ||
              (j.employer as { institution_name?: string }).institution_name ||
              (j.employer as { institute_name?: string }).institute_name ||
              (j.employer as { college_name?: string }).college_name ||
              (j.employer as { school_name?: string }).school_name ||
              (j.employer as { org_name?: string }).org_name ||
              (j.employer as { company?: string }).company ||
              (j.employer as { institution?: string }).institution ||
              (j.employer as { institute?: string }).institute ||
              (j.employer as { college?: string }).college ||
              (j.employer as { school?: string }).school ||
              (j.employer as { organization?: string }).organization ||
              (j.company_name as string) ||
              (j.employer_name as string) ||
              (j.institution_name as string) ||
              (j.institute_name as string) ||
              (j.college_name as string) ||
              (j.school_name as string) ||
              (j.org_name as string) ||
              (j.company as string) ||
              (j.institution as string) ||
              (j.institute as string) ||
              (j.college as string) ||
              (j.school as string) ||
              (j.organization as string) ||
              "Confidential School",
            company_logo: normalizeMediaUrl(
              (j.employer as { company_logo?: string }).company_logo ??
                (j.employer as { logo?: string }).logo ??
                (j.employer as { company_image?: string }).company_image ??
                (j.employer as { company_logo_url?: string }).company_logo_url ??
                (j.company_logo as string) ??
                (j.logo as string) ??
                (j.school_logo as string) ??
                null
            ),
          }
        : {
            id: (j.employer_id as number) || (j.employer as { id?: number })?.id,
            company_name:
              (j.company_name as string) ||
              (j.employer_name as string) ||
              (j.institution_name as string) ||
              (j.institute_name as string) ||
              (j.college_name as string) ||
              (j.school_name as string) ||
              (j.org_name as string) ||
              (j.company as string) ||
              (j.institution as string) ||
              (j.institute as string) ||
              (j.college as string) ||
              (j.school as string) ||
              (j.organization as string) ||
              (j.employer && typeof j.employer === "object"
                ? String((j.employer as { company_name?: string }).company_name ?? "")
                : "") ||
              "Confidential School",
            company_logo: normalizeMediaUrl(
              (j.company_logo as string) ||
                (j.logo as string) ||
                (j.employer_logo as string) ||
                (j.school_logo as string) ||
                ""
            ),
          },
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
