import { notFound } from "next/navigation";
import JobDetails from "@/components/jobs/JobDetails/JobDetails";
import JobListingView from "@/components/jobs/JobListings/JobListingView";
import InstitutionDetailsView from "@/components/institutions/InstitutionDetails/InstitutionDetailsView";
import { getJobs, fullSearchJobs, getJobBySlug, normalizeJob, toArray, fetchJobsPaginated } from "@/lib/jobs/api";
import { getCompanies, getCompanyBySlug } from "@/hooks/useCompanies";
import { getCategories, getFilters } from "@/hooks/useHomepage";
import { fetchAPI } from "@/services/api/client";
import { Job, Institution, ApiResponse } from "@/types/homepage";
import { getGlobalLayoutData } from "@/lib/globalLayout/getGlobalLayoutData";
import { sanitizeSlug } from "@/lib/utils";
import { cache } from 'react';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateJobPostingSchema, generateBreadcrumbSchema, generateEducationalOrganizationSchema, generateSeoMetadata } from '@/lib/seo';

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
        const cleanItemSlug = (item.slug ?? "").toLowerCase().replace(/^jobs\//, "");
        if (cleanItemSlug === s) return item;
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

      // Fetch dynamic locations to check if the search is for a known city/location
      const { locations } = await getFilters();
      const knownCities = new Set(locations.map(l => l.name?.toLowerCase()).filter(Boolean));

      let resolvedLocation = "";
      let resolvedKeyword = "";

      if (apiUrl.includes("?")) {
        const [path, searchStr] = apiUrl.split("?");
        const params = new URLSearchParams(searchStr);
        params.set("per_page", "100");

        const kwVal = params.get("keyword") || params.get("title");
        if (kwVal && knownCities.has(kwVal.toLowerCase().trim())) {
          params.set("location", kwVal.trim());
          params.delete("keyword");
          params.delete("title");
          resolvedLocation = kwVal.trim();
          resolvedKeyword = ""; // Clear keyword for city search
        } else {
          resolvedLocation = params.get("location") || "";
          if (resolvedLocation) {
            resolvedKeyword = ""; // Clear keyword if location is already set
          } else if (kwVal) {
            resolvedKeyword = kwVal;
          }
        }
        apiUrl = path + "?" + params.toString();
      } else {
        resolvedKeyword = match.title;
        if (apiUrl.includes("/open/search/jobs") || apiUrl.includes("/open/jobs")) {
          apiUrl = apiUrl + "?per_page=100";
        }
      }

      const res = await fetchAPI<ApiResponse<any>>(apiUrl);
      const data = res.data || res;
      
      const mainJobs = toArray<any>(data?.search_jobs || data).map(normalizeJob);
      const rawSimilarJobs = toArray<any>(data?.similar_jobs || data?.data?.similar_jobs).map(normalizeJob);
      const similarJobs = rawSimilarJobs.filter(
        sj => !mainJobs.some(j => String(j.id) === String(sj.id))
      );

      // Parse initialFilters from navigation URL parameters
      const initialFilters: any = { job_type: [], experience: [], salary: [], institution_type: [] };
      let finalKeyword = resolvedKeyword;
      let finalLocation = resolvedLocation;

      if (match.url.includes("?")) {
        const [, searchStr] = match.url.split("?");
        const params = new URLSearchParams(searchStr);
        
        const experienceType = params.get("experience_type");
        if (experienceType) {
          initialFilters.experience_type = experienceType;
          if (experienceType === "fresher") {
            initialFilters.experience.push("0");
          }
        }
        
        const jobType = params.get("job_type");
        if (jobType) {
          const formattedJobType = jobType === "full_time" ? "Full Time" : jobType === "part_time" ? "Part Time" : jobType;
          initialFilters.job_type.push(formattedJobType);
        }

        const loc = params.get("location");
        if (loc) {
          finalLocation = loc;
          finalKeyword = "";
        }
        const kw = params.get("keyword") || params.get("title");
        if (kw && !knownCities.has(kw.toLowerCase().trim())) {
          finalKeyword = kw;
        }
      }
      
      return { 
        type: 'category' as const, 
        data: mainJobs, 
        similarJobs: similarJobs,
        name: match.title, 
        keyword: finalKeyword,
        location: finalLocation,
        initialFilters: initialFilters
      };
    }
  } catch (err) {
    //console.error("Navigation lookup error:", err);
  }
  return null;
}

