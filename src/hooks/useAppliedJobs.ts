"use client";

import { useCallback, useState, useEffect } from "react";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";

// Global cache to prevent redundant fetches and share state across cards
let globalAppliedJobIds: Set<string> = new Set();
let globalLoading = false;
let globalFetched = false;
let fetchPromise: Promise<void> | null = null;
const listeners = new Set<(appliedJobIds: Set<string>) => void>();

function isJobSeeker(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const cookies = document.cookie.split(";");
    const userDataCookie = cookies.find((c) => c.trim().startsWith("userData="));
    if (!userDataCookie) return false;
    const raw = decodeURIComponent(userDataCookie.split("=")[1]);
    const parsed = JSON.parse(raw);
    const type = String(parsed?.user_type ?? parsed?.role ?? "").toLowerCase();
    return type.includes("jobseeker") || type.includes("job_seeker");
  } catch {
    return false;
  }
}

export function useAppliedJobs() {
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(globalAppliedJobIds);
  const [loading, setLoading] = useState(globalLoading);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listeners.add(setAppliedJobIds);
    
    const isSeeker = isJobSeeker();
    if (!isSeeker) {
      // Clear memory if user logged out or is not a jobseeker
      globalAppliedJobIds = new Set();
      globalFetched = false;
      setAppliedJobIds(new Set());
    } else if (!globalFetched && !fetchPromise) {
      void fetchAppliedJobs();
    }
    
    return () => {
      listeners.delete(setAppliedJobIds);
    };
  }, []);

  const notify = (updated: Set<string>) => {
    globalAppliedJobIds = updated;
    listeners.forEach((fn) => fn(new Set(updated))); // pass new Set reference to trigger re-renders
  };

  const fetchAppliedJobs = useCallback(async (force = false) => {
    if (!isJobSeeker()) {
      notify(new Set());
      return;
    }
    if (globalFetched && !force) return;
    if (fetchPromise && !force) return fetchPromise;

    fetchPromise = (async () => {
      try {
        setLoading(true);
        globalLoading = true;
        setError(null);
        // We set per_page=1000 to fetch all user applications at once
        const res = await dashboardServerFetch<any>("jobseeker/applications?per_page=1000", { method: "GET" });

        if (res?.status === false) {
          notify(new Set());
          return;
        }

        let rawData = [];
        if (Array.isArray(res)) {
          rawData = res;
        } else if (res && typeof res === "object") {
          rawData = res.data?.data || res.data || res.applications || [];
        }

        const jobIds = new Set<string>();
        if (Array.isArray(rawData)) {
          rawData.forEach((item: any) => {
            if (item?.job_id) {
              jobIds.add(String(item.job_id));
            }
          });
        }
        
        notify(jobIds);
        globalFetched = true;
      } catch (err: any) {
        notify(new Set());
        setError(err?.message || "Failed to fetch applied jobs");
      } finally {
        setLoading(false);
        globalLoading = false;
        fetchPromise = null;
      }
    })();
    return fetchPromise;
  }, []);

  const addAppliedJobId = useCallback((jobId: string | number) => {
    const updated = new Set(globalAppliedJobIds);
    updated.add(String(jobId));
    notify(updated);
  }, []);

  const isApplied = useCallback((jobId: string | number) => {
    return appliedJobIds.has(String(jobId));
  }, [appliedJobIds]);

  return { appliedJobIds, loading, error, fetchAppliedJobs, addAppliedJobId, isApplied };
}
