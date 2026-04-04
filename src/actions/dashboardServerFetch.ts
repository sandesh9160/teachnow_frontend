"use server";

import { api } from "@/lib/api";
import { cookies } from "next/headers";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * Dashboard Server Fetch - Uses api.ts for authenticated requests
 * Automatically forwards cookies from Next.js request to API
 * 
 * @param endpoint - API endpoint (e.g., "/user/dashboard" or "/current/user/details")
 *                   Endpoints starting with "/current/" use apiSanctum (root level)
 *                   Other endpoints use api (under /api)
 * @param options - Axios request options (data, method, etc.)
 * @returns Promise with response data
 */
export const dashboardServerFetch = async <T = any>(
    endpoint: string,
    options?: AxiosRequestConfig & { data?: any }
): Promise<T> => {
    try {
        const cookieStore = await cookies();

        // Format cookies from Next.js request for API call
        const cookieHeader = cookieStore
            .getAll()
            .map((cookie) => `${cookie.name}=${cookie.value}`)
            .join("; ");

        // Remove leading slash if present
        const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

        // All dashboard calls use the shared API client (cookies forwarded below).
        const apiInstance = api;

        // Prepare headers with cookies
        const headers = {
            ...(options?.headers || {}),
            ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        };

        // Determine method from options or default to GET
        const method = (options?.method?.toLowerCase() || "get") as "get" | "post" | "put" | "delete" | "patch";

        // Prepare request config
        const requestConfig: AxiosRequestConfig = {
            ...options,
            headers,
            // Remove data from config (it's passed separately to axios methods)
            data: options?.data,
        };

        let response: AxiosResponse<T>;

        switch (method) {
            case "get":
                response = await apiInstance.get<T>(`/${cleanEndpoint}`, requestConfig);
                break;
            case "post":
                response = await apiInstance.post<T>(`/${cleanEndpoint}`, options?.data, requestConfig);
                break;
            case "put":
                response = await apiInstance.put<T>(`/${cleanEndpoint}`, options?.data, requestConfig);
                break;
            case "delete":
                response = await apiInstance.delete<T>(`/${cleanEndpoint}`, requestConfig);
                break;
            case "patch":
                response = await apiInstance.patch<T>(`/${cleanEndpoint}`, options?.data, requestConfig);
                break;
            default:
                response = await apiInstance.get<T>(`/${cleanEndpoint}`, requestConfig);
        }
        // console.log("response : ", response);
        console.log("response.data : ", response.data);
        console.log("response.status : ", response.status);
        // console.log("response.statusText : ", response.statusText);
        // console.log("response.headers : ", response.headers);
        // console.log("response.config : ", response.config);
        // console.log("response.request : ", response.request);
        // console.log("response.status : ", response.status);
        // console.log("response.statusText : ", response.statusText);
        // console.log("response.headers : ", response.headers);
        // console.log("response.config : ", response.config);
        // console.log("response.request : ", response.request);
        return response.data;
    } catch (error: any) {
        if (error?.response?.status !== 401) {
            console.error("Dashboard server fetch error:", error?.message || error);
        }
        // Return error in same format as old ServerFetch
        let message = "Error occurred";
        let statusCode = 500;

        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            message = error.response.data?.message || error.message || "Request failed";
            statusCode = error.response.status;
        } else if (error.request) {
            // The request was made but no response was received
            message = "No response from server";
            statusCode = 504; // Gateway Timeout or another appropriate status
        } else if (error instanceof Error) {
            // Something happened in setting up the request that triggered an Error
            message = error.message;
        }

        return {
            status: false,
            message,
            statusCode,
        } as T;
    }
};