async function lookupByCategory(s: string) {
  try {
    const categories = await getCategories();
    const catMatch = categories.find((c: any) => (c.slug ?? "").toLowerCase() === s);
    if (catMatch) {
      // Use the name but also pass the category_id for better accuracy
      const { jobs, similarJobs } = await fullSearchJobs(catMatch.name.toLowerCase(), "", catMatch.id);
      return { 
        type: 'category' as const, 
        data: jobs, 
        similarJobs,
        name: catMatch.name, 
        keyword: catMatch.name 
      };
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
      const { jobs: searchResults } = await fullSearchJobs(keyword, "");
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
    //console.error("Job lookup fallback failed:", err);
  }
  return null;
}

async function lookupByInstitution(s: string) {
  // Guard: If the slug represents a search/category landing page rather than a school,
  // skip the institution backend lookups to avoid slow redundant 404 queries.
  if (
    s === "jobs" ||
    s.endsWith("-jobs") ||
    s.startsWith("jobs-in-") ||
    s.includes("-jobs-in-") ||
    ["fresher", "part-time", "full-time", "contract", "internship"].some(k => s.startsWith(k + "-jobs"))
  ) {
    return null;
  }

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

    // Detect location using dynamic city list (with fuzzy matching for misspellings)
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
        const fuzzyMatch = [...knownCities].find(city => city.startsWith(p) || p.startsWith(city));
        if (fuzzyMatch) {
          location = fuzzyMatch;
          keywordParts = parts.filter(p_ => p_.toLowerCase() !== p);
          break;
        }
      }

      // Try close misspelling match (e.g., "hyderbad" → "hyderabad")
      if (p.length >= 5) {
        const closeMatch = [...knownCities].find(city => {
          if (Math.abs(city.length - p.length) > 2) return false;
          // Simple similarity: count matching characters in order
          let matches = 0;
          let ci = 0;
          for (let pi = 0; pi < p.length && ci < city.length; pi++) {
            if (p[pi] === city[ci]) { matches++; ci++; }
            else if (city[ci + 1] === p[pi]) { ci++; matches++; ci++; } // skipped char in city
            else { ci++; }
          }
          return matches >= Math.min(p.length, city.length) - 2;
        });
        if (closeMatch) {
          location = closeMatch;
          keywordParts = parts.filter(p_ => p_.toLowerCase() !== p);
          break;
        }
      }
    }

    // Detect common filters from the remaining parts
    const initialFilters: any = { job_type: [], experience: [], salary: [], institution_type: [] };
    const finalKeywordParts: string[] = [];

    // Range maps for experience and salary
    const expRanges = new Set(["0-0", "0-2", "2-5", "5-10", "10-50"]);
    const salRanges = new Set(["0-5", "5-10", "10-15"]);

    for (let i = 0; i < keywordParts.length; i++) {
      const p = keywordParts[i].toLowerCase();
      const nextP = keywordParts[i + 1]?.toLowerCase();
      const combined = nextP ? `${p}-${nextP}` : "";

      if (p === "fresher") {
        initialFilters.experience.push("0");
      } else if (expRanges.has(p)) {
        if (p === "0-0") initialFilters.experience.push("0");
        else if (p === "0-2" || p === "2-5") initialFilters.experience.push("2");
        else if (p === "5-10") initialFilters.experience.push("5");
        else if (p === "10-50") initialFilters.experience.push("10");
      } else if (expRanges.has(combined)) {
        const matched = combined;
        if (matched === "0-0") initialFilters.experience.push("0");
        else if (matched === "0-2" || matched === "2-5") initialFilters.experience.push("2");
        else if (matched === "5-10") initialFilters.experience.push("5");
        else if (matched === "10-50") initialFilters.experience.push("10");
        i++;
      } else if (salRanges.has(p)) {
        initialFilters.salary.push(p);
      } else if (salRanges.has(combined)) {
        initialFilters.salary.push(combined);
        i++;
      } else if ((p === "full" && nextP === "time") || p === "fulltime") {
        initialFilters.job_type.push("Full-time");
        if (nextP === "time") i++;
      } else if ((p === "part" && nextP === "time") || p === "parttime") {
        initialFilters.job_type.push("Part-time");
        if (nextP === "time") i++;
      } else if (p !== "lpa" && p !== "years" && p !== "experience") {
        finalKeywordParts.push(p);
      }
    }

    const keyword = finalKeywordParts.filter(p => !["jobs", "job", "in"].includes(p)).join(" ").trim();

    // Build a nice display name that includes detected filters
    const filterLabels = [];
    if (initialFilters.experience?.includes("0") || initialFilters.experience?.includes("0-0")) filterLabels.push("Fresher");
    if (initialFilters.experience?.includes("2")) filterLabels.push("2+ Years");
    if (initialFilters.experience?.includes("5")) filterLabels.push("5+ Years");
    if (initialFilters.experience?.includes("10")) filterLabels.push("10+ Years");
    if (initialFilters.job_type?.includes("Full-time")) filterLabels.push("Full-time");
    if (initialFilters.job_type?.includes("Part-time")) filterLabels.push("Part-time");

    // Prefer cleaner display: "Fresher Mathematics Teacher - Hyderabad"
    const displayName = [
      keyword,
      filterLabels.length > 0 ? filterLabels.join(" ") : "",
      location
    ].filter(Boolean).join(" - ");

    if (keyword || location || initialFilters.job_type.length > 0 || initialFilters.experience.length > 0) {
      const backendFilters: any = {};
      if (initialFilters.job_type?.length) {
        backendFilters.job_type = initialFilters.job_type.map((v: string) =>
          v.toLowerCase().replace(" ", "_").replace("-", "_")
        );
      }
      if (initialFilters.experience?.length) {
        backendFilters.experience = initialFilters.experience.map(Number);
      }

      const { jobs, similarJobs } = await fetchJobsPaginated({
        keyword,
        location,
        filters: backendFilters,
        limit: 100
      });

      return {
        type: 'category' as const,
        data: jobs || [],
        similarJobs: similarJobs || [],
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
const resolveSlug = cache(async (slug: string) => {
  const s = sanitizeSlug(slug);
  if (!s || ["null", "undefined"].includes(s)) {
    return { type: 'not-found' as const };
  }
  try {
    const result = await lookupByNavigation(s)
      ?? await lookupByCategory(s)
      ?? await lookupByInstitution(s)
      ?? await lookupBySearchFallback(s)
      ?? await lookupByJob(s);
    if (result) return result;
  } catch (err) {
    //console.error(`Resolver error for ${slug}:`, err);
  }
  return { type: 'not-found' as const };
});

export async function generateMetadata({ params }: { readonly params: Promise<{ readonly slug: string }> }) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (resolved.type === 'job') {
    const job = resolved.data as Job;
    return generateSeoMetadata({
      path: `/jobs/${slug}`,
      pageFallback: {
        title: `${job.title} at ${job.employer?.company_name || 'TeachNow'}`,
        description: job.description?.substring(0, 160) || `Apply for ${job.title} job.`,
        image: job.employer?.company_logo,
        imageAlt: `${job.employer?.company_name || 'Company'} Logo`
      }
    });
  }

  if (resolved.type === 'institution') {
    const company = resolved.data as Institution;
    return generateSeoMetadata({
      path: `/institutions/${slug}`,
      pageFallback: {
        title: `${company.company_name} | TeachNow`,
        description: company.company_description?.substring(0, 160) || `Learn more about ${company.company_name}.`,
        image: company.company_logo,
        imageAlt: `${company.company_name} Logo`
      }
    });
  }

  if (resolved.type === 'category') {
    return generateSeoMetadata({
      path: `/jobs/${slug}`,
      pageFallback: {
        title: `${(resolved as any).name || 'Jobs'} | TeachNow`,
        description: `Browse jobs for ${(resolved as any).name || 'this category'}.`
      }
    });
  }

  return generateSeoMetadata({
    path: `/jobs/${slug}`,
    pageFallback: { title: 'Not Found' }
  });
}

export default async function GenericJobDetailPage({ params }: { readonly params: Promise<{ readonly slug: string }> }) {
  const { slug } = await params;
  const resolved = await resolveSlug(slug);

  if (resolved.type === 'job') {
    const job = resolved.data as Job;
    return (
      <>
        <JsonLd 
          schema={generateJobPostingSchema({
            title: job.title,
            description: job.description || job.title,
            datePosted: job.created_at || new Date().toISOString(),
            employmentType: job.job_type,
            hiringOrganizationName: job.employer?.company_name,
            hiringOrganizationLogo: job.employer?.company_logo,
            location: {
              addressLocality: job.location || "",
              addressRegion: "",
              addressCountry: "IN"
            }
          })} 
        />
        <JsonLd 
          schema={generateBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Jobs", url: "/jobs" },
            { name: job.title, url: `/jobs/${slug}` }
          ])} 
        />
        <JobDetails job={job} slug={slug} />
      </>
    );
  }

  if (resolved.type === 'institution') {
    const company = resolved.data as Institution;
    const [companyJobs, allCompanies] = await Promise.all([
      getJobs({ employer_id: company.id }),
      getCompanies()
    ]);
    const similarCompanies = allCompanies.filter(c => c.id !== company.id).slice(0, 4);

    return (
      <>
        <JsonLd 
          schema={generateEducationalOrganizationSchema({
            name: company.company_name,
            url: company.website,
            logo: company.company_logo,
            telephone: company.phone,
            address: {
              addressLocality: company.city || "",
              addressRegion: "",
              addressCountry: company.country || "IN"
            }
          })} 
        />
        <JsonLd 
          schema={generateBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Institutions", url: "/institutions" },
            { name: company.company_name, url: `/institutions/${slug}` }
          ])} 
        />
        <InstitutionDetailsView
          company={company}
          companyJobs={companyJobs}
          similarCompanies={similarCompanies}
        />
      </>
    );
  }

  if (resolved.type === 'category') {
    console.log("GenericJobDetailPage: passing jobs to view. Count:", (resolved.data as any[]).length, "Name:", (resolved.data as any[])[0]?.employer?.company_name);
    return (
      <JobListingView
        jobs={resolved.data as Job[]}
        similarJobs={(resolved as any).similarJobs}
        pageName={(resolved as any).name || "Search"}
        initialKeyword={(resolved as any).keyword}
        initialLocation={(resolved as any).location}
        initialFilters={(resolved as any).initialFilters}
      />
    );
  }

  return notFound();
}
