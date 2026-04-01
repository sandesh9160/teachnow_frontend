"use client";

import { Search, Loader2 } from "lucide-react";
import JobCard from "@/shared/cards/JobCard/JobCard";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Job } from "@/types/homepage";
import { normalizeMediaUrl } from "@/services/api/client";

interface JobsGridProps {
  jobs: Job[];
  loading: boolean;
  onClearAll: () => void;
}

export const JobsGrid = ({ jobs, loading, onClearAll }: JobsGridProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground font-medium">Gathering best opportunities for you...</p>
      </div>
    );
  }

  if (jobs.length === 0) {
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
    <div className="grid grid-cols-1 gap-6">
      {jobs.map((job) => {
        const salary = (() => {
          const min = Number(job.salary_min || 0);
          const max = Number(job.salary_max || 0);
          if (!min && !max) return "Not disclosed";
          const fmt = (n: number) => n >= 100000 ? `${(n/100000).toFixed(1)}L` : n.toLocaleString("en-IN");
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
          />
        );
      })}
    </div>
  );
};

export default JobsGrid;
