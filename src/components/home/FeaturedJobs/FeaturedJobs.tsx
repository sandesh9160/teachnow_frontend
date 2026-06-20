"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import JobCard from "@/shared/cards/JobCard/JobCard";
import { formatDate } from "@/lib/utils";
import { FeaturedJobsProps } from "@/types/components";

export const FeaturedJobs = ({ jobs }: FeaturedJobsProps) => {
  const jobsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    requestAnimationFrame(() => {
      if (jobsRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = jobsRef.current;
        // Use a larger threshold to prevent snap/sub-pixel offsets from showing buttons initially
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

    const jobsEl = jobsRef.current;
    if (jobsEl) {
      jobsEl.addEventListener('scroll', debouncedCheckScroll, { passive: true });
    }
    
    window.addEventListener('resize', debouncedCheckScroll, { passive: true });
    
    return () => {
      if (jobsEl) jobsEl.removeEventListener('scroll', debouncedCheckScroll);
      window.removeEventListener('resize', debouncedCheckScroll);
      clearTimeout(timeoutId);
      clearTimeout(mountTimeout);
    };
  }, [jobs]);

  const showContent = jobs && Array.isArray(jobs) && jobs.length > 0;

  return (
    <section className="pt-12 pb-20 bg-white overflow-hidden relative">
      <div className="max-w-none w-full px-4 md:px-12">
        {/* Header - Center Title with Right-aligned "View All" */}
        <div className="relative mb-10">
          <div className="text-center mb-14 px-4">
            <h2 className="text-[32px] md:text-[32px] font-extrabold text-[#111827] tracking-tight mb-2">
              Featured Jobs
            </h2>
            <p className="text-[16px] md:text-[18px] text-slate-600 font-normal">
              Hand-picked opportunities from top institutions
            </p>
          </div>
          <div className="absolute right-0 md:right-0 top-1/2 -translate-y-1/2 hidden md:block z-10">
            <Link
              href="/jobs"
              className="group flex items-center gap-2 text-blue-600 font-semibold"
            >
              View All Jobs <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          {/* Mobile View All */}
          <div className="text-right mt-4 md:hidden">
            <Link
              href="/jobs"
              className="text-blue-600 font-semibold"
            >
              View All Jobs
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
                    if (jobsRef.current) jobsRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                    setTimeout(checkScroll, 500);
                  }}
                  aria-label="Scroll jobs left"
                  className="absolute -left-4 md:-left-4 top-1/2 -translate-y-1/2 z-[70] h-10 w-10 md:h-12 md:w-12 rounded-full border shadow-xl flex items-center justify-center transition-all duration-300 focus:outline-none pointer-events-auto cursor-pointer bg-[#1e3a8a] border-transparent text-white hover:bg-[#1e40af] active:scale-95 animate-in fade-in duration-200"
                >
                  <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" />
                </button>
              )}

              {canScrollRight && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (jobsRef.current) jobsRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                    setTimeout(checkScroll, 500);
                  }}
                  aria-label="Scroll jobs right"
                  className="absolute -right-4 md:-right-4 top-1/2 -translate-y-1/2 z-[70] h-10 w-10 md:h-12 md:w-12 rounded-full border shadow-xl flex items-center justify-center transition-all duration-300 focus:outline-none pointer-events-auto cursor-pointer bg-[#1e3a8a] border-transparent text-white hover:bg-[#1e40af] active:scale-95 animate-in fade-in duration-200"
                >
                  <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />
                </button>
              )}

              <div
                ref={jobsRef}
                className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-10 pt-2 px-[calc(50%-150px)] md:px-0 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Start Spacer */}
                <div className="shrink-0 w-px md:hidden" />
                 {jobs.map((job) => {
                  const companyName = job.employer?.company_name || "Confidential School";
                  const companyLogo = job.employer?.company_logo || "";
                  const salary = (() => {
                    const parseVal = (v: any) => (!v || v === "null" || v === "0") ? 0 : Number(v);
                    const min = parseVal(job.salary_min);
                    const max = parseVal(job.salary_max);
                    if (!min && !max) return "Not disclosed";
                    const fmt = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(1)}L` : n.toLocaleString("en-IN");
                    return `${fmt(min)} - ${fmt(max)}`;
                  })();

                  return (
                    <div key={job.id} className="w-[300px] md:w-[320px] shrink-0 snap-center md:snap-start">
                      <JobCard
                        id={job.id}
                        title={job.title}
                        company={companyName}
                        logo={companyLogo}
                        location={job.location}
                        slug={job.slug}
                        type={job.job_type.replaceAll(/_/g, " ").replaceAll(/\b\w/g, (c) => c.toUpperCase())}
                        salary={salary}
                        tags={[]}
                        posted={job.created_at ? `Posted on ${formatDate(job.created_at)}` : ""}
                        gender={job.gender}
                        experience={job.experience_required}
                        experienceType={job.experience_type}
                        institutionType={job.employer?.institution_type || job.institution_type}
                      />
                    </div>
                  );
                })}
                {/* End Spacer */}
                <div className="shrink-0 w-px md:hidden" />
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 font-semibold bg-slate-50 rounded-2xl mx-4 md:mx-12 border border-slate-100">
              No featured jobs available at the moment.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;
