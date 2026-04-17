"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Search, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { getResources } from "@/hooks/useHomepage";
import { ResourceData, Pagination } from "@/types/homepage";
import ResourceCard from "@/shared/cards/ResourceCard/ResourceCard";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import JobPagination from "@/components/jobs/JobPagination/JobPagination";

export default function ResourcesPage() {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allResources, setAllResources] = useState<ResourceData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        setError(null);
        // We pass search term to the API if the backend supports it, 
        // but for now we follow the user's provided structure which includes pagination.
        const { data, pagination: apiPagination } = await getResources(currentPage, perPage);
        const visible = data.filter((item) => item?.slug && item?.is_visible !== 0);
        
        setAllResources(visible);
        if (apiPagination) {
          setPagination(apiPagination);
        }
      } catch {
        setError("Failed to load resources");
      } finally {
        setLoading(false);
      }
    };
    void loadResources();
  }, [currentPage, perPage]);


  const displayResources = allResources.filter(res => 
    res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (res as any).category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const breadcrumbItems = [
    { label: "Teaching Resources", isCurrent: true },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Consistent Breadcrumb Bar */}
      <div className="border-b border-border bg-white/80 backdrop-blur-md sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Consistent Header Section */}
      <section className="bg-white border-b border-slate-100 py-4 sm:py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl tracking-tight mb-2">
            Teaching Resources
          </h1>
          <p className="text-base text-slate-500 max-w-2xl font-medium leading-relaxed">
            Explore our curated collection of free templates, worksheets, and guides designed specifically for educators and teaching professionals.
          </p>
        </div>
      </section>

      {/* Modern Filter Strip (Keep this design) */}
      <section className="bg-white border-b border-slate-100 shadow-sm sticky top-[101px] z-30">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="group flex items-center gap-2.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:border-primary/40 hover:text-primary hover:bg-slate-50 transition-all duration-300 shadow-sm"
              >
                Category
                <ChevronDown className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-all duration-300" />
              </button>
              <button
                className="group flex items-center gap-2.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:border-primary/40 hover:text-primary hover:bg-slate-50 transition-all duration-300 shadow-sm"
              >
                Language
                <ChevronDown className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-all duration-300" />
              </button>
              
              <div className="relative group min-w-[140px]">
                <select 
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-1.5 pr-10 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:border-primary/40 hover:text-primary transition-all duration-300 shadow-sm focus:outline-none cursor-pointer"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none group-hover:text-primary transition-colors" />
              </div>
            </div>

            <div className="relative w-full max-w-sm">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
               </div>
               <input
                 type="text"
                 placeholder="Search resources..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-slate-400"
               />
            </div>
          </div>
        </div>
      </section>

      {/* Sectioned Grid Content */}
      <div className="mx-auto max-w-7xl px-4 pt-4 pb-12 sm:px-6 lg:px-8 space-y-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm italic text-slate-400">
            <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-lg font-medium">Preparing your resources...</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-slate-500">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive/50 mb-4" />
            <p className="text-lg font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && displayResources.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-slate-500 font-medium italic">
            <p className="text-lg">We couldn't find any resources matching your search.</p>
          </div>
        )}

        {!loading && !error && displayResources.length > 0 && (
          Object.entries(
            displayResources.reduce((acc, res) => {
              const category = (res as any).category || "General Resources";
              if (!acc[category]) acc[category] = [];
              acc[category].push(res);
              return acc;
            }, {} as Record<string, ResourceData[]>)
          ).map(([category, items], sectionIndex) => (
            <div key={category} className="group/section">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1 bg-primary rounded-full" />
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    {category}
                  </h2>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                    {items.length} Items
                  </span>
                </div>
              </div>

              <div className="relative group/carousel">
                {/* Left Navigation Button */}
                <button 
                  onClick={() => {
                    const el = document.getElementById(`carousel-${sectionIndex}`);
                    if (el) el.scrollBy({ left: -el.offsetWidth * 0.8, behavior: 'smooth' });
                  }}
                  className="absolute -left-4 xl:-left-12 top-[40%] -translate-y-1/2 z-20 p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/40 shadow-xl transition-all duration-300 hidden lg:flex active:scale-90"
                  title="Previous"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                {/* Right Navigation Button */}
                <button 
                  onClick={() => {
                    const el = document.getElementById(`carousel-${sectionIndex}`);
                    if (el) el.scrollBy({ left: el.offsetWidth * 0.8, behavior: 'smooth' });
                  }}
                  className="absolute -right-4 xl:-right-12 top-[40%] -translate-y-1/2 z-20 p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/40 shadow-xl transition-all duration-300 hidden lg:flex active:scale-90"
                  title="Next"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                <div 
                  id={`carousel-${sectionIndex}`}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:gap-4 lg:overflow-x-auto pb-6 px-1 lg:px-2 lg:scroll-smooth lg:no-scrollbar lg:scroll-snap-x lg:snap-mandatory gap-3"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {items.map((resource) => (
                    <div key={resource.slug} className="w-full lg:w-[205px] shrink-0 lg:snap-start">
                      <ResourceCard
                        resource={resource}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Pagination Section */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex justify-center mt-12 pb-8">
            <JobPagination
              currentPage={currentPage}
              totalPages={pagination.last_page}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </div>

    </div>
  );
}
