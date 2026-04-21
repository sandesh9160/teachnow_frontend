import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";

import JobDetails from "@/components/jobs/JobDetails/JobDetails";
import InstitutionDetailsView from "@/components/institutions/InstitutionDetails/InstitutionDetailsView";
import JobListingView from "@/components/jobs/JobListings/JobListingView";

import { getJobBySlug, getCategoryJobs, searchJobs } from "@/lib/jobs/api";
import { getCompanies, getCompanyProfileWithJobs } from "@/hooks/useCompanies";
import { getLocationJobs } from "@/hooks/useHomepage";
import { sanitizeSlug } from "@/lib/utils";


export const dynamic = 'force-dynamic';

/* -------------------- LOCOATION HELPERS -------------------- */

function normalizeLocationSlug(s: string): string {
  return (s || "").replace(/-(jobs|job)$/i, "").trim();
}

function parseSearchSlug(s: string) {
  const parts = s.split("-");
  return {
    keyword: parts.slice(0, -1).join(" "),
    location: parts.slice(-1).join(" ")
  };
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

      const searchResults = await searchJobs(keyword, "");

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

    const name = Array.isArray(res) ? s : (res.name ?? res.category_name ?? s);
    return { type: 'category' as const, data: { jobs, name, keyword: name } };
  } catch { return null; }
}

/**
 * 4. Location Strategy
 */
async function lookupByLocation(s: string) {
  try {
    const locationSlug = normalizeLocationSlug(s);
    const res = await getLocationJobs(locationSlug);
    const jobsRaw = res?.jobs ?? res?.data ?? res;
    const jobs = Array.isArray(jobsRaw) ? jobsRaw : [];

    const safeJobs = jobs.length > 0 ? jobs : await searchJobs("", locationSlug);
    if (safeJobs.length === 0) return null;

    const name = res?.location || res?.name || locationSlug || s;
    return {
      type: 'location' as const,
      data: { jobs: safeJobs, name, location: name }
    };
  } catch { return null; }
}

/**
 * 5. Search Fallback Strategy
 */
async function lookupBySearch(s: string) {
  try {
    const { keyword, location } = parseSearchSlug(s);
    if (!keyword && !location) return null;

    const jobs = await searchJobs(keyword || "", location || "");
    if (!jobs || jobs.length === 0) return null;

    const name = [keyword, location].filter(Boolean).join(" in ") || "Search Results";
    return { type: 'search' as const, data: { jobs, name, keyword, location } };
  } catch { return null; }
}

/* -------------------- ORCHESTRATOR -------------------- */

async function resolveSlug(slug: string) {
  // Ignore static files/icons early
  if (slug.includes('.') || slug === "favicon.ico") return null;

  const s = sanitizeSlug(slug);
  if (!s) return null;

  // 1. Job
  const job = await lookupByJob(s, slug);
  if (job) return { type: 'job' as const, data: job.data, officialSlug: job.data.slug || String(job.data.id) };

  // 2. Institute
  const inst = await lookupByInstitute(s);
  if (inst) return { type: 'institute' as const, data: inst.data, officialSlug: inst.data.company.slug || String(inst.data.company.id) };

  // 3. Category
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
    return <JobListingView jobs={resolved.data.jobs} pageName={resolved.data.name} initialKeyword={resolved.data.keyword} />;
  }

  if (resolved.type === 'location') {
    return <JobListingView jobs={resolved.data.jobs} pageName={resolved.data.name} initialLocation={resolved.data.location} />;
  }

  if (resolved.type === 'search') {
    return (
      <JobListingView
        jobs={resolved.data.jobs}
        pageName={resolved.data.name}
        initialKeyword={resolved.data.keyword}
        initialLocation={resolved.data.location}
      />
    );
  }

  return notFound();
}
