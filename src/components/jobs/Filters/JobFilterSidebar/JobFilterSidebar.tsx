"use client";

import { JobsFilters } from "@/types/jobs";
import FilterCard from "../shared/FilterCard";
import FilterSection from "../shared/FilterSection";
import CheckboxItem from "../shared/CheckboxItem";
import RecruitingCard from "../shared/RecruitingCard";

interface JobFilterSidebarProps {
  selectedFilters: JobsFilters;
  onToggle: (category: keyof JobsFilters, value: string) => void;
}

export const JobFilterSidebar = ({
  selectedFilters,
  onToggle,
}: JobFilterSidebarProps) => {
  const jobTypeOptions = [
    { value: "Full-time", label: "Full Time" },
    { value: "Part-time", label: "Part Time" },
  ];

  const experienceRanges = [
    { value: "0-0", label: "Fresher" },
    { value: "0-2", label: "0 - 2 Years" },
    { value: "2-5", label: "2 - 5 Years" },
    { value: "5-10", label: "5 - 10 Years" },
    { value: "10-50", label: "10+ Years" },
  ];

  const salaryRanges = [
    { value: "0-5", label: "0 - 5 Lakhs" },
    { value: "5-10", label: "5 - 10 Lakhs" },
    { value: "10-15", label: "10 - 15 Lakhs" },
  ];

  const institutionTypeOptions = [
    { value: "UG", label: "UG" },
    { value: "PG", label: "PG" },
    { value: "Diploma", label: "Diploma" },
    { value: "School", label: "School" },
    { value: "Intermediate", label: "Intermediate" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <FilterCard>
        <div className="space-y-10">
          <FilterSection title="Job type">
            <div className="space-y-3">
              {jobTypeOptions.map((opt) => (
                <CheckboxItem
                  key={opt.value}
                  label={opt.label}
                  checked={selectedFilters.types?.includes(opt.value) || false}
                  onChange={() => onToggle("types", opt.value)}
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Experience (Years)">
            <div className="space-y-3">
              {experienceRanges.map((range) => (
                <CheckboxItem
                  key={range.value}
                  label={range.label}
                  checked={selectedFilters.experience?.includes(range.value) || false}
                  onChange={() => onToggle("experience", range.value)}
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Institution Type">
            <div className="space-y-3">
              {institutionTypeOptions.map((opt) => (
                <CheckboxItem
                  key={opt.value}
                  label={opt.label}
                  checked={selectedFilters.institution_type?.includes(opt.value) || false}
                  onChange={() => onToggle("institution_type", opt.value)}
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Salary (LPA)">
            <div className="space-y-3">
              {salaryRanges.map((range) => (
                <CheckboxItem
                  key={range.value}
                  label={range.label}
                  checked={selectedFilters.salary?.includes(range.value) || false}
                  onChange={() => onToggle("salary", range.value)}
                />
              ))}
            </div>
          </FilterSection>
        </div>
      </FilterCard>

      <RecruitingCard />
    </div>
  );
};

export default JobFilterSidebar;
