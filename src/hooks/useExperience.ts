"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listExperiences,
  createExperience as createExperienceRequest,
  updateExperience as updateExperienceRequest,
  deleteExperience as deleteExperienceRequest,
} from "@/services/api/experience.service";
import type { ExperiencePayload, ExperienceRecord } from "@/types/experience";

export function useExperience() {
  const [data, setData] = useState<ExperienceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshList = useCallback(async () => {
    try {
      const items = await listExperiences();
      setData(items);
    } catch (e) {
      setData([]);
    }
  }, []);

  const fetch = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      await refreshList();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load experience");
    } finally {
      setLoading(false);
    }
  }, [refreshList]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const createExperience = useCallback(
    async (payload: ExperiencePayload) => {
      try {
        setError(null);
        setLoading(true);
        await createExperienceRequest(payload);
        await refreshList();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to add experience";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [refreshList]
  );

  const updateExperience = useCallback(
    async (id: number | string, payload: ExperiencePayload) => {
      try {
        setError(null);
        setLoading(true);
        await updateExperienceRequest(id, payload);
        await refreshList();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to update experience";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [refreshList]
  );

  const deleteExperience = useCallback(
    async (id: number | string) => {
      try {
        setError(null);
        setLoading(true);
        await deleteExperienceRequest(id);
        await refreshList();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to delete experience";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [refreshList]
  );

  return { data, loading, error, fetch, createExperience, updateExperience, deleteExperience };
}
