import "server-only";

import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { redirect } from "next/navigation";
import type { DashboardRole } from "@/types/session";
import { cookies } from "next/headers";

export type ServerSessionUser = {
  id: number;
  email: string;
  name: string;
  role: DashboardRole;
  avatar?: string;
  raw?: Record<string, unknown>;
};

function normalizeDashboardRole(raw: unknown): DashboardRole {
  const s = String(raw ?? "")
    .toLowerCase()
    .replace(/\s+/g, "_");
  if (s.includes("employer")) return "employer";
  if (s.includes("recruiter")) return "recruiter";
  return "job_seeker";
}

async function tryUserDataCookie(): Promise<Record<string, unknown> | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("userData")?.value;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

function pickProfilePayload(res: unknown): Record<string, unknown> | null {
  if (!res || typeof res !== "object") return null;
  const r = res as Record<string, unknown>;
  if (r.status === false) return null;
  
  // Exhaustive check for the actual user/profile data in the response
  // Responses can be { data: { employer: {...} } } or { data: {...} } or { user: {...} } or {...}
  const inner = (
    (r.data as any)?.employer ?? 
    (r.data as any)?.job_seeker ?? 
    (r.data as any)?.recruiter ?? 
    r.data ?? 
    r.user ?? 
    r
  ) as unknown;
  
  if (!inner || typeof inner !== "object") return null;
  return inner as Record<string, unknown>;
}

function toSessionUser(data: Record<string, unknown>): ServerSessionUser | null {
  const id = Number(data.id ?? data.user_id ?? (data.user as any)?.id ?? 0);
  const email = String(data.email ?? (data.user as any)?.email ?? "").trim();
  if (!id && !email) return null;

  const name =
    String(
      data.name ??
      (data.user as any)?.name ??
      data.f_name ??
      data.full_name ??
      data.company_name ??
      ""
    ).trim() || (email ? email.split("@")[0] : "User");

  const role = normalizeDashboardRole(data.user_type ?? data.role ?? (data.user as any)?.user_type);
  const pic = data.profile_pic ?? data.profile_photo ?? data.company_logo ?? (data.user as any)?.profile_pic;
  const avatar =
    typeof pic === "string" && pic
      ? pic
      : name
        ? name.charAt(0).toUpperCase()
        : undefined;
  return {
    id,
    email,
    name,
    role,
    avatar,
    raw: data,
  };
}

/**
 * Current session from cookie-backed API. Tries the role-specific profile first if known.
 */
export async function getSessionProfile(): Promise<ServerSessionUser | null> {
  const role = await getRole();
  const endpoints = ["auth/profile"];
  
  if (role === "job_seeker") endpoints.unshift("jobseeker/profile");
  else if (role === "employer") endpoints.unshift("employer/profile");
  else if (role === "recruiter") endpoints.unshift("recruiter/profile");

  // Also include the others as fallback
  const allEndpoints = Array.from(new Set([...endpoints, "jobseeker/profile", "employer/profile", "recruiter/profile", "auth/profile"]));

  for (const ep of allEndpoints) {
    try {
      const res = await dashboardServerFetch<unknown>(ep, { method: "GET" });
      const data = pickProfilePayload(res);
      if (!data) continue;
      const user = toSessionUser(data);
      if (user) return user;
    } catch {
      /* next endpoint */
    }
  }

  // Fallback to cookie if API endpoints fail or are unavailable
  const cookieUser = await tryUserDataCookie();
  if (cookieUser) {
    const user = toSessionUser(cookieUser);
    if (user) return user;
  }

  return null;
}

export function sessionUserForHeader(user: ServerSessionUser | null): {
  name: string;
  email: string;
  role: DashboardRole;
  avatar?: string;
  isActive?: boolean;
} | null {
  if (!user) return null;
  return {
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isActive: Boolean(user.raw?.is_active || (user.raw?.user as any)?.is_active),
  };
}

const LOGIN_WITH_MSG = "/auth/login?message=" + encodeURIComponent("Please login to access this page");

export async function requireSessionRole(expected: DashboardRole): Promise<ServerSessionUser> {
  const profile = await getSessionProfile();
  if (!profile) {
    redirect(LOGIN_WITH_MSG);
  }
  if (profile.role !== expected) {
    redirect(
      profile.role === "employer" ? "/dashboard/employer" : "/dashboard/jobseeker"
    );
  }
  return profile;
}


export async function getRole(): Promise<DashboardRole | null> {
  const cookieStore = await cookies();
  const userData = cookieStore.get("userData");
  const user = userData ? JSON.parse(userData.value) : null;
  return user?.user_type as DashboardRole | null;
}