"use client";
import { useCallback, useEffect, useState } from "react";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import type { DashboardStats } from "@/types/dashboard";

export function useDashboard() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await dashboardServerFetch<any>("jobseeker/dashboard", { method: "GET" });
      if (res?.status) {
        // New users may have null/empty data — treat as a valid empty state
        setData(res.data ?? null);
      } else {
        // "profile not found" = new user with no profile yet — show empty state, not error
        const msg: string = res?.message ?? "";
        const isNewUser = msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("no profile");
        if (isNewUser) {
          setData(null); // empty state — dashboard shows zeros gracefully
        } else {
          setData(null);
          setError(msg || "Failed to load dashboard");
        }
      }
    } catch (e: unknown) {
      setData(null);
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, error, fetch: fetchDashboard, refetch: fetchDashboard };
}
