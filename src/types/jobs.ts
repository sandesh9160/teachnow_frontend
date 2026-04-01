import { Job } from "./homepage";

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
