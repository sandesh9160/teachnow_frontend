"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useJobs } from "@/hooks/useJobs";
import { JobsFilters } from "@/types/jobs";

// Reusable Components
import JobsHeader from "@/components/jobs/JobsHeader/JobsHeader";
import JobsGrid from "@/components/jobs/JobsGrid/JobsGrid";
import JobPagination from "@/components/jobs/JobPagination/JobPagination";
import JobFilterSidebar from "@/components/jobs/Filters/JobFilterSidebar/JobFilterSidebar";
import FilterCard from "@/components/jobs/Filters/shared/FilterCard";
import PaginationFilter from "@/shared/filters/PaginationFilter/PaginationFilter";
import { getFilters } from "@/hooks/useHomepage";

import MobileFilters from "@/components/jobs/Filters/MobileFilters";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";

function JobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const keywordParam = searchParams?.get("keyword") || "";
  const locationParam = searchParams?.get("location") || "";

  const { jobs, similarJobs, loading, error, fetchJobs } = useJobs();
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  // UI/Filter State
  const [search, setSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<JobsFilters>({
    subjects: [],
    locations: [],
    types: [],
    work_types: [],
    experience: [],
    salary: [],
    institution_type: [],
    gender: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("Default");

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const { categories, locations } = await getFilters();
        setAvailableSubjects(categories.map((c: any) => c.name));
        setAvailableLocations(locations.map((l: any) => l.name));
      } catch (err) {
        // console.error("Failed to fetch filters", err);
      }
    };
    fetchFilterOptions();
  }, []);

  // Auto-scroll to top on page or filter change
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [currentPage, selectedFilters]);

  useEffect(() => {
    void fetchJobs({
      keyword: keywordParam || undefined,
      location: locationParam || undefined,
    });
    if (keywordParam) setSearch(keywordParam);
    if (locationParam) setLocationSearch(locationParam);
  }, [keywordParam, locationParam, fetchJobs]);

  const handleSearch = () => {
    const combined = [search, locationSearch]
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

  // Handlers
  const handleToggle = (category: keyof JobsFilters, value: string) => {
    setSelectedFilters((prev: JobsFilters) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((v: string) => v !== value)
        : [...prev[category], value],
    }));
    setCurrentPage(1);
  };

  const clearAll = () => {
    setSelectedFilters({
      subjects: [],
      locations: [],
      types: [],
      work_types: [],
      experience: [],
      salary: [],
      institution_type: [],
      gender: [],
    });
    setSearch("");
    setCurrentPage(1);
  };

  const activeFilterCount = Object.values(selectedFilters).flat().length;

  // Client-side Filtering Logic
  const filtered = jobs.filter((job) => {
    if (!job) return false;

    // Search
    if (search && !(job.title?.toLowerCase().includes(search.toLowerCase()) || job.employer?.company_name?.toLowerCase().includes(search.toLowerCase()))) return false;

    // Job Type Filter
    if (selectedFilters.types.length) {
      const normalizeType = (value: string) =>
        String(value)
          .toLowerCase()
          .replaceAll(/[_-]/g, " ")
          .replaceAll(/\s+/g, " ")
          .trim();

      const jobType = normalizeType(job.job_type || "");
      const selectedTypes = new Set(selectedFilters.types.map((t) => normalizeType(t)));
      if (selectedTypes.size > 0 && !selectedTypes.has(jobType)) return false;
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
      const instType = (job as any).institution_type || (job.employer as any)?.institution_type;
      if (!instType || !selectedFilters.institution_type.includes(instType)) return false;
    }

    // Gender Filter
    if (selectedFilters.gender.length > 0) {
      const jobGender = (job.gender || "both").toLowerCase();
      if (!selectedFilters.gender.includes(jobGender)) return false;
    }

    return true;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "Salary: High to Low") return Number(b.salary_max) - Number(a.salary_max);
    if (sortBy === "Experience: Low to High") return a.experience_required - b.experience_required;
    return 0; // Default Latest (as provided by API)
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / resultsPerPage));
  const startIndex = (currentPage - 1) * resultsPerPage;
  const paginatedJobs = sorted.slice(startIndex, startIndex + resultsPerPage);



  const breadcrumbItems = [
    { label: "Jobs", isCurrent: true },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      {/* Consistent Breadcrumb Bar */}
      <div className="border-b border-border bg-white/80 backdrop-blur-md sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {error ? (
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-red-100 bg-red-50/90 px-4 py-3 text-sm text-red-800">
            {error}
            <button
              type="button"
              className="ml-3 font-semibold text-primary underline"
              onClick={() => void fetchJobs({ keyword: keywordParam || undefined, location: locationParam || undefined })}
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}

      <JobsHeader
        search={search}
        setSearch={(val) => { setSearch(val); setCurrentPage(1); }}
        location={locationSearch}
        setLocation={(val) => { setLocationSearch(val); setCurrentPage(1); }}
        onOpenFilters={() => setMobileFiltersOpen(true)}
        onSearch={handleSearch}
        activeFilterCount={activeFilterCount}
        loading={loading || isSearching}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block pt-14">
            <FilterCard>
              <JobFilterSidebar
                selectedFilters={selectedFilters}
                onToggle={(category, value) => handleToggle(category, value)}
                availableSubjects={availableSubjects}
                availableLocations={availableLocations}
              />
            </FilterCard>
          </aside>

          {/* Job List */}
          <main className="flex-1 min-w-0">
            <PaginationFilter
              totalResults={filtered.length}
              resultsPerPage={resultsPerPage}
              setResultsPerPage={(v) => { setResultsPerPage(v); setCurrentPage(1); }}
              sortBy={sortBy}
              setSortBy={setSortBy}
              startIndex={startIndex}
            />

            <JobsGrid
              jobs={paginatedJobs}
              loading={loading}
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

            {!loading && filtered.length > resultsPerPage && (
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
        resultCount={filtered.length}
        filterContent={
          <JobFilterSidebar
            selectedFilters={selectedFilters}
            onToggle={(category, value) => handleToggle(category, value)}
            availableSubjects={availableSubjects}
            availableLocations={availableLocations}
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
