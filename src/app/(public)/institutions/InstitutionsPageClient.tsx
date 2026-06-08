"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { getCompanies } from "@/hooks/useCompanies";
import { Institution } from "@/types/homepage";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import { CompanyCardSkeleton } from "@/shared/cards/CompanyCard/CompanyCardSkeleton";
import CompanyCard from "@/shared/cards/CompanyCard/CompanyCard";
import { normalizeMediaUrl } from "@/services/api/client";

interface InstitutionsPageClientProps {
  initialCompanies: Institution[];
}

export default function InstitutionsPageClient({ initialCompanies }: InstitutionsPageClientProps) {
  const [search, setSearch] = useState("");
  const [companies, setCompanies] = useState<Institution[]>(initialCompanies);
  const [loading, setLoading] = useState(false); // Default false because data comes from server

  const [selectedFilters, setSelectedFilters] = useState({
    institution_type: [] as string[],
  });

  const institutionTypeOptions = ["UG", "PG", "Diploma", "School", "Intermediate"];
  const [sortBy, setSortBy] = useState("latest");
  
  const isMounted = useRef(false);

  useEffect(() => {
    // Skip fetching on first mount since we have initialCompanies from the server
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    let active = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await getCompanies(selectedFilters);
        if (active) setCompanies(data || []);
      } catch (err) {
        // console.error("Error loading institutions:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => { active = false; };
  }, [selectedFilters]);

  const filtered = companies
    .filter((c) => {
      if (search && !c.company_name?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "latest") return (b.id || 0) - (a.id || 0);
      if (sortBy === "oldest") return (a.id || 0) - (b.id || 0);
      return 0;
    });

  const handleToggle = (category: keyof typeof selectedFilters, value: string) => {
    const current = selectedFilters[category];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    
    setSelectedFilters({ ...selectedFilters, [category]: next });
  };

  const clearAll = () => {
    setSelectedFilters({ institution_type: [] });
    setSearch("");
  };

  const activeFilterCount = selectedFilters.institution_type.length;

  const breadcrumbItems = [
    { label: "Institutions", isCurrent: true }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 flex flex-col">
      {/* Consistent Breadcrumb Bar */}
      <div className="bg-[#F8FAFC] border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="bg-white border-b border-slate-200 py-6 sticky top-16 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1a202c] md:text-3xl tracking-tight">Institutions Hiring Teachers</h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Discover top schools, colleges, and edtech companies across India
              </p>
            </div>
          </div>

          {/* Controls Bar: Search -> Checkboxes -> Sort */}
          <div className="mt-6 flex flex-col lg:flex-row lg:items-center gap-5 pt-5 border-t border-slate-100">
            
            {/* 1. Search Bar */}
            <div className="w-full lg:w-72 shrink-0 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="text"
                placeholder="Search institutions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                suppressHydrationWarning
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* 2. Checkboxes */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 lg:border-l lg:border-slate-200 lg:pl-5">
              <span className="text-sm font-semibold text-slate-500 hidden sm:inline-block">Type:</span>
              {institutionTypeOptions.map((opt) => {
                const isSelected = selectedFilters.institution_type.includes(opt);
                return (
                  <label
                    key={opt}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggle("institution_type", opt)}
                        className="peer h-4.5 w-4.5 cursor-pointer appearance-none rounded border border-slate-300 bg-slate-50 checked:border-indigo-600 checked:bg-indigo-600 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                      />
                      <svg
                        className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13px] font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                      {opt}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* 3. Sort Dropdown */}
            <div className="lg:ml-auto shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full lg:w-auto cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all appearance-none pr-8 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat"
                suppressHydrationWarning
              >
                <option value="latest">Sort by: Latest</option>
                <option value="oldest">Sort by: Oldest</option>
              </select>
            </div>

          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <CompanyCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm max-w-3xl mx-auto">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-[#1a202c]">No institutions found</h3>
            <p className="mt-1 text-sm font-medium text-slate-500 max-w-sm">
              We couldn't find any institutions matching your criteria. Try adjusting your filters or search term.
            </p>
            {(search || activeFilterCount > 0) && (
              <button 
                onClick={clearAll}
                className="mt-6 rounded-lg bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm font-medium text-slate-500">
              Showing <span className="font-bold text-[#1a202c]">{filtered.length}</span> institutions
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((company) => {
                const imageUrl = normalizeMediaUrl(company.company_logo);
                return (
                  <CompanyCard
                    key={company.id || company.slug}
                    name={company.company_name}
                    location={company.location || ""}
                    city={company.city || ""}
                    logo={imageUrl}
                    slug={company.slug}
                    openJobs={company.jobs_count || company.associated_jobs?.length || 0}
                    type={company.industry || ""}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
