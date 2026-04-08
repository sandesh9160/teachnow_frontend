"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import JobCard from "@/shared/cards/JobCard/JobCard";
import { formatDate } from "@/lib/utils";
import { FeaturedJobsProps } from "@/types/components";

export const FeaturedJobs = ({ jobs }: FeaturedJobsProps) => {
  const jobsRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = useCallback((direction: 'left' | 'right') => {
    if (!jobsRef.current) return;
    const scrollAmount = 340;
    jobsRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  }, []);

  if (!jobs || !Array.isArray(jobs) || jobs.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-white overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-10 pl-2">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Featured <span className="text-primary/80">Job</span> Opportunities
          </h2>
          <p className="mt-2 text-lg text-slate-500 font-medium tracking-wide">
            Hand-picked opportunities from top educational institutions
          </p>
        </div>
        
        <div className="relative group/carousel">
          {/* Circular Navigation Buttons */}
          <div className="absolute inset-y-0 -left-4 -right-4 flex items-center justify-between pointer-events-none z-20">
            <button
               onClick={() => scrollCarousel('left')}
               aria-label="Previous jobs"
               className="pointer-events-auto w-12 h-12 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:scale-110 active:scale-90 transition-all ml-1 md:ml-0"
            >
               <ChevronLeft className="w-7 h-7" />
            </button>
            <button
               onClick={() => scrollCarousel('right')}
               aria-label="Next jobs"
               className="pointer-events-auto w-12 h-12 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:scale-110 active:scale-90 transition-all mr-1 md:mr-0"
            >
               <ChevronRight className="w-7 h-7" />
            </button>
          </div>

          <div ref={jobsRef} className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {jobs.map((job) => {
              const companyName = job.employer?.company_name || "Confidential School";
              const companyLogo = job.employer?.company_logo || "";

              return (
                <div key={job.id} className="shrink-0 w-[340px]">
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

        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="gap-2 text-primary border-primary/20 hover:bg-primary/5 h-11 px-8 rounded-xl font-semibold">
            <Link href="/jobs">
              View All Jobs <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;
