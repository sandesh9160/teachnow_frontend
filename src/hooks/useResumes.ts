"use client";

import { useCallback, useEffect, useState } from "react";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import type { Resume } from "@/types/resume";

export type UseResumesOptions = {
  /** When false, skips initial fetch (e.g. public pages before login). Default true. */
  enabled?: boolean;
};

export function useResumes(options?: UseResumesOptions) {
  const enabled = options?.enabled ?? true;

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refreshList = useCallback(async () => {
    const res = await dashboardServerFetch<any>("jobseeker/resumes", { method: "GET" });
    const list = Array.isArray(res?.data) ? res.data : [];
    setResumes(list);
  }, []);

  const fetchResumes = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      await refreshList();
    } catch (e: unknown) {
      setResumes([]);
      setError(e instanceof Error ? e.message : "Failed to load resumes");
    } finally {
      setLoading(false);
    }
  }, [refreshList]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void fetchResumes();
  }, [enabled, fetchResumes]);

  const upload = useCallback(
    async (file: File) => {
      try {
        setError(null);
        setLoading(true);
        const formData = new FormData();
        formData.append("resume", file);
        formData.append("title", file.name);
        await dashboardServerFetch<any>("jobseeker/resumes", {
          method: "POST",
          data: formData,
          headers: { "Content-Type": "multipart/form-data" },
        });
        await refreshList();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to upload resume";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [refreshList]
  );

  const remove = useCallback(
    async (id: number | string) => {
      try {
        setError(null);
        setLoading(true);
        await dashboardServerFetch<any>(`jobseeker/resumes/${id}`, { method: "DELETE" });
        await refreshList();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to delete resume";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [refreshList]
  );

  const setDefault = useCallback(
    async (id: number | string) => {
      try {
        setError(null);
        setLoading(true);
        await dashboardServerFetch<any>(`jobseeker/resumes/${id}/default`, { method: "POST" });
        await refreshList();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to set default resume";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [refreshList]
  );

  return {
    resumes,
    loading,
    error,
    fetchResumes,
    upload,
    remove,
    setDefault,
  };
}
