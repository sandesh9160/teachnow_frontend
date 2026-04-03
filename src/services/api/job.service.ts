import axios from "axios";
import { api } from "@/services/api/client";
import { normalizeJob, toArray } from "@/lib/jobs/normalizeJob";
import type { Job } from "@/types/homepage";
import type { JobDetails } from "@/types/jobs";

export async function getJobs(filters: Record<string, unknown> = {}): Promise<Job[]> {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.append(k, String(v));
    });
    const query = params.toString();
    const res = await api.get<unknown>(`/open/jobs${query ? `?${query}` : ""}`);
    return toArray<Job>(res.data).map((j) => normalizeJob(j));
  } catch (err) {
    //console.error("getJobs error:", err);
    return [];
  }
}

export async function getJobDetails(slug: string): Promise<JobDetails | null> {
  const cleanSlug = (slug || "").replace(/^[:/]+/, "").replace(/\/+$/, "").trim();
  if (!cleanSlug) return null;

  try {
    const res = await api.get<unknown>(`/open/jobs/${encodeURIComponent(cleanSlug)}`);
    const body = res.data as Record<string, unknown> | undefined;
    const inner = (body?.data as Record<string, unknown> | undefined) ?? body ?? {};
    const rawJob = (inner.job ?? inner) as Record<string, unknown>;

    if (!rawJob?.id) return null;

    let job = normalizeJob(rawJob) as JobDetails;

    job = {
      ...job,
      similar_jobs: toArray<Job>(inner.similar_jobs ?? inner.related_jobs).map((sj) => {
        const nJob = normalizeJob(sj) as Job;
        if (job.employer && nJob.employer_id === job.employer.id) {
          nJob.employer = job.employer;
        }
        return nJob;
      }),
    };

    if (Array.isArray(inner.screening_questions)) {
      job.screening_questions = inner.screening_questions as JobDetails["screening_questions"];
    }
    if (typeof inner.cover_letter_question_id === "number") {
      job.cover_letter_question_id = inner.cover_letter_question_id;
    }

    return job;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const s = err.response?.status;
      if (s !== 404 && s !== 500) //console.error(`getJobDetails error (${slug}):`, err);
    } else {
      //console.error(`getJobDetails error (${slug}):`, err);
    }
    return null;
  }
}
