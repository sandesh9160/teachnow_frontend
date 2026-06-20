"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ResourceData } from "@/types/homepage";
import ResourceCard from "@/shared/cards/ResourceCard/ResourceCard";

interface ResourcesClientProps {
  readonly initialResources: ResourceData[];
}

export default function ResourcesClient({ initialResources }: ResourcesClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const displayResources = initialResources.filter(res =>
    res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (res as any).category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Modern Filter Strip */}
      <section className="bg-white border-b border-slate-100 shadow-sm sticky top-[101px] z-30">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter buttons removed */}
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
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-12 sm:px-6 lg:px-8 space-y-12">
        {displayResources.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-slate-500 font-medium italic">
            <p className="text-lg">We couldn't find any resources matching your search.</p>
          </div>
        ) : (
          Object.entries(
            displayResources.reduce((acc, res) => {
              const category = (res as any).category || "General Resources";
              if (!acc[category]) acc[category] = [];
              acc[category].push(res);
              return acc;

            }, {} as Record<string, ResourceData[]>)
          ).map(([category, items], sectionIndex) => (
            <div key={category} className="group/section">
              <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-1 bg-primary rounded-full" />
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
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
                    <div key={resource.slug} className="w-full lg:w-[260px] shrink-0 lg:snap-start">
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
      </div>
    </>
  );
}
