"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import CompanyCard from "@/shared/cards/CompanyCard/CompanyCard";
import { normalizeMediaUrl } from "@/services/api/client";
import { FeaturedInstitutionsProps } from "@/types/components";

export const FeaturedInstitutions = (props: FeaturedInstitutionsProps) => {
  const { institutions } = props;
  const companiesRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    requestAnimationFrame(() => {
      if (companiesRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = companiesRef.current;
        setCanScrollLeft(scrollLeft > 50);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 50);
      }
    });
  };

  useEffect(() => {
    // Defer initial scroll state check to avoid triggering a synchronous forced reflow on mount
    const mountTimeout = setTimeout(checkScroll, 200);
    
    let timeoutId: NodeJS.Timeout;
    const debouncedCheckScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScroll, 100);
    };

    const companiesEl = companiesRef.current;
    if (companiesEl) {
      companiesEl.addEventListener('scroll', debouncedCheckScroll, { passive: true });
    }
    
    window.addEventListener('resize', debouncedCheckScroll, { passive: true });
    
    return () => {
      if (companiesEl) companiesEl.removeEventListener('scroll', debouncedCheckScroll);
      window.removeEventListener('resize', debouncedCheckScroll);
      clearTimeout(timeoutId);
      clearTimeout(mountTimeout);
    };
  }, [institutions]);



  const showContent = institutions && Array.isArray(institutions) && institutions.length > 0;

  return (
    <section className="pt-12 pb-20 bg-[#F7F9FC] overflow-hidden relative">
      <div className="max-w-none w-full">
        
        {/* Header - Center Title with Right-aligned "View All" */}
        <div className="relative mb-10 px-4 md:px-12">
          <div className="text-center mb-14 px-4">
            <h2 className="text-[32px] md:text-[32px] font-extrabold text-[#111827] tracking-tight mb-2">
              Top Institutions Hiring
            </h2>
            <p className="text-[16px] md:text-[18px] text-slate-600 font-normal">
              Leading institutions actively looking for educators
            </p>
          </div>
          <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 hidden md:block z-10">
            <Link
              href="/institutions"
              className="group flex items-center gap-2 text-blue-600 font-semibold"
            >
              View All Institutions <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          {/* Mobile View All */}
          <div className="text-right mt-4 md:hidden">
            <Link
              href="/institutions"
              className="text-blue-600 font-semibold"
            >
              View All Institutions
            </Link>
          </div>
        </div>

        <div className="relative group/carousel">
          {showContent ? (
            <>
              {/* Side Navigation Buttons */}
              {canScrollLeft && (
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (companiesRef.current) companiesRef.current.scrollBy({ left: -304, behavior: 'smooth' });
                    setTimeout(checkScroll, 500);
                  }}
                  aria-label="Scroll institutions left"
                  className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-[70] h-10 w-10 md:h-12 md:w-12 rounded-full border shadow-xl flex items-center justify-center transition-all duration-300 focus:outline-none pointer-events-auto cursor-pointer bg-[#1e3a8a] border-transparent text-white hover:bg-[#1e40af] active:scale-95 animate-in fade-in duration-200"
                >
                  <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" />
                </button>
              )}
              
              {canScrollRight && (
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (companiesRef.current) companiesRef.current.scrollBy({ left: 304, behavior: 'smooth' });
                    setTimeout(checkScroll, 500);
                  }}
                  aria-label="Scroll institutions right"
                  className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-[70] h-10 w-10 md:h-12 md:w-12 rounded-full border shadow-xl flex items-center justify-center transition-all duration-300 focus:outline-none pointer-events-auto cursor-pointer bg-[#1e3a8a] border-transparent text-white hover:bg-[#1e40af] active:scale-95 animate-in fade-in duration-200"
                >
                  <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />
                </button>
              )}

              <div 
                ref={companiesRef} 
                className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-10 pt-2 px-[calc(50%-120px)] md:px-12 snap-x snap-mandatory" 
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Start Spacer */}
                <div className="shrink-0 w-px md:hidden" />
                {institutions.map((institution) => {
                  const imageUrl = normalizeMediaUrl(institution.company_logo);

                  return (
                    <div 
                      key={institution.id} 
                      className="shrink-0 w-[240px] md:w-[240px] snap-center md:snap-start"
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
                {/* End Spacer */}
                <div className="shrink-0 w-px md:hidden" />
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 font-semibold bg-white rounded-2xl mx-4 md:mx-12 border border-slate-200 shadow-sm">
              No top institutions available at the moment.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedInstitutions;
