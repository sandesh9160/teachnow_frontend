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

function tryUserDataCookie(): Record<string, unknown> | null {
  try {
    const cookies = document.cookie.split(';');
    const userDataCookie = cookies.find(c => c.trim().startsWith('userData='));
    if (!userDataCookie) return null;
    const raw = decodeURIComponent(userDataCookie.split('=')[1]);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

function mapPayload(data: Record<string, unknown>): ClientSessionUser | null {
  const email = String(data.email ?? "").trim();
  const id = data.id ?? data.user_id;
  if (!email && (id === undefined || id === null || id === "")) return null;
  const name = (
    String(data.name || "").trim() ||
    String((data.user as any)?.name || "").trim() ||
    String(data.f_name || "").trim() ||
    String(data.full_name || "").trim() ||
    String(data.company_name || "").trim() ||
    String(data.institution_name || "").trim() ||
    (email ? email.split("@")[0] : "User")
  );
  return {
    name,
    email,
    role: normalizeRole(data.user_type ?? data.role ?? (data.user as any)?.user_type),
  };
}

/**
 * Shared cookie-backed session probe for client components (no React context).
 * Deduplicates in-flight requests across the tree.
 */

export function getSharedClientSession(): Promise<ClientSessionUser | null> {
  if (sessionPromise) return sessionPromise;
  sessionPromise = (async () => {
    // 1. Try cookie first (fastest and usually contains personal f_name like "Kiran")
    const cookieUser = tryUserDataCookie();
    if (cookieUser) {
      const mapped = mapPayload(cookieUser);
      if (mapped && mapped.name !== "User" && !mapped.name.includes("@")) {
        return mapped;
      }
    }

    // 2. Fallback to API probes if cookie is missing or has generic name
    const tryEndpoints = ["recruiter/profile", "recruiter/company-profile", "employer/profile", "employer/company-profile", "jobseeker/profile", "auth/profile"];
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
        if (mapped) {
          // High-Fidelity: For recruiters, we often need the company name/logo which is in a separate endpoint
          if (mapped.role === "recruiter") {
            try {
              const compRes = await dashboardServerFetch<any>("recruiter/company-profile", { method: "GET" });
              if (compRes?.status && compRes?.data) {
                if (compRes.data.company_logo) (mapped as any).avatar = compRes.data.company_logo;
              }
            } catch { /* ignore */ }
          }
          return mapped;
        }
      } catch {
        /* try next */
      }
    }

    // Final fallback to cookie if all API endpoints fail
    if (cookieUser) {
      return mapPayload(cookieUser);
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
