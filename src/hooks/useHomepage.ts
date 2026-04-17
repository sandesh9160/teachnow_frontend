import { fetchAPI, normalizeMediaUrl } from "@/services/api/client";
import { Pagination } from "@/types/homepage";
import {
  Job,
  Institution,
  City,
  HeroResponse,
  Stats,
  TestimonialData,
  ApiResponse,
  NavigationData,
  ResourceData,
  Category,
} from "@/types/homepage";

/* -------------------- HELPERS -------------------- */

/**
 * TRUSTS backend response structure.
 * Minimal normalization for media URLs only.
 */
function normalizeInstitution(institution: any): Institution {
  if (!institution) return {} as Institution;
  const rawLogo =
    institution.company_logo ?? institution.logo ?? institution.company_image ?? institution.company_logo_url ?? null;
  return {
    ...institution,
    company_logo: normalizeMediaUrl(rawLogo),
  };
}

function normalizeTestimonial(testimonial: any): TestimonialData {
  if (!testimonial) return {} as TestimonialData;
  return {
    ...testimonial,
    photo: normalizeMediaUrl(testimonial.photo),
  };
}

function normalizeJob(job: any): Job {
  if (!job) return {} as Job;
  return {
    ...job,
    employer: job.employer
      ? {
        ...job.employer,
        company_logo: normalizeMediaUrl(
          job.employer.company_logo ??
          job.employer.logo ??
          job.employer.company_image ??
          job.employer.company_logo_url ??
          null
        ),
      }
      : job.employer,
  };
}

/**
 * Standard array extraction without guessing.
 */
export function toArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (Array.isArray(data?.jobs)) return data.jobs;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

/* -------------------- API METHODS -------------------- */

/**
 * Fetch featured jobs.
 * Endpoint: /open/home/featured-jobs
 */
export async function getFeaturedJobs(): Promise<Job[]> {
  try {
    const res = await fetchAPI<ApiResponse<any>>("/open/home/featured-jobs");
    const data = res.data || res;
    return toArray<Job>(data).map(normalizeJob);
  } catch (error) {
    //console.error("Error in getFeaturedJobs hook:", error);
    return [];
  }
}

/**
 * Fetch all open jobs.
 * Endpoint: /open/jobs
 */
export async function getAllJobs(): Promise<Job[]> {
  try {
    const res = await fetchAPI<ApiResponse<any>>("/open/jobs");
    const data = res.data || res;
    return toArray<Job>(data).map(normalizeJob);
  } catch (error) {
    //console.error("Error in getAllJobs hook:", error);
    return [];
  }
}

/**
 * Fetch featured institutions.
 * Endpoint: /open/home/featured-companies
 */
export async function getFeaturedInstitutions(): Promise<Institution[]> {
  try {
    const res = await fetchAPI<ApiResponse<any>>("/open/home/featured-companies");
    const data = res.data || res;
    return toArray<Institution>(data).map(normalizeInstitution);
  } catch (error) {
    //console.error("Error in getFeaturedInstitutions hook:", error);
    return [];
  }
}

/**
 * Fetch top locations.
 * Endpoint: /open/locations
 */
export async function getTopCities(): Promise<City[]> {
  try {
    const res = await fetchAPI<ApiResponse<any>>("/open/locations");
    const data = res.data || res;
    return toArray<City>(data);
  } catch (error) {
    //console.error("Error in getTopCities hook:", error);
    return [];
  }
}

/**
 * Fetch job categories.
 * Endpoint: /open/categories
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetchAPI<ApiResponse<any>>("/open/categories");
    const data = res.data || res;
    return toArray(data);
  } catch (error) {
    //console.error("Error in getCategories hook:", error);
    return [];
  }
}

/**
 * Fetch combined filter payload.
 * Endpoint: /open/filters
 */
export async function getFilters(): Promise<{
  categories: any[];
  locations: any[];
}> {
  try {
    const res = await fetchAPI<ApiResponse<any>>("/open/filters");
    const data = res.data || (res as any);

    return {
      categories: Array.isArray(data?.categories) ? data.categories : [],
      locations: Array.isArray(data?.locations) ? data.locations : [],
    };
  } catch (error) {
    //console.error("Error fetching filters:", error);
    return { categories: [], locations: [] };
  }
}

/**
 * Fetch Hero section.
 * Endpoint: /open/home/hero-section
 */
export async function getHeroSection(): Promise<HeroResponse | null> {
  try {
    const res = await fetchAPI<ApiResponse<any>>("/open/home/hero-section");
    const data = res.data || res;

    // Minimal normalization for background images
    const hero = data?.hero
      ? {
        ...data.hero,
        background_image: normalizeMediaUrl(data.hero.background_image),
      }
      : null;

    if (!hero) return null;

    const rawCta = Array.isArray(data?.cta)
      ? data.cta
      : data?.cta
        ? [data.cta]
        : [];

    const cta = rawCta.map((item: any) => ({
      ...item,
      background_image: normalizeMediaUrl(item?.background_image),
    }));

    return {
      status: true,
      data: {
        hero,
        cta,
      },
    } as HeroResponse;
  } catch (error) {
    //console.error("Error fetching Hero Section API:", error);
    return null;
  }
}

