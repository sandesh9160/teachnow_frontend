import { useState, useCallback } from "react";
import { fetchAPI } from "@/services/api/client";

export function useApplications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAPI<any>("jobseeker/applications");
      return res.data || res;
    } catch (err: any) {
      setError(err.message || "Failed to fetch applications");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getShortlisted = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAPI<any>("jobseeker/shortlisted");
      return res.data || res;
    } catch (err: any) {
      setError(err.message || "Failed to fetch shortlisted jobs");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const applyJob = async (jobId: string | number, data: any = {}) => {
    try {
      setLoading(true);
      setError(null);
      return await fetchAPI<any>(`jobseeker/jobs/${jobId}/apply`, {
        method: "POST",
        body: data,
      });
    } catch (err: any) {
      setError(err.message || "Failed to apply for job");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const withdrawApplication = async (applicationId: number | string) => {
    try {
      setLoading(true);
      setError(null);
      return await fetchAPI<any>(`jobseeker/applications/${applicationId}`, {
        method: "DELETE",
      });
    } catch (err: any) {
      setError(err.message || "Failed to withdraw application");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, getApplications, getShortlisted, applyJob, withdrawApplication };
}
