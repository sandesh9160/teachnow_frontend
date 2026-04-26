"use client";

import { useCallback, useState } from "react";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";

export type CvTemplate = {
  id: number | string;
  name: string;
  description?: string;
  preview_url?: string;
  preview_image?: string;
  [key: string]: unknown;
};

export type GeneratedCV = {
  id: number | string;
  template_id: number | string;
  file_url: string;
  created_at: string;
  title?: string;
  [key: string]: unknown;
};

export type ResumeLimit = {
  limit: number;
  used: number;
  remaining: number;
};

export function useCV() {
  const [templates, setTemplates] = useState<CvTemplate[]>([]);
  const [generatedCVs, setGeneratedCVs] = useState<GeneratedCV[]>([]);
  const [resumeLimit, setResumeLimit] = useState<ResumeLimit | null>(null);
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
      
      if (res?.resume_limit) {
        setResumeLimit(res.resume_limit);
      }
    } catch (err: any) {
      setTemplates([]);
      setError(err?.message || "Failed to load CV templates");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGeneratedCVs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Attempt to load from the history/generated list
      const res = await dashboardServerFetch<any>("jobseeker/resumes", {
        method: "GET",
      });
      const data = Array.isArray(res?.generated_resumes) ? res.generated_resumes : [];
      setGeneratedCVs(data);
    } catch (err: any) {
      setGeneratedCVs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateCV = useCallback(
    async (payload: Record<string, unknown> & { template_id: number | string }) => {
      try {
        setLoading(true);
        setError(null);
        const res = await dashboardServerFetch<any>("jobseeker/cv/generate-base", {
          method: "POST",
          data: payload,
        });
        await fetchGeneratedCVs();
        return res;
      } catch (err: any) {
        const msg = err?.message || "Failed to generate CV";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchGeneratedCVs]
  );

  const generateCVWithJob = useCallback(
    async (payload: { template_id: number | string; job_id: number | string }) => {
      try {
        setLoading(true);
        setError(null);
        // Specialized endpoint for job-tailored CVs
        const res = await dashboardServerFetch<any>("jobseeker/cv/generate-job", {
          method: "POST",
          data: payload,
        });
        
        await fetchGeneratedCVs();
        return res;
      } catch (err: any) {
        const msg = err?.message || "Failed to generate tailored CV";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchGeneratedCVs]
  );

  return {
    templates,
    generatedCVs,
    resumeLimit,
    loading,
    error,
    fetchTemplates,
    fetchGeneratedCVs,
    generateCV,
    generateCVWithJob,
  };
}

