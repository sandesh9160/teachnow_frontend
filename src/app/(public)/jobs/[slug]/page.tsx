import { notFound } from "next/navigation";
import JobDetails from "@/components/jobs/JobDetails/JobDetails";
import JobListingView from "@/components/jobs/JobListings/JobListingView";
import InstitutionDetailsView from "@/components/institutions/InstitutionDetails/InstitutionDetailsView";
import { getJobs, searchJobs, getJobBySlug, normalizeJob } from "@/lib/jobs/api";
import { getCompanies, getCompanyBySlug } from "@/hooks/useCompanies";
import { getCategories, getFilters } from "@/hooks/useHomepage";
import { fetchAPI } from "@/services/api/client";
import { Job, Institution, ApiResponse } from "@/types/homepage";
import { getGlobalLayoutData } from "@/lib/globalLayout/getGlobalLayoutData";
import { sanitizeSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Removed local sanitizeSlug in favor of @/lib/utils utility

/**
 * Individual lookup strategies for the slug resolver.
 * Extracted to reduce cognitive complexity and improve maintainability.
 */
async function lookupByNavigation(s: string) {
  try {
    const nav = (await getGlobalLayoutData()).navigation;
    if (!nav?.menus) return null;

    const findMenuItem = (items: any[]): any => {
      for (const item of items) {
        if ((item.slug ?? "").toLowerCase() === s) return item;
        if (item.children_recursive?.length) {
          const matched = findMenuItem(item.children_recursive);
          if (matched) return matched;
        }
      }
      return null;
    };

    const match = findMenuItem(nav.menus);
    if (match?.url) {
      // Normalize URL: Ensure it starts with / and remove any leading /api/ if present
      let apiUrl = match.url.replace(/^\/?api\//, "/");
      if (!apiUrl.startsWith("/")) apiUrl = "/" + apiUrl;

      // REWRITE: Map legacy/incorrect search URLs to the current valid endpoint
      if (apiUrl.includes("/open/search/jobs")) {
        if (!apiUrl.includes("/search?")) {
           apiUrl = apiUrl.replace("/open/search/jobs", "/open/search/jobs/search");
        }
        apiUrl = apiUrl.replace(/([?&])title=/g, "$1keyword=");
      }

      const res = await fetchAPI<ApiResponse<any>>(apiUrl);
      const data = res.data || res;
      const jobsArray = Array.isArray(data)
        ? data
        : (Array.isArray(data?.jobs)
          ? data.jobs
          : (Array.isArray(data?.data) ? data.data : []));
      
      const jobs = jobsArray.map(normalizeJob);
      return { type: 'category' as const, data: jobs, name: match.title };
    }
  } catch (err) {
    console.error("Navigation lookup error:", err);
  }
  return null;
}

async function lookupByCategory(s: string) {
  try {
    const categories = await getCategories();
    const catMatch = categories.find((c: any) => (c.slug ?? "").toLowerCase() === s);
    if (catMatch) {
      // Use the name but also pass the category_id for better accuracy
      const jobs = await searchJobs(catMatch.name.toLowerCase(), "", catMatch.id);
      return { type: 'category' as const, data: jobs, name: catMatch.name };
    }
  } catch { /* proceed */ }
  return null;
}

async function lookupByJob(s: string) {
  try {
    // 1. Try direct lookup with sanitized slug
    let job = await getJobBySlug(s);
    if (job?.id) return { type: 'job' as const, data: job };

    // 2. Fallback: Search for the title if it's a potential title slug
    if (s.includes('-')) {
      const keyword = s.replace(/-/g, ' ');
      // Try searching for the keywords to see if we find a job with a messy slug
      const searchResults = await searchJobs(keyword, "");
      if (searchResults && searchResults.length > 0) {
        // Find best match (one where sanitized slug matches our current slug)
        const bestMatch = searchResults.find(j => 
          sanitizeSlug(j.slug) === s || 
          j.title.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (bestMatch) {
          // Re-fetch using getJobBySlug with the ACTUAL backend slug to trigger profile resolution
          const fullJob = await getJobBySlug(bestMatch.slug || bestMatch.id.toString());
          if (fullJob?.id) return { type: 'job' as const, data: fullJob };
          
          return { type: 'job' as const, data: bestMatch };
        }
      }
    }
  } catch (err) {
    console.error("Job lookup fallback failed:", err);
  }
  return null;
}

async function lookupByInstitution(s: string) {
  try {
    const company = await getCompanyBySlug(s);
    if (company) return { type: 'institution' as const, data: company };
  } catch { /* proceed */ }
  return null;
}

async function lookupBySearchFallback(s: string) {
  try {
    const parts = s.split("-");
    
    // Fetch dynamic locations to avoid hardcoded City limitations
    const { locations } = await getFilters();
    const knownCities = new Set(locations.map(l => l.name?.toLowerCase()).filter(Boolean));

    let location = "";
    let keywordParts = [...parts];

    // Detect location using dynamic city list (with fuzzy prefix matching for common abbreviations)
    for (const part of parts) {
      const p = part.toLowerCase();
      // Try exact match first
      if (knownCities.has(p)) {
        location = part;
        keywordParts = parts.filter(p_ => p_.toLowerCase() !== p);
        break;
      }
      
      // Try prefix match for common shortcuts (at least 3 chars)
      if (p.length >= 3) {
        const fuzzyMatch = [...knownCities].find(city => city.startsWith(p));
        if (fuzzyMatch) {
          location = fuzzyMatch;
          keywordParts = parts.filter(p_ => p_.toLowerCase() !== p);
          break;
        }
      }
    }

    // Detect common filters from the remaining parts
    const initialFilters: any = { types: [], experience: [], salary: [], institution_type: [] };
    const finalKeywordParts: string[] = [];
    
    // Range maps for experience and salary
    const expRanges = new Set(["0-0", "0-2", "2-5", "5-10", "10-50"]);
    const salRanges = new Set(["0-5", "5-10", "10-15"]);

    for (let i = 0; i < keywordParts.length; i++) {
        const p = keywordParts[i].toLowerCase();
        const nextP = keywordParts[i + 1]?.toLowerCase();
        const combined = nextP ? `${p}-${nextP}` : "";

        if (p === "fresher") {
            initialFilters.experience.push("0-0");
        } else if (expRanges.has(p)) {
            initialFilters.experience.push(p);
        } else if (expRanges.has(combined)) {
            initialFilters.experience.push(combined);
            i++;
        } else if (salRanges.has(p)) {
            initialFilters.salary.push(p);
        } else if (salRanges.has(combined)) {
            initialFilters.salary.push(combined);
            i++;
        } else if ((p === "full" && nextP === "time") || p === "fulltime") {
            initialFilters.types.push("Full-time");
            if (nextP === "time") i++;
        } else if ((p === "part" && nextP === "time") || p === "parttime") {
            initialFilters.types.push("Part-time");
            if (nextP === "time") i++;
        } else if (p !== "lpa" && p !== "years" && p !== "experience") {
            finalKeywordParts.push(p);
        }
    }

    const keyword = finalKeywordParts.filter(p => !["teaching", "jobs", "teacher"].includes(p)).join(" ").trim();
    
    // Build a nice display name that includes detected filters
    const filterLabels = [];
    if (initialFilters.experience?.includes("0-0")) filterLabels.push("Fresher");
    if (initialFilters.types?.includes("Full-time")) filterLabels.push("Full-time");
    if (initialFilters.types?.includes("Part-time")) filterLabels.push("Part-time");
    
    // Prefer cleaner display: "Fresher Mathematics Teacher - Hyderabad"
    const displayName = [
      keyword, 
      filterLabels.length > 0 ? filterLabels.join(" ") : "", 
      location
    ].filter(Boolean).join(" - ");

    if (keyword || location || initialFilters.types.length > 0 || initialFilters.experience.length > 0) {
      const jobs = await searchJobs(keyword, location);
      return { 
        type: 'category' as const, 
        data: jobs || [], 
        name: displayName || "Jobs",
        keyword,
        location,
        initialFilters
      };
    }
  } catch { /* proceed */ }
  return null;
}

/**
 * Enhanced async resolver that determines the content type and data from a slug. 
 * This follows a modular, strategy-based approach to map paths to components.
 */
async function resolveSlug(slug: string) {
  const s = sanitizeSlug(slug);
  
  // Guard against common placeholder or invalid slugs
  if (!s || ["null", "undefined"].includes(s)) {
    return { type: 'not-found' as const };
  }

  try {
    // Attempt lookup strategies in order of specificity
    const result = await lookupByNavigation(s)
      ?? await lookupByCategory(s)
      ?? await lookupByJob(s)
      ?? await lookupByInstitution(s)
      ?? await lookupBySearchFallback(s);

    if (result) return result;
  } catch (err) {
    console.error(`Resolver error for ${slug}:`, err);
  }

  return { type: 'not-found' as const };
}

export default async function GenericJobDetailPage({ params }: { readonly params: Promise<{ readonly slug: string }> }) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (resolved.type === 'job') return <JobDetails job={resolved.data as Job} slug={slug} />;
  
  if (resolved.type === 'institution') {
    const company = resolved.data as Institution;
    const [companyJobs, allCompanies] = await Promise.all([
      getJobs({ employer_id: company.id }),
      getCompanies()
    ]);
    const similarCompanies = allCompanies.filter(c => c.id !== company.id).slice(0, 4);

    return (
      <InstitutionDetailsView 
        company={company} 
        companyJobs={companyJobs} 
        similarCompanies={similarCompanies} 
      />
    );
  }

  if (resolved.type === 'category') {
    return (
      <JobListingView 
        jobs={resolved.data as Job[]} 
        pageName={(resolved as any).name || "Search"} 
        initialKeyword={(resolved as any).keyword}
        initialLocation={(resolved as any).location}
        initialFilters={(resolved as any).initialFilters}
      />
    );
  }

  return notFound();
}
