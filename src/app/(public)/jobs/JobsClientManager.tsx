"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import JobsHeader from "@/components/jobs/JobsHeader/JobsHeader";
import JobFilterSidebar from "@/components/jobs/Filters/JobFilterSidebar/JobFilterSidebar";
import FilterCard from "@/components/jobs/Filters/shared/FilterCard";
import PaginationFilter from "@/shared/filters/PaginationFilter/PaginationFilter";
import MobileFilters from "@/components/jobs/Filters/MobileFilters";
import JobPagination from "@/components/jobs/JobPagination/JobPagination";
import JobsGrid from "@/components/jobs/JobsGrid/JobsGrid";
import { Job } from "@/types/homepage";
import { fetchJobsPaginated } from "@/lib/jobs/api";

export default function JobsClientManager({ 
  initialJobs = [],
  similarJobs = [],
  initialTotalResults = 0,
  initialTotalPages = 1,
  error: initialError
}: { 
  initialJobs: Job[],
  similarJobs?: Job[],
  initialTotalResults?: number,
  initialTotalPages?: number,
  error?: string
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const experienceType = searchParams?.get("experience_type") ?? "";
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getParamValuesNormalized = (key: string): string[] => {
    const rawVals = (searchParams?.getAll(key) ?? []).concat(searchParams?.getAll(`${key}[]`) ?? []);
    const single = searchParams?.get(key) ?? searchParams?.get(`${key}[]`);
    if (single && !rawVals.includes(single)) rawVals.push(single);
    const uniqueRaw = Array.from(new Set(rawVals.filter(Boolean)));
    return uniqueRaw.map(v => {
      const lower = v.toLowerCase().replace(/_/g, " ").replace(/-/g, " ").trim();
      if (key === "job_type") {
        if (lower === "full time" || lower === "full_time" || lower === "full-time") return "Full Time";
        if (lower === "part time" || lower === "part_time" || lower === "part-time") return "Part Time";
      }
      if (key === "institution_type") {
        const options = ["UG", "PG", "Diploma", "School", "Intermediate"];
        const matched = options.find(o => o.toLowerCase() === lower);
        if (matched) return matched;
      }
      if (key === "experience") {
        if (lower === "fresher") return "0";
        if (lower === "0-0" || lower === "0") return "0";
        if (lower === "2" || lower === "2+") return "2";
        if (lower === "5" || lower === "5+") return "5";
        if (lower === "10" || lower === "10+") return "10";
      }
      return v;
    });
  };

  const [search, setSearch] = useState(searchParams?.get("keyword") ?? "");
  const [locationSearch, setLocationSearch] = useState(searchParams?.get("location") ?? "");
  
  const [selectedFilters, setSelectedFilters] = useState({
    institution_type: getParamValuesNormalized("institution_type") as string[],
    experience: getParamValuesNormalized("experience") as string[],
    job_type: getParamValuesNormalized("job_type") as string[],
    gender: getParamValuesNormalized("gender") as string[],
  });

  const [jobsList, setJobsList] = useState<Job[]>(initialJobs);
  const [similarJobsList, setSimilarJobsList] = useState<Job[]>(similarJobs);
  const [totalResults, setTotalResults] = useState(initialTotalResults);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("Default");

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(initialError);

  const isFirstRender = useRef(true);

  // Strip trailing hash if present
  useEffect(() => {
    if (typeof window !== "undefined" && (window.location.href.endsWith("#") || window.location.hash === "#")) {
      const cleanUrl = window.location.href.endsWith("#") ? window.location.href.slice(0, -1) : window.location.href.split("#")[0];
      window.history.replaceState(null, "", cleanUrl);
    }
  }, []);

  // Fetch jobs dynamically on currentPage, selectedFilters, or resultsPerPage change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    let active = true;
    
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(undefined);

      const backendFilters: any = {};
      
      if (selectedFilters.job_type?.length) {
        backendFilters.job_type = selectedFilters.job_type.map((v: string) =>
          v.toLowerCase().replace(" ", "_").replace("-", "_")
        );
      }
      
      if (selectedFilters.experience?.length) {
        backendFilters.experience = selectedFilters.experience.map(Number);
      }

      if (selectedFilters.institution_type?.length) {
        backendFilters.institution_type = selectedFilters.institution_type.map((v: string) => v.toLowerCase());
      }

      if (selectedFilters.gender?.length) {
        backendFilters.gender = selectedFilters.gender.map((v: string) => v.toLowerCase());
      }

      if (experienceType) {
        backendFilters.experience_type = experienceType;
      }

      try {
        const { jobs, similarJobs: similar, meta, error: fetchErr } = await fetchJobsPaginated({
          page: currentPage,
          limit: resultsPerPage,
          filters: backendFilters,
          keyword: search,
          location: locationSearch
        });

        if (!active) return;

        if (fetchErr) {
          setError(fetchErr);
        } else {
          setJobsList(jobs || []);
          setSimilarJobsList(similar || []);
          if (meta) {
            setTotalResults(meta.total);
            setTotalPages(meta.last_page);
          }
        }
      } catch (err) {
        if (active) {
          setError("Failed to fetch jobs");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    const handler = setTimeout(() => {
      fetchJobs();
    }, 300);

    return () => {
      active = false;
      clearTimeout(handler);
    };
  }, [currentPage, selectedFilters, resultsPerPage, search, locationSearch, experienceType]);

  // Auto-scroll to top on page or filter change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "instant" });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [currentPage, selectedFilters]);

  const handleSearch = () => {
    if (!search.trim() && !locationSearch.trim()) {
      setSearchError("Please enter at least a job title or location to search.");
      setTimeout(() => setSearchError(""), 3000);
      return;
    }
    setSearchError("");

    const combinedQuery = [search.trim(), locationSearch.trim()]
      .filter(Boolean)
      .join(" ");

    const slug = combinedQuery
      .toLowerCase()
      .trim()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/^-+|-+$/g, "");

    if (slug) {
      router.push(`/jobs/${slug}`);
    }
  };

  const handleToggle = (category: string, value: string) => {
    const current = selectedFilters[category as keyof typeof selectedFilters] as string[];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    
    setSelectedFilters({ ...selectedFilters, [category]: next });
    setCurrentPage(1);
  };

  const clearAll = () => {
    setSelectedFilters({
      institution_type: [],
      experience: [],
      job_type: [],
      gender: [],
    });
    setSearch("");
    setLocationSearch("");
    setCurrentPage(1);
  };

  // Sorting
  const sortedJobs = [...jobsList].sort((a, b) => {
    if (sortBy === "Salary: High to Low") return Number(b.salary_max || 0) - Number(a.salary_max || 0);
    if (sortBy === "Experience: Low to High") return (a.experience_required || 0) - (b.experience_required || 0);
    return 0;
  });

  const startIndex = (currentPage - 1) * resultsPerPage;
  const activeFilterCount = Object.values(selectedFilters).flat().length;

  return (
    <div className="bg-[#F8FAFC] lg:h-[calc(100vh-5rem)] lg:overflow-hidden flex flex-col">
      <div className="border-b border-border bg-white/80 backdrop-blur-md sticky top-20 lg:static lg:shrink-0 z-40">
        <div className="mx-auto w-full px-4 py-1 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex flex-col items-center w-full">
            <div className="w-full max-w-5xl">
              <JobsHeader
                search={search}
                setSearch={setSearch}
                location={locationSearch}
                setLocation={setLocationSearch}
                onOpenFilters={() => setMobileFiltersOpen(true)}
                onSearch={handleSearch}
                activeFilterCount={activeFilterCount}
                loading={isLoading}
                error={searchError}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 lg:overflow-hidden mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex flex-col lg:flex-row h-full gap-10">
          <aside className="hidden w-72 shrink-0 lg:block h-full py-8 sticky top-0">
            <FilterCard className="h-full overflow-y-auto custom-scrollbar">
              <JobFilterSidebar
                selectedFilters={selectedFilters as any}
                onToggle={handleToggle as any}
                onClearAll={clearAll}
              />
            </FilterCard>
          </aside>

          <main
            id="jobs-list-container"
            ref={scrollContainerRef}
            className="flex-1 lg:h-full lg:overflow-y-auto py-8 lg:pr-4 pb-24 max-w-5xl mx-auto w-full"
          >
            {error && (
              <div className="mb-4">
                <div className="rounded-xl border border-red-100 bg-red-50/90 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              </div>
            )}

            <PaginationFilter
              totalResults={totalResults}
              resultsPerPage={resultsPerPage}
              setResultsPerPage={(v) => { setResultsPerPage(v); setCurrentPage(1); }}
              sortBy={sortBy}
              setSortBy={setSortBy}
              startIndex={startIndex}
            />

            <JobsGrid
              jobs={sortedJobs}
              loading={isLoading}
              onClearAll={clearAll}
            />

            {similarJobsList.length > 0 && (
              <div className="mt-16">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-foreground font-display">Similar Jobs</h2>
                </div>
                <JobsGrid
                  jobs={similarJobsList}
                  loading={false}
                />
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-12">
                <JobPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </main>
        </div>
      </div>

      <MobileFilters
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        resultCount={totalResults}
        filterContent={
          <JobFilterSidebar
            selectedFilters={selectedFilters as any}
            onToggle={handleToggle as any}
            onClearAll={clearAll}
          />
        }
      />
    </div>
  );
}
