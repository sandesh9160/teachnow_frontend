"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useJobs } from "@/hooks/useJobs";
// import { JobsFilters } from "@/types/jobs";

// Reusable Components
import JobsHeader from "@/components/jobs/JobsHeader/JobsHeader";
import JobsGrid from "@/components/jobs/JobsGrid/JobsGrid";
import JobPagination from "@/components/jobs/JobPagination/JobPagination";
import JobFilterSidebar from "@/components/jobs/Filters/JobFilterSidebar/JobFilterSidebar";
import FilterCard from "@/components/jobs/Filters/shared/FilterCard";
import PaginationFilter from "@/shared/filters/PaginationFilter/PaginationFilter";
// import { getFilters } from "@/hooks/useHomepage";

import MobileFilters from "@/components/jobs/Filters/MobileFilters";


function JobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const keywordParam = searchParams?.get("keyword") || "";
  const locationParam = searchParams?.get("location") || "";

  const { jobs, similarJobs, loading, error, fetchJobs, meta } = useJobs();

  // UI/Filter State
  const [search, setSearch] = useState(keywordParam);
  const [locationSearch, setLocationSearch] = useState(locationParam);
  const [selectedFilters, setSelectedFilters] = useState({
    institution_type: [] as string[],
    experience: [] as string[],
    job_type: [] as string[],
    gender: [] as string[],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("Default");

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [searchTrigger] = useState(0);

  // Auto-scroll to top on page or filter change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const main = document.getElementById("jobs-list-container");
      if (main) main.scrollTo({ top: 0, behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage, selectedFilters, search, locationSearch]);

  // Debounced API call
  useEffect(() => {
    const handler = setTimeout(() => {
      setIsPending(false);
      const filters: any = {};

      if (selectedFilters.institution_type.length > 0) {
        filters.institution_type = selectedFilters.institution_type.map(v => v.toLowerCase());
      }

      if (selectedFilters.job_type.length > 0) {
        filters.job_type = selectedFilters.job_type.map(v => v.toLowerCase().replace(" ", "_").replace("-", "_"));
      }

      if (selectedFilters.gender.length > 0) {
        filters.gender = selectedFilters.gender.map(v => v.toLowerCase());
      }

      if (selectedFilters.experience.length > 0) {
        // Experience is tricky for multi-select. If "fresher" is selected, we add experience_type.
        // If others are selected, we might need multiple ranges or just the min/max of all selected.
        // For simplicity and to match common backend expectations, we'll pass them as arrays if the backend supports it,
        // or just pick the first one. 
        // Based on the previous useJobs.ts, it handles arrays by appending [].

        selectedFilters.experience.forEach(exp => {
          if (exp === "0-0") {
            filters.experience_type = "fresher";
          } else if (exp === "10-50") {
            if (!filters.experience_min) filters.experience_min = [];
            filters.experience_min.push(10);
          } else {
            const [min, max] = exp.split("-");
            if (min) {
              if (!filters.experience_min) filters.experience_min = [];
              filters.experience_min.push(min);
            }
            if (max) {
              if (!filters.experience_max) filters.experience_max = [];
              filters.experience_max.push(max);
            }
          }
        });
      }

      console.log(" [Search API] Fetching jobs:", {
        keyword: search || "none",
        location: locationSearch || "none",
        page: currentPage,
        limit: resultsPerPage,
        filters: filters,
      });

      void fetchJobs({
        keyword: search || undefined,
        location: locationSearch || undefined,
        page: currentPage,
        limit: resultsPerPage,
        filters: filters,
      });
    }, 300);

    return () => clearTimeout(handler);
  }, [search, locationSearch, selectedFilters, currentPage, resultsPerPage, searchTrigger]);

  const handleSearch = () => {
    if (!search.trim() && !locationSearch.trim()) {
      setSearchError("Please enter at least a job title or location to search.");
      setTimeout(() => setSearchError(""), 3000);
      return;
    }
    setSearchError("");
    
    // Generate SEO-friendly slug and redirect
    const combinedQuery = [search.trim(), locationSearch.trim()]
      .filter(Boolean)
      .join(" ");
    
    const slug = combinedQuery
      .toLowerCase()
      .trim()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/^-+|-+$/g, "");

    if (!slug) return;

    console.log("🚀 [Jobs Page Search] Redirecting to slug:", slug);
    router.push(`/jobs/${slug}`);
  };

  // Handlers
  const handleToggle = (category: string, value: string) => {
    console.log("🖱️ [Filter Click] Toggle:", { category, value });
    setIsPending(true);
    setSelectedFilters((prev: any) => {
      const current = prev[category] as string[];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: next };
    });
    setCurrentPage(1);
  };

  const clearAll = () => {
    setIsPending(true);
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

  const activeFilterCount = Object.values(selectedFilters).flat().length;

  const totalPages = meta?.last_page || 1;
  const totalResults = meta?.total || jobs.length;
  const currentLimit = meta?.per_page || resultsPerPage;
  const startIndex = meta ? (meta.current_page - 1) * currentLimit : 0;

  return (
    <div className="bg-[#F8FAFC] lg:h-[calc(100vh-5rem)] lg:overflow-hidden flex flex-col">
      {/* Search Header */}
      <div className="border-b border-border bg-white/80 backdrop-blur-md sticky top-20 lg:static lg:shrink-0 z-40">
        <div className="mx-auto w-full px-4 py-1 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex flex-col items-center w-full">
            <div className="w-full max-w-5xl">
              <JobsHeader
                search={search}
                setSearch={(val) => { setSearch(val); setCurrentPage(1); setSearchError(""); }}
                location={locationSearch}
                setLocation={(val) => { setLocationSearch(val); setCurrentPage(1); setSearchError(""); }}
                onOpenFilters={() => setMobileFiltersOpen(true)}
                onSearch={handleSearch}
                activeFilterCount={activeFilterCount}
                loading={loading || isPending}
                error={searchError}
              />
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-red-100 bg-red-50/90 px-4 py-3 text-sm text-red-800">
            {error}
            <button
              type="button"
              className="ml-3 font-semibold text-primary underline"
              onClick={() => setCurrentPage(prev => prev)} // trigger re-fetch
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex-1 lg:overflow-hidden mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex flex-col lg:flex-row h-full gap-10">
          {/* Sidebar */}
          <aside className="hidden w-72 shrink-0 lg:block h-full py-8 sticky top-0">
            <FilterCard className="h-full overflow-y-auto custom-scrollbar">
              <JobFilterSidebar
                selectedFilters={selectedFilters as any}
                onToggle={handleToggle as any}
                onClearAll={clearAll}
              />
            </FilterCard>
          </aside>

          {/* Job List */}
          <main
            id="jobs-list-container"
            className="flex-1 lg:h-full lg:overflow-y-auto py-8 lg:pr-4 pb-24 max-w-5xl mx-auto w-full"
          >
            <PaginationFilter
              totalResults={totalResults}
              resultsPerPage={currentLimit}
              setResultsPerPage={(v) => { setResultsPerPage(v); setCurrentPage(1); }}
              sortBy={sortBy}
              setSortBy={setSortBy}
              startIndex={startIndex}
            />

            <JobsGrid
              jobs={jobs}
              loading={loading || isPending}
              onClearAll={clearAll}
            />

            {!loading && similarJobs.length > 0 && (
              <div className="mt-16">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-foreground font-display">Similar Jobs</h2>
                </div>
                <JobsGrid
                  jobs={similarJobs}
                  loading={false}
                  onClearAll={clearAll}
                />
              </div>
            )}

            {!loading && totalPages > 1 && (
              <div className="mt-12">
                <JobPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
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

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="container py-20 text-center">Loading jobs...</div>}>
      <JobsContent />
    </Suspense>
  );
}
