"use client";

import { useEffect, useState } from "react";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import type { DashboardRole } from "@/types/session";

export type ClientSessionUser = {
  name: string;
  email: string;
  role: DashboardRole;
};

let sessionPromise: Promise<ClientSessionUser | null> | null = null;

function normalizeRole(raw: unknown): DashboardRole {
  const s = String(raw ?? "")
    .toLowerCase()
    .replace(/\s+/g, "_");
  if (s.includes("employer")) return "employer";
  if (s.includes("recruiter")) return "recruiter";
  return "job_seeker";
}

function mapPayload(data: Record<string, unknown>): ClientSessionUser | null {
  const email = String(data.email ?? "").trim();
  const id = data.id ?? data.user_id;
  if (!email && (id === undefined || id === null || id === "")) return null;
  const name =
    String(data.f_name ?? data.name ?? data.full_name ?? data.company_name ?? "").trim() ||
    (email ? email.split("@")[0] : "User");
  return {
    name,
    email,
    role: normalizeRole(data.user_type ?? data.role),
  };
}

/**
 * Shared cookie-backed session probe for client components (no React context).
 * Deduplicates in-flight requests across the tree.
 */

export function getSharedClientSession(): Promise<ClientSessionUser | null> {
  if (sessionPromise) return sessionPromise;
  sessionPromise = (async () => {
    const tryEndpoints = ["auth/profile", "jobseeker/profile", "employer/profile", "recruiter/profile"];
    for (const ep of tryEndpoints) {
      try {
        const res = await dashboardServerFetch<unknown>(ep, { method: "GET" });
        const body = res as Record<string, unknown>;
        if (body?.status === false) continue;

        // Extract nested profile data: { data: { employer: {...} } } etc.
        const data = (
          (body?.data as any)?.employer ?? 
          (body?.data as any)?.job_seeker ?? 
          (body?.data as any)?.recruiter ?? 
          body?.data ?? 
          body?.user ?? 
          body
        ) as unknown;

        if (!data || typeof data !== "object") continue;
        const mapped = mapPayload(data as Record<string, unknown>);
        if (mapped) return mapped;
      } catch {
        /* try next */
      }
    }
    return null;
  })();
  return sessionPromise;
}

export function resetSharedClientSession() {
  sessionPromise = null;
}

export function useClientSession() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<ClientSessionUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSharedClientSession().then((u) => {
      if (!cancelled) {
        setUser(u);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    loading,
    isLoggedIn: !!user,
    user,
    role: user?.role ?? null,
  };
}
