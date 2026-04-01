import { useState, useCallback } from "react";
import { fetchAPI } from "@/services/api/client";

export function useBookmarks() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAPI<any>("jobseeker/bookmarks");
      return res.data || res;
    } catch (err: any) {
      setError(err.message || "Failed to fetch saved jobs");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bookmarkJob = async (jobId: number | string) => {
    try {
      setLoading(true);
      setError(null);
      return await fetchAPI<any>(`jobseeker/jobs/${jobId}/bookmark`, {
        method: "POST",
      });
    } catch (err: any) {
      setError(err.message || "Failed to save job");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (jobId: number | string) => {
    try {
      setLoading(true);
      setError(null);
      return await fetchAPI<any>(`jobseeker/jobs/${jobId}/bookmark`, {
        method: "DELETE",
      });
    } catch (err: any) {
      setError(err.message || "Failed to remove saved job");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, getBookmarks, bookmarkJob, removeBookmark };
}
