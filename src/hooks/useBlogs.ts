import { fetchAPI, normalizeMediaUrl } from "@/services/api/client";
import { Blog, ApiResponse } from "@/types/homepage";

/* -------------------- HELPERS -------------------- */

/**
 * Normalizes a blog object from the backend.
 * Minimal normalization only (media URLs).
 */
function normalizeBlog(blog: any): Blog {
  if (!blog) return {} as Blog;

  // Minimal normalization for image fields
  return {
    ...blog,
    image: normalizeMediaUrl(blog.image || blog.featured_image || blog.thumbnail),
  };
}

/**
 * Safe array extraction without scanning.
 */
function toArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

/* -------------------- API METHODS -------------------- */

/**
 * Fetch blogs directly.
 * One function = One API.
 * Endpoint: /open/blogs
 */
export async function getBlogs(filters: Record<string, any> = {}): Promise<Blog[]> {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.append(k, v.toString());
    });

    const query = params.toString();
    const res = await fetchAPI<ApiResponse<any>>(`/open/blogs${query ? "?" + query : ""}`);

    const data = res.data || res;
    return toArray<Blog>(data).map(normalizeBlog);
  } catch (error) {
    //console.error("Error in getBlogs:", error);
    return [];
  }
}

/**
 * Fetch a single blog by its ID or SLUG.
 * Endpoint: /open/blogs/{id_or_slug}
 */
export async function getBlogById(idOrSlug: string | number): Promise<{ blog: Blog | null; related: Blog[] }> {
  const cleanId = (idOrSlug || "").toString().replace(/^[:/]+/, "").replace(/\/+$/, "").trim();
  if (!cleanId) return { blog: null, related: [] };

  try {
    const res = await fetchAPI<ApiResponse<any>>(`/open/blogs/${cleanId}`);
    const data = res.data || res;

    if (!data) return { blog: null, related: [] };

    return {
      blog: normalizeBlog(data.blog || data),
      related: toArray<Blog>(data.similar_blogs || data.related_blogs).map(normalizeBlog)
    };
  } catch (error) {
    //console.error(`Error in getBlogById(${idOrSlug}):`, error);
    return { blog: null, related: [] };
  }
}

// Alias for consistency
export const getBlogBySlug = getBlogById;

/**
 * Fetch latest blogs.
 * Endpoint: /open/blogs/latest
 */
export async function getLatestBlogs(): Promise<Blog[]> {
  try {
    const res = await fetchAPI<ApiResponse<any>>("/open/blogs/latest");
    const data = res.data || res;
    return toArray<Blog>(data).map(normalizeBlog);
  } catch (error) {
    //console.error("Error in getLatestBlogs:", error);
    return [];
  }
}
