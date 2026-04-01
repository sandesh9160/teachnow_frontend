"use client";

import { useRef, useCallback } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import CompanyCard from "@/shared/cards/CompanyCard/CompanyCard";
import { normalizeMediaUrl } from "@/services/api/client";
import { FeaturedInstitutionsProps } from "@/types/components";

export const FeaturedInstitutions = (props: FeaturedInstitutionsProps) => {
  const { institutions } = props;
  const companiesRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = useCallback((direction: 'left' | 'right') => {
    if (!companiesRef.current) return;
    const scrollAmount = 280;
    companiesRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  }, []);

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
            onClick={() => scrollCarousel('left')} 
            suppressHydrationWarning={true} 
            className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 -translate-x-4 group-hover/carousel:translate-x-0 border border-slate-100"
          >
            <ArrowLeft className="h-6 w-6" />
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
            onClick={() => scrollCarousel('right')} 
            suppressHydrationWarning={true} 
            className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 translate-x-4 group-hover/carousel:translate-x-0 border border-slate-100"
          >
            <ArrowRight className="h-6 w-6" />
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
