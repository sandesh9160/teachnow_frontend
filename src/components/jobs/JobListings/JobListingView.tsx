"use client";

import Link from "next/link";
import { Filter } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Job } from "@/types/homepage";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";

import { useState, useEffect } from "react";
import type { JobsFilters } from "@/types/jobs";
import JobFilterSidebar from "@/components/jobs/Filters/JobFilterSidebar/JobFilterSidebar";
import JobCard from "@/shared/cards/JobCard/JobCard";
import MobileFilters from "@/components/jobs/Filters/MobileFilters";
import JobsHeader from "@/components/jobs/JobsHeader/JobsHeader";
import { useRouter } from "next/navigation";

interface JobListingViewProps {
  readonly jobs: Job[];
  readonly pageName: string;
  readonly initialKeyword?: string;
  readonly initialLocation?: string;
  readonly initialFilters?: Partial<JobsFilters>;
}

export default function JobListingView({ 
  jobs, 
  pageName, 
  initialKeyword, 
  initialLocation,
  initialFilters
}: Readonly<JobListingViewProps>) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
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
  });

  useEffect(() => {
    setMounted(true);
    // Initialize search fields and title separately as requested
    if (initialKeyword) {
      setInternalSearch(initialKeyword);
    } else if (pageName && pageName !== "Search") {
      setInternalSearch(pageName);
    }

    if (initialLocation) {
      setInternalLocation(initialLocation);
    }
  }, [pageName, initialKeyword, initialLocation]);

  const normalizedPageName = String(pageName || "Search")
    .trim()
    .replace(/^in\s+/i, "") // Remove leading "In" for location pages
    .replace(/\s*(teaching|teacher|jobs?)$/i, "")
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  const breadcrumbItems = [
    { label: "Jobs", href: "/jobs" },
    { label: `${normalizedPageName} Jobs`, isCurrent: true },
  ];

  const handleSearch = () => {
    const combined = [internalSearch, internalLocation]
      .filter(Boolean)
      .join(" ");

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

    return true;
  });

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-12">
      {/* Consistent Breadcrumb Bar */}
      <div className="border-b border-border bg-white/80 backdrop-blur-md sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Integrated Search Bar for Consistency */}
      <JobsHeader
        search={internalSearch}
        setSearch={(val) => { setInternalSearch(val); }}
        location={internalLocation}
        setLocation={(val) => { setInternalLocation(val); }}
        onOpenFilters={() => setMobileFiltersOpen(true)}
        onSearch={handleSearch}
        activeFilterCount={Object.values(selectedFilters).flat().length}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filters
              </h2>
            </div>

            <JobFilterSidebar
              selectedFilters={selectedFilters}
              onToggle={handleToggle}
            />
          </aside>

          {/* Jobs List */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">Showing <span className="font-semibold text-foreground">{filteredJobs.length}</span> jobs</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="hidden sm:inline">Sort by:</span>
                <select 
                   className="bg-transparent font-semibold text-foreground focus:outline-none cursor-pointer text-xs sm:text-sm"
                   suppressHydrationWarning
                >
                  <option>Latest</option>
                  <option>Salary: High to Low</option>
                  <option>Experience: Low to High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">  
              {filteredJobs.map((job) => {
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

                const postedText = mounted && job.created_at 
                  ? `Posted on ${new Date(job.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` 
                  : "Posted recently";

                return (
                  <JobCard
                    key={job.id}
                    id={job.id}
                    title={job.title}
                    company={job.employer?.company_name || "Confidential School"}
                    location={job.location || "India"}
                    type={jobTypeFormatted}
                    salary={salary}
                    tags={[]}
                    posted={postedText}
                    logo={job.employer?.company_logo}
                    slug={job.slug}
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
