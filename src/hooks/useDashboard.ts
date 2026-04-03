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
      if (res?.status && res.data) {
        setData(res.data);
      } else {
        setData(null);
        setError("Failed to load dashboard");
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
