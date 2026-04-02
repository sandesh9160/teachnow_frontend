"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listEducation,
  createEducation as createEducationRequest,
  updateEducation as updateEducationRequest,
  deleteEducation as deleteEducationRequest,
} from "@/services/api/education.service";
import type { EducationPayload, EducationRecord } from "@/types/education";

export function useEducation() {
  const [data, setData] = useState<EducationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshList = useCallback(async () => {
    const items = await listEducation();
    setData(items);
  }, []);

  const fetch = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      await refreshList();
    } catch (e: unknown) {
      setData([]);
      setError(e instanceof Error ? e.message : "Failed to load education");
    } finally {
      setLoading(false);
    }
  }, [refreshList]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const createEducation = useCallback(
    async (payload: EducationPayload) => {
      try {
        setError(null);
        setLoading(true);
        await createEducationRequest(payload);
        await refreshList();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to add education";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [refreshList]
  );

  const updateEducation = useCallback(
    async (id: number | string, payload: EducationPayload) => {
      try {
        setError(null);
        setLoading(true);
        await updateEducationRequest(id, payload);
        await refreshList();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to update education";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [refreshList]
  );

  const deleteEducation = useCallback(
    async (id: number | string) => {
      try {
        setError(null);
        setLoading(true);
        await deleteEducationRequest(id);
        await refreshList();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to delete education";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [refreshList]
  );

  return { data, loading, error, fetch, createEducation, updateEducation, deleteEducation };
}
