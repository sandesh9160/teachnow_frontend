"use client";

import { useState, useCallback } from "react";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { applyJob as applyJobRequest } from "@/services/api/application.service";
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

  const getApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardServerFetch<unknown>("jobseeker/applications", { method: "GET" });
      const r = res as { data?: unknown };
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

  const apply = useCallback(async (jobId: string | number, answers: ApplicationAnswer[]) => {
    try {
      setLoading(true);
      setError(null);
      const payload: ApplicationPayload = { answers };
      await applyJobRequest(jobId, payload);
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

  const withdrawApplication = async (applicationId: number | string) => {
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
  };

  return { loading, error, getApplications, getShortlisted, apply, applyJob, withdrawApplication };
}
