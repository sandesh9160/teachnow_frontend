import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";

import JobDetails from "@/components/jobs/JobDetails/JobDetails";
import InstitutionDetailsView from "@/components/institutions/InstitutionDetails/InstitutionDetailsView";
import JobListingView from "@/components/jobs/JobListings/JobListingView";

import { getJobBySlug, getCategoryJobs, fullSearchJobs, fetchJobsPaginated } from "@/lib/jobs/api";
import { getCompanies, getCompanyProfileWithJobs } from "@/hooks/useCompanies";
// import { getLocationJobs } from "@/hooks/useHomepage";
import { getFilters } from "@/hooks/useHomepage";
import { normalizeJob, toArray } from "@/lib/jobs/normalizeJob";
import { sanitizeSlug } from "@/lib/utils";
import type { Job } from "@/types/homepage";

function isStaticOrIconRoute(slug: string): boolean {
  if (!slug) return true;
  const s = slug.toLowerCase();
  return (
    s.includes(".") ||
    s === "favicon" ||
    s.startsWith("favicon-") ||
    s === "favicon.ico" ||
    s === "icon" ||
    s.startsWith("icon-") ||
    s.startsWith("apple-touch-") ||
    s === "robots.txt" ||
    s === "sitemap.xml"
  );
}


export const dynamic = 'force-dynamic';

/* -------------------- LOCOATION HELPERS -------------------- */

function normalizeLocationSlug(s: string): string {
  return (s || "").replace(/-(jobs|job)$/i, "").trim();
}

/* -------------------- STRATEGY RESOLVERS -------------------- */

/**
 * 1. Job Strategy
 * Try direct match, then search-based matching for "messy" slugs.
 */
async function lookupByJob(s: string, rawSlug: string) {
  try {
    // A. Direct hit with original slug (handles spaces, colons etc. directly if backend allows)
    let job = await getJobBySlug(rawSlug);
    if (job?.id) return { type: 'job' as const, data: job };

    // B. Direct hit with sanitized version (in case the URL was already clean)
    if (s !== rawSlug) {
      job = await getJobBySlug(s);
      if (job?.id) return { type: 'job' as const, data: job };
    }

    // C. Hyphen/Dirty search fallback
    if (s.includes('-')) {
      // Clean keyword: Remove numeric suffixes and single-char suffixes (like -w, -1, -04)
      const keyword = s.split('-')
        .filter(p => !/^\d+$/.test(p) && p.length > 1)
        .join(' ');

      const { jobs: searchResults } = await fullSearchJobs(keyword, "");

      if (searchResults && searchResults.length > 0) {
        const bestMatch = searchResults.find(j => {
          const sanitizedBackendSlug = sanitizeSlug(j.slug || String(j.id));  
          return sanitizedBackendSlug === s || j.title.toLowerCase().includes(keyword.toLowerCase());
        });

        if (bestMatch) {
          const fullJob = await getJobBySlug(bestMatch.slug || bestMatch.id.toString());
          return { type: 'job' as const, data: fullJob || bestMatch };
        }
      }
    }
  } catch (err) {
    //console.error("Job strategy failed:", err);
  }
  return null;
}

/**
 * 2. Institute Strategy
 */
async function lookupByInstitute(s: string) {
  // Guard: If the slug represents a search/category/location landing page rather than a school,
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
    const profile = await getCompanyProfileWithJobs(s);
    if (!profile) return null;

    const allCompanies = await getCompanies();
    const similarCompanies = allCompanies
      .filter(c => c.id !== profile.company.id)
      .slice(0, 4);

    return { type: 'institute' as const, data: { ...profile, similarCompanies } };
  } catch { return null; }
}

/**
 * 3. Category Strategy
 */
async function lookupByCategory(s: string) {
  try {
    const res = await getCategoryJobs(s);
    if (!res) return null;

    const jobsRaw = Array.isArray(res) ? res : (res.jobs ?? res.data ?? res);
    const jobs = Array.isArray(jobsRaw) ? jobsRaw : [];
    if (jobs.length === 0) return null;

    const similarJobsRaw = !Array.isArray(res) ? (res.similar_jobs ?? (res as any).data?.similar_jobs) : [];
    const rawSimilar = toArray<Job>(similarJobsRaw).map(normalizeJob);
    const similarJobs = rawSimilar.filter(
      sj => !jobs.some(j => String(j.id) === String(sj.id))
    );

    const name = Array.isArray(res) ? s : (res.name ?? res.category_name ?? s);
    return { type: 'category' as const, data: { jobs, similarJobs, name, keyword: name } };
  } catch { return null; }
}

/**
 * 4. Location Strategy
 */
async function lookupByLocation(s: string) {
  try {
    const locationSlug = normalizeLocationSlug(s);
    
    // Fetch dynamic locations to verify if the slug is a known city/location
    const { locations } = await getFilters();
    const knownCities = new Set(locations.map(l => l.name?.toLowerCase()).filter(Boolean));

    if (!knownCities.has(locationSlug.toLowerCase())) {
      return null;
    }

    const { jobs: locationJobs, similarJobs } = await fullSearchJobs("", locationSlug);
    if (locationJobs.length === 0 && similarJobs.length === 0) return null;

    const name = locationSlug.charAt(0).toUpperCase() + locationSlug.slice(1);
    return {
      type: 'location' as const,
      data: { jobs: locationJobs, similarJobs, name, location: name }
    };
  } catch { return null; }
}

