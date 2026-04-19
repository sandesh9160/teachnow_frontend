import { useCallback, useState, useEffect } from "react";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import type { Job } from "@/types/homepage";

type Bookmark = Job & { id: number | string };

// Global cache to prevent redundant fetches and share state across cards
let globalBookmarks: Bookmark[] = [];
let globalLoading = false;
let globalFetched = false;
let fetchPromise: Promise<void> | null = null;
const listeners = new Set<(bookmarks: Bookmark[]) => void>();

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(globalBookmarks);
  const [loading, setLoading] = useState(globalLoading);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listeners.add(setBookmarks);
    // Auto-fetch if not already fetched
    if (!globalFetched && !fetchPromise) {
      void fetchBookmarks();
    }
    return () => {
      listeners.delete(setBookmarks);
    };
  }, []);

  const notify = (updated: Bookmark[]) => {
    globalBookmarks = updated;
    listeners.forEach((fn) => fn([...updated])); // pass new array reference to trigger re-renders
  };

  const fetchBookmarks = useCallback(async (force = false) => {
    if (globalFetched && !force) return;
    if (fetchPromise && !force) return fetchPromise;

    fetchPromise = (async () => {
      try {
        setLoading(true);
        globalLoading = true;
        setError(null);
        const res = await dashboardServerFetch<any>("jobseeker/bookmarks", { method: "GET" });

        if (res?.status === false) {
          notify([]);
          return;
        }

        const rawData = res?.data || [];
        const mappedJobs = rawData.map((item: any) => ({
          ...item.job,
          bookmarkId: item.id,
          bookmarkedAt: item.created_at
        }));
        notify(mappedJobs);
        globalFetched = true;
      } catch (err: any) {
        notify([]);
        setError(err?.message || "Failed to fetch saved jobs");
      } finally {
        setLoading(false);
        globalLoading = false;
        fetchPromise = null;
      }
    })();
    return fetchPromise;
  }, []);

  const toggleBookmark = useCallback(
    async (jobId: number | string) => {
      try {
        setLoading(true);
        setError(null);

        const isAlreadyBookmarked = globalBookmarks.some((job) => String(job.id) === String(jobId));
        const method = isAlreadyBookmarked ? "DELETE" : "POST";

        // Optimistic UI toggle could go here, but let's just await the server for accuracy
        const res = await dashboardServerFetch<any>(`jobseeker/jobs/${jobId}/bookmark`, { method });

        if (res?.status === false) {
          throw new Error(res.message || "Failed to update bookmark");
        }

        await fetchBookmarks(true); // pass true to force a refetch
      } catch (err: any) {
        setError(err?.message || "Failed to update bookmark");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchBookmarks]
  );

  return { bookmarks, loading, error, fetchBookmarks, toggleBookmark };
}


