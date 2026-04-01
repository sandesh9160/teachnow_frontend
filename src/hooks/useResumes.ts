import { useState, useCallback } from "react";
import { fetchAPI } from "@/services/api/client";

export function useResumes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getResumes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAPI<any>("jobseeker/resumes");
      return res.data || res;
    } catch (err: any) {
      setError(err.message || "Failed to fetch resumes");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadResume = async (formData: FormData) => {
    try {
      setLoading(true);
      setError(null);
      // We pass form data, so we don't set Content-Type header to allow browser to boundary
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://teachnowbackend.jobsvedika.in:8080/api"}/jobseeker/resumes`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "Accept": "application/json",
        }
      });
      if (!res.ok) throw new Error("Failed to upload resume");
      return await res.json();
    } catch (err: any) {
      setError(err.message || "Failed to upload resume");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setDefaultResume = async (id: number | string) => {
    try {
      setLoading(true);
      setError(null);
      return await fetchAPI<any>(`jobseeker/resumes/${id}/default`, {
        method: "POST",
      });
    } catch (err: any) {
      setError(err.message || "Failed to set default resume");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (id: number | string) => {
    try {
      setLoading(true);
      setError(null);
      return await fetchAPI<any>(`jobseeker/resumes/${id}`, {
        method: "DELETE",
      });
    } catch (err: any) {
      setError(err.message || "Failed to delete resume");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, getResumes, uploadResume, setDefaultResume, deleteResume };
}
