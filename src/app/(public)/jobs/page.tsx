import { fetchJobsPaginated } from "@/lib/jobs/api";
import JobsClientManager from "./JobsClientManager";
import { Job } from "@/types/homepage";
import { Suspense } from "react";

// Force Server-Side Rendering (SSR) for dynamic, live searches on every request
export const dynamic = "force-dynamic";

interface PageProps {
  readonly searchParams: Promise<{
    keyword?: string;
    location?: string;
    page?: string;
    limit?: string;
    institution_type?: string | string[];
    experience?: string | string[];
    job_type?: string | string[];
    gender?: string | string[];
    experience_type?: string;
  }>;
}

function toArray<T>(val: T | T[] | undefined): T[] {
  if (val === undefined || val === null) return [];
  return Array.isArray(val) ? val : [val];
}

export default async function JobsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  const keyword = params.keyword || "";
  const location = params.location || "";
  const page = Number(params.page || 1);
  const limit = Number(params.limit || 10);

  // Re-construct backend filter payloads from query parameters
  const backendFilters: any = {};
  
  const jobTypes = toArray(params.job_type);
  if (jobTypes.length > 0) {
    backendFilters.job_type = jobTypes.map((v) =>
      v.toLowerCase().replace(" ", "_").replace("-", "_")
    );
  }
  
  const experiences = toArray(params.experience);
  if (experiences.length > 0) {
    let maxUpperBound = -1;
    experiences.forEach((exp) => {
      if (exp === "0-0") {
        maxUpperBound = Math.max(maxUpperBound, 0);
      } else {
        const parts = exp.split("-");
        if (parts[1]) {
          maxUpperBound = Math.max(maxUpperBound, Number(parts[1]));
        }
      }
    });
    if (maxUpperBound >= 0) {
      backendFilters.experience = maxUpperBound;
    }
  }

  const institutionTypes = toArray(params.institution_type);
  if (institutionTypes.length > 0) {
    backendFilters.institution_type = institutionTypes.map((v) => v.toLowerCase());
  }

  const genders = toArray(params.gender);
  if (genders.length > 0) {
    backendFilters.gender = genders.map((v) => v.toLowerCase());
  }

  if (params.experience_type) {
    backendFilters.experience_type = params.experience_type;
  }

  let initialJobs: Job[] = [];
  let similarJobs: Job[] = [];
  let totalResults = 0;
  let totalPages = 1;
  let errorMsg: string | undefined = undefined;

  try {
    const { jobs, meta, similarJobs: similar, error } = await fetchJobsPaginated({
      page,
      limit,
      filters: backendFilters,
      keyword,
      location
    });

    if (error) {
      errorMsg = error;
    } else {
      initialJobs = jobs || [];
      similarJobs = similar || [];
      if (meta) {
        totalResults = meta.total;
        totalPages = meta.last_page;
      }
    }
  } catch (err) {
    errorMsg = "Failed to fetch jobs";
  }

  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <JobsClientManager
        initialJobs={initialJobs}
        similarJobs={similarJobs}
        initialTotalResults={totalResults}
        initialTotalPages={totalPages}
        error={errorMsg}
      />
    </Suspense>
  );
}
