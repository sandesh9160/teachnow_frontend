// src/services/api/client.ts
import axios from "axios";
import { BASE_URL, IMAGE_BASE_URL } from "@/services/api/config";

// -----------------------------
// Utility: Normalize Media URL
// -----------------------------
/**
 * Converts a relative media path into a full URL.
 * If the path is already absolute, it returns as-is.
 */
export function normalizeMediaUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const cleanBase = IMAGE_BASE_URL.endsWith("/")
    ? IMAGE_BASE_URL.slice(0, -1)
    : IMAGE_BASE_URL;
  const cleanPath = path.replace(/^\/+/, "");

  return `${cleanBase}/${cleanPath}`;
}

// -----------------------------
// Type Definition for Options
// -----------------------------
export type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  headers?: Record<string, string>;
  cache?: RequestCache;
  revalidate?: number | false;
  silentStatusCodes?: number[];
  auth?: boolean; // ✅ Include cookies & CSRF for auth
};

const BACKEND_ROOT = new URL(BASE_URL).origin;

// Axios instance for Sanctum CSRF endpoint (/sanctum/*)
export const apiSanctum = axios.create({
  baseURL: BACKEND_ROOT,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});


// Axios instance for API routes (/api/*)
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Axios instance for Sanctum auth endpoints without /api prefix (/auth/*)
export const authApi = axios.create({
  baseURL: BACKEND_ROOT,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

function normalizeEndpoint(endpoint: string): string {
  if (!endpoint) return "";
  return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
}

// -----------------------------
// Generic API Wrapper
// -----------------------------
/**
 * fetchAPI is the main wrapper to call backend endpoints.
 * Supports CSRF, cookies, silent status codes, and POST/PUT/DELETE requests.
 */
export async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  // Skip requests for favicon
  if (endpoint.endsWith(".ico")) return {} as T;

  const method = options.method ?? "GET";
  const silentCodes = options.silentStatusCodes ?? [404];

  // console.log(`[Frontend Client] ${method} ${endpoint}`, { auth: options.auth });

  try {
    // Sanctum CSRF preflight for browser-side mutations
    if (method !== "GET") {
      console.log(`[API] CSRF preflight for ${method} ${endpoint}`);
      await getCsrfCookie();
    }

    if (typeof document !== "undefined") {
      console.log("[API] Current Document Cookies:", document.cookie);
    }

    console.log(`[API] ${method} ${endpoint}`, options.body ? { body: options.body } : "");

    const res = await api.request<T>({
      url: normalizeEndpoint(endpoint),
      method,
      data: options.body,
      headers: options.headers ?? {},
      withCredentials: true,
    });
    console.log(`[API] Success ${method} ${endpoint}`, res.data);
    return res.data;
  } catch (error: any) {
    const finalError = {
      message: error?.response?.data?.message || error?.message || "Request failed",
      status: error?.response?.status,
      data: error?.response?.data,
    };

    if (!silentCodes.includes(finalError?.status)) {
      console.error("fetchAPI error:", finalError);
    }
    throw finalError;
  }
}

// -----------------------------
// Sanctum CSRF helper
// -----------------------------
/**
 * Fetches the CSRF cookie from Laravel Sanctum.
 * Use before making POST/PUT/DELETE requests on client-side.
 */
export async function getCsrfCookie(): Promise<void> {
  console.log("[API] Fetching CSRF cookie...");
  await apiSanctum.get("/sanctum/csrf-cookie", { withCredentials: true });
}