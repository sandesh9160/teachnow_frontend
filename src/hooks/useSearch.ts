import { fetchAPI } from "@/services/api/client";
import { Job, ApiResponse } from "@/types/homepage";

export interface SearchSuggestions {
  roles: string[];
  cities: string[];
}

/**
 * Safe array extraction without scanning.
 */
function toArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

/**
 * Fetch search suggestions.
 * Endpoint: /search/suggestions?keyword=
 */
export async function getSearchSuggestions(query: string): Promise<SearchSuggestions> {
  try {
    const res = await fetchAPI<ApiResponse<any>>(`/open/search/suggestions?keyword=${encodeURIComponent(query)}`);
    const data = res.data;

    // The backend now returns { status: true, data: { suggestions: string[], locations: string[] } }
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return {
        roles: toArray<string>(data.suggestions || []),
        cities: toArray<string>(data.locations || [])
      };
    }

    // Fallback for flat array responses
    if (Array.isArray(data)) {
      return {
        roles: data,
        cities: data
      };
    }

    // Default return
    return { roles: [], cities: [] };
  } catch (error) {
    //console.error("Error fetching suggestions:", error);
    return { roles: [], cities: [] };
  }
}

/**
 * Search jobs using keyword and location.
 * Endpoint: /open/search/jobs/search?keyword=&location=
 */
export async function searchJobs(keyword: string, location: string): Promise<Job[]> {
  try {

    // Restored /open prefix based on user's original API confirmation
    //console.log(`url : /open/search/jobs/search?keyword=${encodeURIComponent(keyword.trim())}&location=${encodeURIComponent(location.trim())}`)
    const res = await fetchAPI<ApiResponse<any>>(`/open/search/jobs/search?keyword=${encodeURIComponent(keyword.trim())}&location=${encodeURIComponent(location.trim())}`);
    const data = res.data || res;
    //console.log("searchJobs", data);

    return toArray<Job>(data);
  } catch (error: any) {
    if (error.status !== 404 && error.status !== 500) {
      //console.error("Error searching jobs:", error);
    }
    return [];
  }
}
