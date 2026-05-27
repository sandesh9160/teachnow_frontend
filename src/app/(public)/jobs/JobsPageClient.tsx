"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useJobs } from "@/hooks/useJobs";

// Reusable Components
import JobsHeader from "@/components/jobs/JobsHeader/JobsHeader";
import JobsGrid from "@/components/jobs/JobsGrid/JobsGrid";
import JobPagination from "@/components/jobs/JobPagination/JobPagination";
import JobFilterSidebar from "@/components/jobs/Filters/JobFilterSidebar/JobFilterSidebar";
import FilterCard from "@/components/jobs/Filters/shared/FilterCard";
import PaginationFilter from "@/shared/filters/PaginationFilter/PaginationFilter";
import MobileFilters from "@/components/jobs/Filters/MobileFilters";

import type { Job } from "@/types/homepage";

interface JobsPageClientProps {
  initialJobs: Job[];
  initialSimilarJobs: Job[];
  initialMeta: any;
}

export function JobsPageClient({ 
  initialJobs, 
  initialSimilarJobs, 
  initialMeta 
}: JobsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const keywordParam = searchParams?.get("keyword") || "";
  const locationParam = searchParams?.get("location") || "";

  // We initialize the hook, but we will "prime" its state with our server data
  const { jobs: clientJobs, similarJobs: clientSimilarJobs, loading, error, fetchJobs, meta: clientMeta } = useJobs();

  // Use server data if client data hasn't loaded yet (SSR / Hydration sync)
  const jobs = clientJobs.length > 0 || loading ? clientJobs : initialJobs;
  const similarJobs = clientSimilarJobs.length > 0 || loading ? clientSimilarJobs : initialSimilarJobs;
  const meta = clientMeta || initialMeta;

  // UI/Filter State
  const [search, setSearch] = useState(keywordParam);
  const [locationSearch, setLocationSearch] = useState(locationParam);
  const [selectedFilters, setSelectedFilters] = useState({
    institution_type: [] as string[],
    experience: [] as string[],
    job_type: [] as string[],
    gender: [] as string[],
  });
  const [currentPage, setCurrentPage] = useState(initialMeta?.current_page || 1);
  const [resultsPerPage, setResultsPerPage] = useState(initialMeta?.per_page || 10);
  const [sortBy, setSortBy] = useState("Default");

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isPending, setIsPending] = useState(false);

  // Auto-scroll to top on page or filter change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const main = document.getElementById("jobs-list-container");
      if (main) main.scrollTo({ top: 0, behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage, selectedFilters, search, locationSearch]);

  // Debounced API call for subsequent interactions
  useEffect(() => {
    // Skip the very first run if we already have server data and no active filters/search
    const hasActiveFilters = Object.values(selectedFilters).some(v => v.length > 0);
    const hasSearch = !!search || !!locationSearch;
    
    // Only fetch if we are NOT on the first page of a fresh SSR load
    if (currentPage === 1 && !hasActiveFilters && !hasSearch && initialJobs.length > 0 && clientJobs.length === 0) {
       return;
    }

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
        let maxUpperBound = -1;
        selectedFilters.experience.forEach(exp => {
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
          filters.experience = maxUpperBound;
        }
      }

      void fetchJobs({
        keyword: search || undefined,
        location: locationSearch || undefined,
        page: currentPage,
        limit: resultsPerPage,
        filters: filters,
      });
    }, 300);

    return () => clearTimeout(handler);
  }, [search, locationSearch, selectedFilters, currentPage, resultsPerPage, fetchJobs, initialJobs.length, clientJobs.length]);

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

    if (!slug) return;
    router.push(`/jobs/${slug}`);
  };

  const handleToggle = (category: string, value: string) => {
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

      {error && clientJobs.length === 0 ? (
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-red-100 bg-red-50/90 px-4 py-3 text-sm text-red-800">
            {error}
            <button
              type="button"
              className="ml-3 font-semibold text-primary underline"
              onClick={() => setCurrentPage((prev: number) => prev)}
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}

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

            {(jobs.length > 0 || !loading) && similarJobs.length > 0 && (
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

            {(jobs.length > 0 || !loading) && totalPages > 1 && (
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
