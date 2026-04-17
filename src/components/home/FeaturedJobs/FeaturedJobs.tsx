"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import JobCard from "@/shared/cards/JobCard/JobCard";
import { formatDate } from "@/lib/utils";
import { FeaturedJobsProps } from "@/types/components";

export const FeaturedJobs = ({ jobs }: FeaturedJobsProps) => {
  const jobsRef = useRef<HTMLDivElement>(null);

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
          {/* Side Navigation Buttons - Higher placement to avoid buttons */}
          <button 
            onClick={() => {
              if (jobsRef.current) jobsRef.current.scrollBy({ left: -300, behavior: 'smooth' });
            }}
            className="absolute left-1 md:-left-4 top-[35%] -translate-y-1/2 z-50 h-9 w-9 md:h-12 md:w-12 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-slate-100 text-[#1e3a8a] flex items-center justify-center active:scale-90 transition-all"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button 
            onClick={() => {
              if (jobsRef.current) jobsRef.current.scrollBy({ left: 300, behavior: 'smooth' });
            }}
            className="absolute right-1 md:-right-4 top-[35%] -translate-y-1/2 z-50 h-9 w-9 md:h-12 md:w-12 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-slate-100 text-[#1e3a8a] flex items-center justify-center active:scale-90 transition-all"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div 
            ref={jobsRef} 
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-8 px-4 md:px-12" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {jobs.map((job) => {
              const companyName = job.employer?.company_name || "Confidential School";
              const companyLogo = job.employer?.company_logo || "";

              return (
                <div key={job.id} className="w-[280px] md:w-[380px] shrink-0">
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
