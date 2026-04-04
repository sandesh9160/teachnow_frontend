"use client";

import { useCallback, useEffect, useState } from "react";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import type { Resume } from "@/types/resume";
import { uploadFile } from "@/actions/FileUpload";

export type UseResumesOptions = {
  /** When false, skips initial fetch (e.g. public pages before login). Default true. */
  enabled?: boolean;
};

export type GeneratedCV = {
  id: number | string;
  title?: string;
  content?: string;
  pdf_path: string;
  created_at: string;
};

export function useResumes(options?: UseResumesOptions) {
  const enabled = options?.enabled ?? true;

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [generatedResumes, setGeneratedResumes] = useState<GeneratedCV[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refreshList = useCallback(async () => {
    const res = await dashboardServerFetch<any>("jobseeker/resumes", { method: "GET" });
    const list = Array.isArray(res?.data) ? (res.data as Resume[]) : [];
    const generated = Array.isArray(res?.generated_resumes) ? res.generated_resumes : [];

    // Sort to put default at the top
    const sortedList = [...list].sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));

    setResumes(sortedList);
    setGeneratedResumes(generated);
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

  // const upload = useCallback(
  //   async (file: File) => {
  //     try {
  //       console.log(" Initiating resume upload:", file.name, file.type, file.size);
  //       setError(null);
  //       setLoading(true);
  //       const formData = new FormData();
  //       formData.append("resume", file);
  //       formData.append("title", file.name);

  //       const res = await uploadFile<any>("jobseeker/resumes", file, {
  //         method: "POST",
  //         data: formData,
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       });

  //       console.log(">>> Resume upload response:", res);
  //       await refreshList();
  //     } catch (e: unknown) {
  //       console.error(">>> Resume upload error:", e);
  //       const msg = e instanceof Error ? e.message : "Failed to upload resume";
  //       setError(msg);
  //       throw e;
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [refreshList]
  // );

  const upload = useCallback(
    async (file: File) => {
      try {
        console.log("Initiating resume upload:", file.name);

        setError(null);
        setLoading(true);

        const formData = new FormData();
        formData.append("file", file); // backend field name
        // formData.append("title", file.name);

        const res = await uploadFile<any>("jobseeker/resumes", {
          method: "POST",
          data: formData,
          // ❌ REMOVE THIS:
          // headers: { "Content-Type": "multipart/form-data" }
        });

        console.log(">>> Resume upload response:", res);
        await refreshList();
      } catch (e: unknown) {
        console.error(">>> Resume upload error:", e);
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
        await dashboardServerFetch<any>(`jobseeker/resumes/${id}/default`, { method: "PUT" });
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
    generatedResumes,
    loading,
    error,
    fetchResumes,
    upload,
    remove,
    setDefault,
  };
}
