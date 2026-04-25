import type { Job } from "./homepage";

/** Re-export canonical job shape for consumers of `@/types/jobs`. */
export type { Job };

/** Full job record for detail views (includes `similar_jobs` and optional screening fields on `Job`). */
export type JobDetails = Job;

export interface JobsPageProps {
  searchParams: {
    keyword?: string;
    location?: string;
  };
}

export interface JobsFilters {
  subjects: string[];
  locations: string[];
  types: string[];
  work_types: string[];
  experience: string[];
  salary: string[];
  institution_type: string[];
  gender: string[];
}

export interface JobsState {
  jobs: Job[];
  filteredJobs: Job[];
  loading: boolean;
  search: string;
  selectedFilters: JobsFilters;
  currentPage: number;
  mobileFiltersOpen: boolean;
}
