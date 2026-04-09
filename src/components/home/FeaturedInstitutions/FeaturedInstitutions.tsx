"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CompanyCard from "@/shared/cards/CompanyCard/CompanyCard";
import { normalizeMediaUrl } from "@/services/api/client";
import { FeaturedInstitutionsProps } from "@/types/components";

export const FeaturedInstitutions = (props: FeaturedInstitutionsProps) => {
  const { institutions } = props;
  const companiesRef = useRef<HTMLDivElement>(null);



  if (!institutions || !Array.isArray(institutions) || institutions.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-10 pl-2">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Top <span className="text-primary/80">Institutions</span> Hiring
          </h2>
          <p className="mt-2 text-lg text-slate-500 font-medium tracking-wide">
            Work with the most prestigious educational organizations
          </p>
        </div>

        <div className="relative group/carousel">
          {/* Navigation Arrows */}
          <button 
            onClick={() => {
              if (companiesRef.current) companiesRef.current.scrollBy({ left: -companiesRef.current.offsetWidth * 0.8, behavior: 'smooth' });
            }}
            className="absolute -left-4 xl:-left-12 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/40 shadow-xl transition-all duration-300 hidden md:flex active:scale-90"
            title="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div 
            ref={companiesRef} 
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-12 pt-2 px-2" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {institutions.map((institution) => {
              const imageUrl = normalizeMediaUrl(institution.company_logo);

              return (
                <div key={institution.id} className="shrink-0 w-[280px]">
                  <CompanyCard
                    name={institution.company_name}
                    location={institution.location || ""}
                    city={institution.city || ""}
                    logo={imageUrl}
                    slug={institution.slug}
                    openJobs={institution.jobs_count || institution.associated_jobs?.length || 0}
                    type={institution.industry || ""}
                  />
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => {
              if (companiesRef.current) companiesRef.current.scrollBy({ left: companiesRef.current.offsetWidth * 0.8, behavior: 'smooth' });
            }}
            className="absolute -right-4 xl:-right-12 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/40 shadow-xl transition-all duration-300 hidden md:flex active:scale-90"
            title="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Pagination Dots Indicator */}
          <div className="flex justify-center items-center gap-2.5 mt-2">
            <div className="h-2.5 w-2.5 rounded-full bg-primary/30" />
            <div className="h-2.5 w-10 rounded-full bg-primary shadow-sm" />
            <div className="h-2.5 w-2.5 rounded-full bg-primary/30" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedInstitutions;
