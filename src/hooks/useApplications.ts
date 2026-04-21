"use client";

import { useState, useCallback } from "react";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import type { ApplicationAnswer, ApplicationPayload } from "@/types/application";

function extractErrorMessage(e: unknown): string {
  if (e && typeof e === "object" && "response" in e) {
    const data = (e as { response?: { data?: { message?: string } } }).response?.data;
    if (typeof data?.message === "string") return data.message;
  }
  if (e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string") {
    return (e as { message: string }).message;
  }
  if (e instanceof Error) return e.message;
  return "Request failed";
}

export function useApplications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getApplications = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardServerFetch<unknown>(`jobseeker/applications?page=${page}`, { method: "GET" });
      const r = res as { data?: unknown; links?: any; current_page?: any };
      
      // If it's a paginated object, return the whole thing
      if (r.links || r.current_page) return res;
      
      return r.data ?? res;
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getShortlisted = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardServerFetch<unknown>("jobseeker/shortlisted", { method: "GET" });
      const r = res as { data?: unknown };
      return r.data ?? res;
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const apply = useCallback(async (jobId: string | number, answers: ApplicationAnswer[], resumeId?: number | string) => {
    try {
      setLoading(true);
      setError(null);
      const payload: ApplicationPayload = { answers, resume_id: resumeId };
      return await dashboardServerFetch<unknown>(`jobseeker/jobs/${jobId}/apply`, {
        method: "POST",
        data: payload,
      });
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Backward-compatible helper: builds `{ answers }` from legacy fields when needed.
   */
  const applyJob = useCallback(
    async (jobId: string | number, data: Record<string, unknown> = {}) => {
      const answers: ApplicationAnswer[] = Array.isArray(data.answers)
        ? (data.answers as ApplicationAnswer[])
        : [];
      const qid = data.cover_letter_question_id;
      const letter = data.cover_letter;
      if (typeof qid === "number" && typeof letter === "string" && letter.trim()) {
        answers.push({ question_id: qid, candidate_answer: letter });
      }
      await apply(jobId, answers);
    },
    [apply]
  );

  const withdrawApplication = useCallback(async (applicationId: number | string) => {
    try {
      setLoading(true);
      setError(null);
      return await dashboardServerFetch<unknown>(`jobseeker/applications/${applicationId}`, {
        method: "DELETE",
      });
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getApplication = useCallback(async (applicationId: number | string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardServerFetch<unknown>(`jobseeker/applications/${applicationId}`, { method: "GET" });
      const r = res as { data?: unknown };
      return r.data ?? res;
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    loading, 
    error, 
    getApplications, 
    getApplication,
    getShortlisted, 
    apply, 
    applyJob, 
    withdrawApplication 
  };
}
