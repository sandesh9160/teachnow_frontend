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
    <section className="pt-12 pb-20 bg-[#f8faff] overflow-hidden relative">
      <div className="max-w-none w-full">
        
        {/* Header - EXACTLY AS REQUESTED */}
        <div className="relative group/carousel">
          {/* Side Navigation Buttons - Higher to avoid blocking footer info */}
          <button 
            onClick={() => {
              if (companiesRef.current) companiesRef.current.scrollBy({ left: -320, behavior: 'smooth' });
            }}
            className="absolute left-1 md:-left-4 top-[40%] -translate-y-1/2 z-50 h-9 w-9 md:h-11 md:w-11 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-slate-100 text-[#1e3a8a] flex items-center justify-center active:scale-90 transition-all"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button 
            onClick={() => {
              if (companiesRef.current) companiesRef.current.scrollBy({ left: 320, behavior: 'smooth' });
            }}
            className="absolute right-1 md:-right-4 top-[40%] -translate-y-1/2 z-50 h-9 w-9 md:h-11 md:w-11 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-slate-100 text-[#1e3a8a] flex items-center justify-center active:scale-90 transition-all"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div 
            ref={companiesRef} 
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-10 pt-2 px-4 md:px-12" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {institutions.map((institution) => {
              const imageUrl = normalizeMediaUrl(institution.company_logo);

              return (
                <div 
                  key={institution.id} 
                  className="shrink-0 w-[280px] md:w-[320px]"
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
