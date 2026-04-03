import { useCallback, useState } from "react";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import type { Job } from "@/types/homepage";

type Bookmark = Job & { id: number | string };

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardServerFetch<any>("jobseeker/bookmarks", { method: "GET" });
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setBookmarks(data);
    } catch (err: any) {
      setBookmarks([]);
      setError(err?.message || "Failed to fetch saved jobs");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleBookmark = useCallback(
    async (jobId: number | string) => {
      try {
        setLoading(true);
        setError(null);

        const isAlreadyBookmarked = bookmarks.some((job) => job.id === jobId);
        const method = isAlreadyBookmarked ? "DELETE" : "POST";

        await dashboardServerFetch<any>(`jobseeker/jobs/${jobId}/bookmark`, { method });
        await fetchBookmarks();
      } catch (err: any) {
        setError(err?.message || "Failed to update bookmark");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [bookmarks, fetchBookmarks]
  );

  return {
    bookmarks,
    loading,
    error,
    fetchBookmarks,
    toggleBookmark,
  };
}
