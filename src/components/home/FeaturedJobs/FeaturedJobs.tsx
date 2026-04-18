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
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (jobsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = jobsRef.current;
      // Use a larger threshold for mobile sub-pixel issues
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    // Extensive check sequence to ensure layout is settled
    checkScroll();
    const t1 = setTimeout(checkScroll, 100);
    const t2 = setTimeout(checkScroll, 500);
    const t3 = setTimeout(checkScroll, 1000);
    
    window.addEventListener('resize', checkScroll);
    return () => {
      window.removeEventListener('resize', checkScroll);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [jobs]);

  if (!jobs || !Array.isArray(jobs) || jobs.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-white overflow-hidden relative">
      <div className="max-w-none w-full">
        {/* Header - Center Title with Right-aligned "View All" */}
        <div className="relative mb-10 px-4 md:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#111827] md:text-4xl">
              Featured <span className="text-blue-600">Jobs</span>
            </h2>
            <p className="mt-2 text-lg text-slate-500 font-medium tracking-wide">
              Hand-picked opportunities from top institutions
            </p>
          </div>
          <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 hidden md:block">
            <Link 
              href="/jobs" 
              className="group flex items-center gap-2 text-blue-600 font-bold hover:underline"
            >
              View All Jobs <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          {/* Mobile View All */}
          <div className="text-center mt-4 md:hidden">
            <Link 
              href="/jobs" 
              className="text-blue-600 font-bold hover:underline"
            >
              View All Jobs
            </Link>
          </div>
        </div>
        
        <div className="relative group/carousel">
          {/* Side Navigation Buttons */}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (jobsRef.current) jobsRef.current.scrollBy({ left: -300, behavior: 'smooth' });
              setTimeout(checkScroll, 500);
            }}
            disabled={jobs.length <= 1}
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
              if (jobsRef.current) jobsRef.current.scrollBy({ left: 300, behavior: 'smooth' });
              setTimeout(checkScroll, 500);
            }}
            disabled={jobs.length <= 1}
            className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-[70] h-10 w-10 md:h-12 md:w-12 rounded-full border shadow-xl flex items-center justify-center transition-all duration-300 focus:outline-none pointer-events-auto cursor-pointer ${
              canScrollRight 
                ? "bg-[#1e3a8a] border-transparent text-white hover:bg-[#1e40af] active:scale-95" 
                : "bg-white border-slate-200 text-slate-400 opacity-60"
            }`}
          >
            <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />
          </button>

          <div 
            ref={jobsRef} 
            onScroll={checkScroll}
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-8 px-4 md:px-12 snap-x snap-mandatory" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {jobs.map((job) => {
              const companyName = job.employer?.company_name || "Confidential School";
              const companyLogo = job.employer?.company_logo || "";

              return (
                <div key={job.id} className="w-[280px] md:w-[380px] shrink-0 snap-start">
                  <JobCard
                    id={job.id}
                    title={job.title}
                    company={companyName}
                    logo={companyLogo}
                    location={job.location}
                    slug={job.slug}
                    type={job.job_type.replaceAll(/_/g, " ").replaceAll(/\b\w/g, (c) => c.toUpperCase())}
                    salary={`${job.salary_min} - ${job.salary_max}`}
                    tags={[]}
                    posted={job.created_at ? `Posted on ${formatDate(job.created_at)}` : ""}
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

export default FeaturedJobs;
