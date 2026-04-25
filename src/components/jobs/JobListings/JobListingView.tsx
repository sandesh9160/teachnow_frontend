"use client";

import Link from "next/link";
// import { Filter } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Job } from "@/types/homepage";
// import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";

import { useState, useEffect } from "react";
import type { JobsFilters } from "@/types/jobs";
import JobFilterSidebar from "@/components/jobs/Filters/JobFilterSidebar/JobFilterSidebar";
import FilterCard from "@/components/jobs/Filters/shared/FilterCard";
import JobCard from "@/shared/cards/JobCard/JobCard";
import MobileFilters from "@/components/jobs/Filters/MobileFilters";
import JobsHeader from "@/components/jobs/JobsHeader/JobsHeader";
import { useRouter } from "next/navigation";
import PaginationFilter from "@/shared/filters/PaginationFilter/PaginationFilter";
import JobPagination from "@/components/jobs/JobPagination/JobPagination";

interface JobListingViewProps {
  readonly jobs: Job[];
  readonly similarJobs?: Job[];
  readonly pageName: string;
  readonly initialKeyword?: string;
  readonly initialLocation?: string;
  readonly initialFilters?: Partial<JobsFilters>;
}

export default function JobListingView({ 
  jobs, 
  similarJobs = [],
  pageName, 
  initialKeyword, 
  initialLocation,
  initialFilters
}: Readonly<JobListingViewProps>) {
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");
  const [internalLocation, setInternalLocation] = useState("");

  const [selectedFilters, setSelectedFilters] = useState<JobsFilters>({
    subjects: initialFilters?.subjects || [],
    locations: initialFilters?.locations || [],
    types: initialFilters?.types || [],
    work_types: initialFilters?.work_types || [],
    experience: initialFilters?.experience || [],
    salary: initialFilters?.salary || [],
    institution_type: initialFilters?.institution_type || [],
    gender: initialFilters?.gender || [],
  });

  const [sortBy, setSortBy] = useState("Default");
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);

    useEffect(() => {
      // Initialize search fields and title separately as requested
      if (initialKeyword) {
          setInternalSearch(initialKeyword);
      } else if (pageName && pageName !== "Search") {
          // If pageName is just the location, don't double-fill it in keywords
          const isOnlyLocation = initialLocation && pageName.toLowerCase().includes(initialLocation.toLowerCase());
          if (!isOnlyLocation) {
              setInternalSearch(pageName);
          }
      }

      if (initialLocation) {
          setInternalLocation(initialLocation);
      }
    }, [pageName, initialKeyword, initialLocation]);



  // const normalizedPageName = String(pageName || "Search")
  //   .trim()
  //   .replace(/^in\s+/i, "") // Remove leading "In" for location pages
  //   .replace(/\s*(teaching|teacher|jobs?)$/i, "")
  //   .split(/[\s-]+/)
  //   .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  //   .join(" ");

  // const breadcrumbItems = [
  //   { label: "Jobs", href: "/jobs" },
  //   { label: `${normalizedPageName} Jobs`, isCurrent: true },
  // ];

  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(false);
  }, [jobs, pageName]);
  const handleSearch = () => {
    const combined = [internalSearch, internalLocation]
      .filter(Boolean)
      .join(" ");

    setIsSearching(true);
    if (!combined.trim()) {
      router.push("/jobs");
      return;
    }

    const slug = combined
      .toLowerCase()
      .trim()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/^-+|-+$/g, "");

    router.push(`/jobs/${slug}`);
  };

  const handleToggle = (category: keyof JobsFilters, value: string) => {
    setSelectedFilters((prev: JobsFilters) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((v: string) => v !== value)
        : [...prev[category], value],
    }));
    setCurrentPage(1);
  };

  const normalizeType = (value: string) =>
    String(value)
      .toLowerCase()
      .replaceAll(/[_-]/g, " ")
      .replaceAll(/\s+/g, " ")
      .trim();

  const filteredJobs = (Array.isArray(jobs) ? jobs : []).filter((job) => {
    if (!job) return false;
    const jobType = normalizeType(job.job_type || "");

    // Job Type Filter
    if (selectedFilters.types.length) {
      const selectedTypes = new Set(selectedFilters.types.map(normalizeType));
      if (!selectedTypes.has(jobType)) return false;
    }

    // Subject/Category Filter
    if (selectedFilters.subjects.length > 0) {
      const jobCategory = (job.category?.name || "").toLowerCase();
      const jobTitle = (job.title || "").toLowerCase();
      
      const isMatch = selectedFilters.subjects.some(sub => {
        const subLower = sub.toLowerCase();
        // Exact match or includes
        if (jobCategory.includes(subLower) || jobTitle.includes(subLower)) return true;
        
        // Fuzzy word match (check if any word from the filter exists in category/title)
        const subWords = subLower.split(/\s+/).filter(w => w.length > 2); // only words > 2 chars
        return subWords.some(word => jobCategory.includes(word) || jobTitle.includes(word));
      });
      
      if (!isMatch) return false;
    }

    // Location Filter
    if (selectedFilters.locations.length > 0) {
      const jobLocation = job.location?.toLowerCase() || "";
      if (!selectedFilters.locations.some(loc => jobLocation.includes(loc.toLowerCase()))) return false;
    }

    // Experience Filter (Multi-range support)
    if (selectedFilters.experience.length > 0) {
      const exp = Number(job.experience_required ?? Number.NaN);
      const isMatch = selectedFilters.experience.some(rangeStr => {
        const [min, max] = rangeStr.split("-").map(Number);
        return !Number.isNaN(min) && !Number.isNaN(max) && exp >= min && exp <= max;
      });
      if (!isMatch) return false;
    }

    // Salary Filter (Multi-range support)
    if (selectedFilters.salary.length > 0) {
      const jobMin = Number(job.salary_min ?? Number.NaN);
      const jobMax = Number(job.salary_max ?? Number.NaN);
      const isMatch = selectedFilters.salary.some(rangeStr => {
        const [minLakh, maxLakh] = rangeStr.split("-").map(Number);
        if (Number.isNaN(minLakh) || Number.isNaN(maxLakh)) return false;
        const rangeMin = minLakh * 100000;
        const rangeMax = maxLakh * 100000;
        return jobMax >= rangeMin && jobMin <= rangeMax;
      });
      if (!isMatch) return false;
    }

    // Institution Type Filter
    if (selectedFilters.institution_type.length > 0) {
      const instType = job.institution_type || job.employer?.institution_type;
      if (!instType || !selectedFilters.institution_type.includes(instType)) return false;
    }

    // Gender Filter
    if (selectedFilters.gender.length > 0) {
      const jobGender = (job.gender || "both").toLowerCase();
      if (!selectedFilters.gender.includes(jobGender)) return false;
    }

    return true;
  });

  // Sorting logic
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === "Salary: High to Low") return Number(b.salary_max || 0) - Number(a.salary_max || 0);
    if (sortBy === "Experience: Low to High") return (a.experience_required || 0) - (b.experience_required || 0);
    return 0; // Default matches API order
  });

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(sortedJobs.length / resultsPerPage));
  const startIndex = (currentPage - 1) * resultsPerPage;
  const paginatedJobs = sortedJobs.slice(startIndex, startIndex + resultsPerPage);

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-12">
      {/* Consistent Breadcrumb Bar */}
      <div className="border-b border-border bg-white/80 backdrop-blur-md sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col items-center w-full">
            <div className="w-full max-w-4xl">
              <JobsHeader
                search={internalSearch}
                setSearch={(val) => { setInternalSearch(val); }}
                location={internalLocation}
                setLocation={(val) => { setInternalLocation(val); }}
                onOpenFilters={() => setMobileFiltersOpen(true)}
                onSearch={handleSearch}
                activeFilterCount={Object.values(selectedFilters).flat().length}
                loading={isSearching}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          <aside className="hidden w-64 shrink-0 lg:block pt-14 px-1">
            <FilterCard>
              <JobFilterSidebar
                selectedFilters={selectedFilters}
                onToggle={handleToggle}
              />
            </FilterCard>
          </aside>

          {/* Jobs List */}
          <div className="lg:col-span-3">
            <PaginationFilter
              totalResults={filteredJobs.length}
              resultsPerPage={resultsPerPage}
              setResultsPerPage={(v) => { setResultsPerPage(v); setCurrentPage(1); }}
              sortBy={sortBy}
              setSortBy={setSortBy}
              startIndex={startIndex}
            />

            <div className="grid grid-cols-1 gap-6">  
              {paginatedJobs.map((job) => {
                const salary = (() => {
                  const min = Number(job.salary_min || 0);
                  const max = Number(job.salary_max || 0);
                  if (!min && !max) return "Not disclosed";
                  const fmt = (n: number) => n >= 100000 ? `${(n/100000).toFixed(1)}L` : n.toLocaleString("en-IN");
                  return `${fmt(min)} - ${fmt(max)}`;
                })();

                const jobTypeFormatted = String(job.job_type || "")
                  .replaceAll(/_/g, " ")
                  .replaceAll(/\b\w/g, (c) => c.toUpperCase());

                    return (
                      <JobCard
                        key={job.id}
                        id={job.id}
                        title={job.title}
                        company={job.employer?.company_name || (job as any)?.company_name || "Confidential School"}
                        location={job.location || "India"}
                        type={jobTypeFormatted}
                        salary={salary}
                        tags={[]}
                        posted={job.created_at || new Date().toISOString()}
                        logo={job.employer?.company_logo}
                        slug={job.slug}
                        institutionType={(job as any).institutionType || job.institution_type || job.employer?.institution_type}
                        deadline={job.application_deadline}
                        gender={job.gender}
                        vacancies={job.vacancies}
                        experience={job.experience_required}
                        experienceType={job.experience_type}
                      />
                    );
              })}
            </div>

            {filteredJobs.length === 0 && (
              <div className="mt-8 rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <p className="text-muted-foreground text-sm sm:text-base">No jobs found for this category.</p>
                <Link href="/jobs" className="mt-4 inline-block">
                  <Button variant="outline">Browse All Jobs</Button>
                </Link>
              </div>
            )}

            {!isSearching && similarJobs.length > 0 && (
              <div className="mt-16">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-foreground font-display">Similar Jobs</h2>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {similarJobs.map((job) => {
                    const salary = (() => {
                      const min = Number(job.salary_min || 0);
                      const max = Number(job.salary_max || 0);
                      if (!min && !max) return "Not disclosed";
                      const fmt = (n: number) => n >= 100000 ? `${(n/100000).toFixed(1)}L` : n.toLocaleString("en-IN");
                      return `${fmt(min)} - ${fmt(max)}`;
                    })();

                    return (
                      <JobCard
                        key={`similar-${job.id}`}
                        id={job.id}
                        title={job.title}
                        company={job.employer?.company_name || (job as any)?.company_name || "Confidential School"}
                        location={job.location || "India"}
                        type={String(job.job_type || "").replaceAll(/_/g, " ").replaceAll(/\b\w/g, (c) => c.toUpperCase())}
                        salary={salary}
                        tags={[]}
                        posted={job.created_at || new Date().toISOString()}
                        logo={job.employer?.company_logo}
                        slug={job.slug}
                        institutionType={(job as any).institutionType || job.institution_type || job.employer?.institution_type}
                        deadline={job.application_deadline}
                        gender={job.gender}
                        vacancies={job.vacancies}
                        experience={job.experience_required}
                        experienceType={job.experience_type}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {!isSearching && filteredJobs.length > resultsPerPage && (
              <div className="mt-8">
                <JobPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileFilters
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        resultCount={filteredJobs.length}
        filterContent={
          <JobFilterSidebar
            selectedFilters={selectedFilters}
            onToggle={handleToggle}
          />
        }
      />
    </div>
  );
}
