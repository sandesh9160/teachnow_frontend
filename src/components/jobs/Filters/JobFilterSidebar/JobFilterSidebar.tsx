"use client";

// import { useState } from "react";
import { JobsFilters } from "@/types/jobs";
import FilterSection from "../shared/FilterSection";
import CheckboxItem from "../shared/CheckboxItem";


interface JobFilterSidebarProps {
  selectedFilters: Partial<JobsFilters>;
  onToggle: (category: string, value: string) => void;
  onClearAll: () => void;
}

export const JobFilterSidebar = ({
  selectedFilters,
  onToggle,
  onClearAll,
}: JobFilterSidebarProps) => {


  const jobTypeOptions = [
    { value: "Full Time", label: "Full Time" },
    { value: "Part Time", label: "Part Time" },
  ];



  const institutionTypeOptions = [
    { value: "UG", label: "UG" },
    { value: "PG", label: "PG" },
    { value: "Diploma", label: "Diploma" },
    { value: "School", label: "School" },
    { value: "Intermediate", label: "Intermediate" },
  ];

  const experienceRanges = [
    { value: "0-0", label: "Fresher" },
    { value: "0-2", label: "0 - 2 Years" },
    { value: "2-5", label: "2 - 5 Years" },
    { value: "5-10", label: "5 - 10 Years" },
    { value: "10-50", label: "10+ Years" },
  ];

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "both", label: "Both" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filters</h3>
        <button
          onClick={onClearAll}
          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          suppressHydrationWarning={true}
        >
          Clear all
        </button>
      </div>

      <div className="space-y-4">
        <FilterSection title="Institution Type">
          <div className="flex flex-col gap-y-0.5">
            {institutionTypeOptions.map((opt) => (
              <CheckboxItem
                key={opt.value}
                label={opt.label}
                checked={(selectedFilters.institution_type || []).includes(opt.value)}
                onChange={() => onToggle("institution_type", opt.value)}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Experience">
          <div className="flex flex-col gap-y-0.5">
            {experienceRanges.map((range) => (
              <CheckboxItem
                key={range.value}
                label={range.label}
                checked={(selectedFilters.experience || []).includes(range.value)}
                onChange={() => onToggle("experience", range.value)}
              />
            ))}
          </div>
        </FilterSection>



        <FilterSection title="Job type">
          <div className="flex flex-col gap-y-0.5">
            {jobTypeOptions.map((opt) => (
              <CheckboxItem
                key={opt.value}
                label={opt.label}
                checked={(selectedFilters.job_type || []).includes(opt.value)}
                onChange={() => onToggle("job_type", opt.value)}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Gender">
          <div className="flex flex-col gap-y-0.5">
            {genderOptions.map((opt) => (
              <CheckboxItem
                key={opt.value}
                label={opt.label}
                checked={(selectedFilters.gender || []).includes(opt.value)}
                onChange={() => onToggle("gender", opt.value)}
              />
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );
};

export default JobFilterSidebar;
