"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import JobCard from "@/shared/cards/JobCard/JobCard";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Job } from "@/types/homepage";
import { normalizeMediaUrl } from "@/services/api/client";
import JobCardSkeleton from "@/shared/cards/JobCard/JobCardSkeleton";
import { cn } from "@/lib/utils";

interface JobsGridProps {
  jobs: Job[];
  loading: boolean;
  onClearAll: () => void;
}

export const JobsGrid = ({ jobs, loading, onClearAll }: JobsGridProps) => {
  if (loading && jobs.length === 0) {
    return (
      <div className="flex flex-col gap-12">
        {/* Branded Logo Loader */}
        <div className="flex flex-col items-center justify-center py-10 animate-in fade-in duration-700">
          <div className="relative">
            <div className="h-24 w-24 rounded-[22%] bg-white flex items-center justify-center p-2 animate-pulse shadow-2xl shadow-blue-900/10 border border-slate-100">
              <Image
                src="/images/branded-logo.png"
                alt="TeachNow Logo"
                width={96}
                height={96}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="absolute inset-0 h-24 w-24 rounded-[22%] border-4 border-blue-600 animate-ping opacity-20" />
          </div>
          <div className="mt-8 flex flex-col items-center gap-2">
            <h3 className="text-slate-900 font-bold text-lg tracking-tight">TeachNow</h3>
            <p className="text-slate-400 font-bold tracking-[0.2em] text-[10px] uppercase">Finding your next role...</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {[...Array(6)].map((_, i) => (
            <JobCardSkeleton key={i} compact={true} />
          ))}
        </div>
      </div>
    );
  }

  if (!loading && jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/50 py-24 text-center">
        <div className="bg-primary/5 p-6 rounded-full mb-4">
          <Search className="h-12 w-12 text-primary/40" />
        </div>
        <h3 className="font-display text-2xl font-bold text-foreground">No jobs found</h3>
        <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
          We couldn't find any jobs matching your current filters. Try adjusting your preferences or starting fresh.
        </p>
        <Button variant="outline" size="sm" className="mt-8 px-8" onClick={onClearAll}>
          Clear All Filters
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "grid grid-cols-1 gap-6 transition-opacity duration-300",
      loading ? "opacity-50 pointer-events-none" : "opacity-100"
    )}>
      {jobs.map((job) => {
        const salary = (() => {
          const parseVal = (v: any) => {
            if (!v || v === "null" || v === "0") return 0;
            return Number(v);
          };
          const min = parseVal(job.salary_min);
          const max = parseVal(job.salary_max);
          if (!min && !max) return "Not disclosed";
          const fmt = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(1)}L` : n.toLocaleString("en-IN");
          return `${fmt(min)} - ${fmt(max)}`;
        })();

        const jobType = String(job.job_type || "").replaceAll(/_/g, " ").replaceAll(/\b\w/g, (c) => c.toUpperCase());
        const postedText = job.created_at
          ? `Posted on ${new Date(job.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
          : "Posted recently";

        // Data is now guaranteed to be normalized by useJobs hooks
        const getCompanyName = (job: Job) => job.employer?.company_name || "Confidential School";
        const getCompanyLogo = (job: Job) => job.employer?.company_logo || "";

        const companyName = getCompanyName(job);
        const companyLogo = getCompanyLogo(job);

        return (
          <JobCard
            key={job.id}
            id={job.id}
            title={job.title}
            company={companyName}
            location={job.location || "India"}
            type={jobType}
            salary={salary}
            tags={[]}
            posted={postedText}
            logo={normalizeMediaUrl(companyLogo)}
            slug={job.slug}
            deadline={job.application_deadline}
            gender={job.gender}
            vacancies={job.vacancies}
            institutionType={job.employer?.institution_type || job.institution_type}
            experience={job.experience_required}
            experienceType={job.experience_type}
          />
        );
      })}
    </div>
  );
};

export default JobsGrid;
