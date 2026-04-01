"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
    <section className="py-12 md:py-16 bg-white">
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
          <button
            onClick={() => scrollCarousel('left')}
            aria-label="Previous jobs"
            suppressHydrationWarning={true}
            className="absolute -left-5 md:-left-5 lg:-left-6 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background shadow-lg flex items-center justify-center text-muted-foreground cursor-pointer transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 max-md:left-2 max-md:top-auto max-md:bottom-2 max-md:translate-y-0"
          >
            <ArrowLeft className="h-[18px] w-[18px]" />
          </button>
          <div ref={jobsRef} className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
          <button
            onClick={() => scrollCarousel('right')}
            aria-label="Next jobs"
            suppressHydrationWarning={true}
            className="absolute -right-5 md:-right-5 lg:-right-6 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background shadow-lg flex items-center justify-center text-muted-foreground cursor-pointer transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 max-md:right-2 max-md:top-auto max-md:bottom-2 max-md:translate-y-0"
          >
            <ArrowRight className="h-[18px] w-[18px]" />
          </button>
        </div>
        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="gap-2 text-primary border-primary/20 hover:bg-primary/5">
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