/**
 * 5. Search Fallback Strategy
 */
async function lookupBySearch(s: string) {
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

      const isSearchLandingPage =
        s.endsWith("-jobs") ||
        s.startsWith("jobs-in-") ||
        s.includes("-jobs-in-") ||
        ["fresher", "part-time", "full-time", "contract", "internship"].some(k => s.startsWith(k + "-jobs"));

      // Only allow the search fallback if it's a structured search landing page 
      // OR if the slug is at least 3 characters long and returned actual jobs
      if (!isSearchLandingPage && (s.length < 3 || (jobs || []).length === 0)) {
        return null;
      }

      return {
        type: 'search' as const,
        data: { jobs: jobs || [], similarJobs: similarJobs || [], name: displayName || "Search Results", keyword, location, initialFilters }
      };
    }
  } catch { return null; }
  return null;
}

/* -------------------- ORCHESTRATOR -------------------- */

async function resolveSlug(slug: string) {
  // Ignore static files/icons early
  if (isStaticOrIconRoute(slug)) return null;

  const s = sanitizeSlug(slug);
  if (!s) return null;

  // 1 & 2. Try Job and Institute in parallel (the most common high-priority hits)
  const [jobResult, instResult] = await Promise.all([
    lookupByJob(s, slug),
    lookupByInstitute(s)
  ]);

  if (jobResult) {
    return { type: 'job' as const, data: jobResult.data, officialSlug: jobResult.data.slug || String(jobResult.data.id) };
  }
  if (instResult) {
    return { type: 'institute' as const, data: instResult.data, officialSlug: instResult.data.company.slug || String(instResult.data.company.id) };
  }

  // 3. Category (often contains common teaching terms)
  const cat = await lookupByCategory(s);
  if (cat) return { type: 'category' as const, data: cat.data, officialSlug: cat.data.name.toLowerCase().replace(/\s+/g, '-') };

  // 4. Location
  const loc = await lookupByLocation(s);
  if (loc) return { type: 'location' as const, data: loc.data, officialSlug: loc.data.name.toLowerCase().replace(/\s+/g, '-') };

  // 5. Generic Search Fallback
  const search = await lookupBySearch(s);
  if (search) return { type: 'search' as const, data: search.data, officialSlug: s };

  return null;
}

/* -------------------- EXPORTS -------------------- */

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;
  if (isStaticOrIconRoute(slug)) {
    return { title: "TeachNow" };
  }
  const s = sanitizeSlug(slug);

  // Quick metadata lookups (minimizing redundant strategy execution)
  const job = (await getJobBySlug(slug)) || (slug === s ? null : await getJobBySlug(s));
  if (job) return { title: `${job.title} | TeachNow` };

  const inst = (await getCompanyProfileWithJobs(slug)) || (slug === s ? null : await getCompanyProfileWithJobs(s));
  if (inst) return { title: `${inst.company.company_name} | TeachNow` };

  return { title: "TeachNow" };
}

export default async function PublicSlugPage({ params }: { readonly params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (isStaticOrIconRoute(slug)) {
    return notFound();
  }

  // 0. Handlers for static page aliases and URL cleaning
  const staticAliases: Record<string, string> = {
    "about": "about-us",
    "contact": "contact-us",
    "pricing": "pricing-plans",
    "free-cv-resume-builder": "ai-resume-builder",
    "faq": "faqs",
  };

  const normalized = slug.toLowerCase();
  if (staticAliases[normalized]) {
    redirect(`/${staticAliases[normalized]}`);
  }

  // 1. Resolve the data and the official backend slug
  const resolved = await resolveSlug(slug);

  if (!resolved) {
    return notFound();
  }

  // 2. Exact Slug Redirect: If the current URL doesn't match the backend's preferred slug, redirect.
  // We check against the decoded slug to handle spaces/special characters from the backend correctly.
  const currentSlug = decodeURIComponent(slug);
  const official = (resolved as any).officialSlug;

  if (official && currentSlug !== official) {
    redirect(`/${official}`);
  }

  // 3. Render the appropriate view
  if (resolved.type === 'job') {
    return <JobDetails job={resolved.data} slug={official || slug} />;
  }

  if (resolved.type === 'institute') {
    return (
      <InstitutionDetailsView
        company={resolved.data.company}
        companyJobs={resolved.data.jobs}
        similarCompanies={resolved.data.similarCompanies}
      />
    );
  }

  if (resolved.type === 'category') {
    return (
      <JobListingView 
        jobs={resolved.data.jobs} 
        similarJobs={(resolved.data as any).similarJobs}
        pageName={resolved.data.name} 
        initialKeyword={resolved.data.keyword} 
      />
    );
  }

  if (resolved.type === 'location') {
    return (
      <JobListingView 
        jobs={resolved.data.jobs} 
        similarJobs={(resolved.data as any).similarJobs}
        pageName={resolved.data.name} 
        initialLocation={resolved.data.location} 
      />
    );
  }

  if (resolved.type === 'search') {
    return (
      <JobListingView
        jobs={resolved.data.jobs}
        similarJobs={(resolved.data as any).similarJobs}
        pageName={resolved.data.name}
        initialKeyword={resolved.data.keyword}
        initialLocation={resolved.data.location}
        initialFilters={resolved.data.initialFilters}
      />
    );
  }

  return notFound();
}
