"use client";

import { JobsFilters } from "@/types/jobs";
// import FilterCard from "../shared/FilterCard";
import FilterSection from "../shared/FilterSection";
import CheckboxItem from "../shared/CheckboxItem";

interface JobFilterSidebarProps {
  selectedFilters: JobsFilters;
  onToggle: (category: keyof JobsFilters, value: string) => void;
  availableSubjects?: string[];
  availableLocations?: string[];
}

export const JobFilterSidebar = ({
  selectedFilters,
  onToggle,
  availableSubjects = [],
  availableLocations = [],
}: JobFilterSidebarProps) => {
  const jobTypeOptions = [
    { value: "Full-time", label: "Full Time" },
    { value: "Part-time", label: "Part Time" },
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
    { value: "0-2", label: "0 - 2" },
    { value: "2-5", label: "2 - 5" },
    { value: "5-10", label: "5 - 10" },
    { value: "10-50", label: "10+" },
  ];

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "both", label: "Any" },
  ];

  const handleClearAll = () => {
    Object.keys(selectedFilters).forEach((key) => {
      if (Array.isArray(selectedFilters[key as keyof JobsFilters])) {
        // This is a bit tricky with the current onToggle, but usually one would have a bulk action.
        // For now, I'll just clear the common ones.
        (selectedFilters[key as keyof JobsFilters] as string[]).forEach(val => onToggle(key as keyof JobsFilters, val));
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filters</h3>
        <button 
          onClick={handleClearAll}
          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          suppressHydrationWarning={true}
        >
          Clear all
        </button>
      </div>

      <div className="space-y-4">
        {availableSubjects.length > 0 && (
          <FilterSection title="Subject">
            <div className="grid grid-cols-3 gap-x-1 gap-y-0.5">
              {availableSubjects.map((sub) => (
                <CheckboxItem
                  key={sub}
                  label={sub}
                  checked={selectedFilters.subjects?.includes(sub) || false}
                  onChange={() => onToggle("subjects", sub)}
                />
              ))}
            </div>
          </FilterSection>
        )}

        {availableLocations.length > 0 && (
          <FilterSection title="Location">
            <div className="grid grid-cols-3 gap-x-1 gap-y-0.5">
              {availableLocations.map((loc) => (
                <CheckboxItem
                  key={loc}
                  label={loc}
                  checked={selectedFilters.locations?.includes(loc) || false}
                  onChange={() => onToggle("locations", loc)}
                />
              ))}
            </div>
          </FilterSection>
        )}

        <FilterSection title="Institution Type">
          <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
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

        <FilterSection title="Experience">
          <div className="grid grid-cols-3 gap-x-1 gap-y-0.5">
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



        <FilterSection title="Job type">
          <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
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

        <FilterSection title="Gender">
          <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
            {genderOptions.map((opt) => (
              <CheckboxItem
                key={opt.value}
                label={opt.label}
                checked={selectedFilters.gender?.includes(opt.value) || false}
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
