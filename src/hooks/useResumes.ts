"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getResumes as getResumesRequest,
  uploadResume as uploadResumeRequest,
  deleteResume as deleteResumeRequest,
  setDefaultResume as setDefaultResumeRequest,
} from "@/services/api/resume.service";
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
    const list = await getResumesRequest();
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
        await uploadResumeRequest(file);
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
        await deleteResumeRequest(id);
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
        await setDefaultResumeRequest(id);
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
