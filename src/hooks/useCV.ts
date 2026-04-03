"use client";

import { useCallback, useState } from "react";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";

export type CvTemplate = {
  id: number | string;
  name: string;
  description?: string;
  preview_url?: string;
  [key: string]: unknown;
};

export function useCV() {
  const [templates, setTemplates] = useState<CvTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardServerFetch<any>("jobseeker/cv/templates", {
        method: "GET",
      });
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setTemplates(data);
    } catch (err: any) {
      setTemplates([]);
      setError(err?.message || "Failed to load CV templates");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateCV = useCallback(
    async (payload: Record<string, unknown> & { template_id: number | string }) => {
      try {
        setLoading(true);
        setError(null);
        await dashboardServerFetch<any>("jobseeker/cv/generate-base", {
          method: "POST",
          data: payload,
        });
        await fetchTemplates();
      } catch (err: any) {
        setError(err?.message || "Failed to generate CV");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTemplates]
  );

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    generateCV,
  };
}