/**
 * Fetch Stats section.
 * Endpoint: /open/home/stats
 */
export async function getStats(): Promise<Stats | null> {
  try {
    const res = await fetchAPI<ApiResponse<Stats>>("/open/home/stats");
    return res.data || (res as any).stats || null;
  } catch (error) {
    //console.error("Error fetching Stats API:", error);
    return null;
  }
}

/**
 * Fetch Testimonials.
 * Endpoint: /open/home/testimonials
 */
export async function getTestimonials(): Promise<TestimonialData[]> {
  try {
    const res = await fetchAPI<ApiResponse<any>>("/open/home/testimonials");
    const data = res.data || res;
    return toArray<TestimonialData>(data).map(normalizeTestimonial);
  } catch (error) {
    //console.error("Error in getTestimonials hook:", error);
    return [];
  }
}

/**
 * Fetch FAQs.
 * Endpoint: /open/home/faqs
 */
export async function getFAQs(): Promise<any[]> {
  try {
    const res = await fetchAPI<ApiResponse<any>>("/open/home/faqs");
    const data = res.data || res;
    return toArray(data);
  } catch (error) {
    //console.error("Error in getFAQs hook:", error);
    return [];
  }
}

/**
 * Fetch Navigation.
 * Endpoint: /open/home/navigation
 */
export async function getNavigation(): Promise<NavigationData | null> {
  try {
    const res = await fetchAPI<ApiResponse<NavigationData>>("/open/home/navigation");
    return res.data || (res as any);
  } catch (error: any) {
    if (error.status !== 404 && error.status !== 500) {
      //console.error(`Error in getNavigation hook:`, error); // Changed message to be specific to getNavigation
    }
    return null;
  }
}

/**
 * Fetch Footer.
 * Endpoint: /open/home/footer
 */
export async function getFooter(): Promise<any> {
  try {
    const res = await fetchAPI<ApiResponse<any>>("/open/home/footer");
    return res.data || (res as any);
  } catch (error) {
    //console.error("Error in getFooter hook:", error);
    return null;
  }
}

/**
 * Fetch teaching resources.
 * Endpoint: /open/resources
 */

export async function getResourceBySlug(
  slug: string
): Promise<{ resource: ResourceData; similar_resources: ResourceData[] } | null> {
  try {
    const res = await fetchAPI<ApiResponse<any>>(
      `/open/resources/${slug}`
    );

    const rootData = res.data || res;

    // Check if it has the nested 'resource' structure
    const data = rootData.resource ? rootData.resource : rootData;
    const similar = rootData.similar_resources || [];

    if (!data || !data.id) return null;

    return {
      resource: {
        ...data,
        resource_photo: normalizeMediaUrl(data.resource_photo),
        author_photo: normalizeMediaUrl(data.author_photo),
        pdf: normalizeMediaUrl(data.pdf),
      },
      similar_resources: similar.map((s: any) => ({
        ...s,
        resource_photo: normalizeMediaUrl(s.resource_photo),
      }))
    };
  } catch (err) {
    //console.error("getResourceBySlug error:", err);
    return null;
  }
}
export async function getResources(page = 1, perPage = 10): Promise<{ data: ResourceData[]; pagination?: Pagination }> {
  try {
    const res = await fetchAPI<ApiResponse<ResourceData[]>>(`/open/resources?page=${page}&per_page=${perPage}`);
    const rootData = res.data || res;
    
    // Some endpoints wrap the list in 'data' even inside ApiResponse.data
    const list = Array.isArray(rootData) ? rootData : (rootData as any).data || [];
    
    const resources = toArray<ResourceData>(list).map((resource) => ({
      ...resource,
      resource_photo: normalizeMediaUrl(resource.resource_photo),
      author_photo: normalizeMediaUrl(resource.author_photo),
      pdf: normalizeMediaUrl(resource.pdf),
    }));
    
    return { 
      data: resources, 
      pagination: res.pagination || (rootData as any).pagination 
    };
  } catch (error) {
    //console.error("Error in getResources hook:", error);
    return { data: [], pagination: undefined };
  }
}

/**
 * Fetch location-based jobs.
 * Endpoint: /open/location/{slug}/jobs
 */
export async function getLocationJobs(slug: string): Promise<any> {
  const cleanSlug = (slug || "").replace(/\/+$/, "").trim();
  if (!cleanSlug) return null;

  try {
    const res = await fetchAPI<ApiResponse<any>>(
      `/open/location/${cleanSlug}/jobs/`,
      { silentStatusCodes: [404, 500] }
    );
    const raw = res.data || res;
    const jobs = toArray<Job>(raw).map(normalizeJob);

    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      return { ...raw, jobs };
    }
    return { jobs };
  } catch (error: any) {
    if (error.status !== 404 && error.status !== 500) {
      //console.error(`Error fetching location jobs for ${slug}:`, error);
    }
    return null;
  }
}
