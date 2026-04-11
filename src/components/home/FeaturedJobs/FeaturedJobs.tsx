"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import JobCard from "@/shared/cards/JobCard/JobCard";
import { formatDate } from "@/lib/utils";
import { FeaturedJobsProps } from "@/types/components";

export const FeaturedJobs = ({ jobs }: FeaturedJobsProps) => {
  const jobsRef = useRef<HTMLDivElement>(null);



  if (!jobs || !Array.isArray(jobs) || jobs.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-white overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-10 pl-2">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Trending <span className="text-primary/80">Opportunities</span>
          </h2>
          <p className="mt-2 text-lg text-slate-500 font-medium tracking-wide">
            Explore all open roles from top educational institutions
          </p>
        </div>
        
        <div className="relative group/carousel">
          {/* Circular Navigation Buttons */}
          {jobs.length > 1 && (
            <>
              <button 
                onClick={() => {
                  if (jobsRef.current) jobsRef.current.scrollBy({ left: -jobsRef.current.offsetWidth * 0.8, behavior: 'smooth' });
                }}
                className="absolute -left-4 xl:-left-12 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/40 shadow-xl transition-all duration-300 hidden lg:flex active:scale-90"
                title="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button 
                onClick={() => {
                  if (jobsRef.current) jobsRef.current.scrollBy({ left: jobsRef.current.offsetWidth * 0.8, behavior: 'smooth' });
                }}
                className="absolute -right-4 xl:-right-12 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/40 shadow-xl transition-all duration-300 hidden lg:flex active:scale-90"
                title="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div ref={jobsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:gap-4 lg:overflow-x-auto lg:scrollbar-hide lg:scroll-smooth pb-4 px-1 lg:px-2 gap-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {jobs.map((job) => {
              const companyName = job.employer?.company_name || "Confidential School";
              const companyLogo = job.employer?.company_logo || "";

              return (
                <div key={job.id} className="w-full lg:w-[340px] shrink-0">
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
