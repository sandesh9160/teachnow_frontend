"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CompanyCard from "@/shared/cards/CompanyCard/CompanyCard";
import { normalizeMediaUrl } from "@/services/api/client";
import { FeaturedInstitutionsProps } from "@/types/components";

export const FeaturedInstitutions = (props: FeaturedInstitutionsProps) => {
  const { institutions } = props;
  const companiesRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (companiesRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = companiesRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const timeout = setTimeout(checkScroll, 500);
    window.addEventListener('resize', checkScroll);
    return () => {
      window.removeEventListener('resize', checkScroll);
      clearTimeout(timeout);
    };
  }, [institutions]);



  if (!institutions || !Array.isArray(institutions) || institutions.length === 0) return null;

  return (
    <section className="pt-12 pb-20 bg-[#f8faff] overflow-hidden relative">
      <div className="max-w-none w-full">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#111827] tracking-tight sm:text-4xl mb-3">
            Top Institutions Hiring
          </h2>
          <p className="text-lg font-medium text-slate-500">
            Leading institutions actively looking for educators
          </p>
        </div>

        <div className="relative group/carousel">
          {/* Side Navigation Buttons */}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (companiesRef.current) companiesRef.current.scrollBy({ left: -304, behavior: 'smooth' });
              setTimeout(checkScroll, 500);
            }}
            disabled={institutions.length <= 1}
            className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-[70] h-10 w-10 md:h-12 md:w-12 rounded-full border shadow-xl flex items-center justify-center transition-all duration-300 focus:outline-none pointer-events-auto cursor-pointer ${
              canScrollLeft 
                ? "bg-[#1e3a8a] border-transparent text-white hover:bg-[#1e40af] active:scale-95" 
                : "bg-white border-slate-200 text-slate-400 opacity-60"
            }`}
          >
            <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" />
          </button>
          
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (companiesRef.current) companiesRef.current.scrollBy({ left: 304, behavior: 'smooth' });
              setTimeout(checkScroll, 500);
            }}
            disabled={institutions.length <= 1}
            className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-[70] h-10 w-10 md:h-12 md:w-12 rounded-full border shadow-xl flex items-center justify-center transition-all duration-300 focus:outline-none pointer-events-auto cursor-pointer ${
              canScrollRight 
                ? "bg-[#1e3a8a] border-transparent text-white hover:bg-[#1e40af] active:scale-95" 
                : "bg-white border-slate-200 text-slate-400 opacity-60"
            }`}
          >
            <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />
          </button>

          <div 
            ref={companiesRef} 
            onScroll={checkScroll}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-10 pt-2 px-4 md:px-12 snap-x snap-mandatory" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {institutions.map((institution) => {
              const imageUrl = normalizeMediaUrl(institution.company_logo);

              return (
                <div 
                  key={institution.id} 
                  className="shrink-0 w-[240px] md:w-[280px] snap-start"
                >
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
        </div>
      </div>
    </section>
  );
};

export default FeaturedInstitutions;
