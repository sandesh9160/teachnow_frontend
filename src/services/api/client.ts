// src/services/api/client.ts
import axios from "axios";
import { BASE_URL, IMAGE_BASE_URL } from "@/services/api/config";
import { toast } from "sonner";
import { clearAuthCookies } from "@/lib/api";

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
    revalidate?: number;
    silentStatusCodes?: number[];
    auth?: boolean; // ✅ Include cookies & CSRF for auth
    signal?: AbortSignal;
};

const CACHE_STRATEGIES: Record<string, number> = {
    // 300 seconds (5 minutes) for jobs, stats, blogs, and frequently changing content
    "/open/home/featured-jobs": 300,
    "/open/home/stats": 300,
    "/open/blogs/latest": 300,
    "/open/blogs": 300,
    
    // 900 seconds (15 minutes) for CMS/layout content
    "/open/home/navigation": 900,
    "/open/home/footer": 900,
    "/open/home/hero-section": 900,
    "/open/categories": 900,
    "/open/home/featured-companies": 900,
    "/open/locations": 900,
    "/open/home/testimonials": 900,
    "/open/home/faqs": 900,
    "/open/about-us": 900,
    "/open/terms-conditions": 900,
    "/open/privacy-policy": 900,
    "/open/cv-templates": 900,
    "/open/plans": 900,
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
        "Accept": "application/json",
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
        "Accept": "application/json",
        "Content-Type": "application/json",
    },
});

// Global 401 Interceptor for session expiry
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        if (typeof window !== "undefined" && status === 401) {
            if (!(window as any)._isSessionExpiredHandled) {
                (window as any)._isSessionExpiredHandled = true;

                toast.error("Session expired. Please login again");

                // 2. Clear frontend state (if any)
                clearAuthCookies();

                setTimeout(() => {
                    const currentPath = window.location.pathname;
                    window.location.href = `/auth/login?session_expired=1&redirect=${encodeURIComponent(currentPath)}`;
                }, 800);
            }
        }
        return Promise.reject(error);
    }
);

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

    // Server-side optimization: Use native fetch for Data Cache support
    if (typeof window === "undefined") {
        const url = `${BASE_URL}${normalizeEndpoint(endpoint)}`;
        try {
            // Determine explicit cache duration
            let revalidate = 0;
            if (method === "GET") {
                if (options.cache === "no-store" || options.cache === "no-cache") {
                    revalidate = 0;
                } else if (options.revalidate !== undefined) {
                    revalidate = options.revalidate;
                } else {
                    const cleanPath = endpoint.split("?")[0];
                    const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
                    revalidate = CACHE_STRATEGIES[normalizedPath] ?? 0;
                }
            }

            const res = await fetch(url, {
                method,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    ...(options.headers || {}),
                },
                body: options.body ? JSON.stringify(options.body) : undefined,
                next: { revalidate },
                signal: options.signal,
            });

            if (!res.ok && !silentCodes.includes(res.status)) {
                // Return empty/safe data for handled status codes
                if (silentCodes.includes(res.status)) return {} as T;
            }

            const data = await res.json();
            return data as T;
        } catch (error: any) {
            if (options.silentStatusCodes?.includes(500)) return {} as T;
            throw error;
        }
    }

    // Client-side: Keep Axios for withCredentials, CSRF, and interceptors
    try {
        if (method !== "GET") {
            await getCsrfCookie();
        }

        const res = await api.request<T>({
            url: normalizeEndpoint(endpoint),
            method,
            data: options.body,
            headers: options.headers ?? {},
            withCredentials: true,
            signal: options.signal,
        });
        return res.data;
    } catch (error: any) {
        const status = error?.response?.status;
        const finalError = {
            message: error?.response?.data?.message || error?.message || "Request failed",
            status,
            data: error?.response?.data,
        };

        if (!silentCodes.includes(finalError?.status)) {
            // console.error("fetchAPI error:", finalError);
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
    //console.log("[API] Fetching CSRF cookie...");
    await apiSanctum.get("/sanctum/csrf-cookie", { withCredentials: true });
}