"use client";


const FilterSection = ({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
}) => (
  <div className="mb-6">
    <h4 className="mb-3 text-sm font-semibold text-foreground">{title}</h4>
    <div className="flex flex-col gap-2">
      {options.map((opt) => (
        <label
          key={opt}
          className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => onToggle(opt)}
            className="h-4 w-4 rounded border-border text-primary accent-primary"
          />
          {opt}
        </label>
      ))}
    </div>
  </div>
);

interface JobSidebarProps {
  subjects: string[];
  locations: string[];
  jobTypes: string[];
  experienceLevels: string[];
  salaryRanges: string[];
  selectedFilters: {
    subjects: string[];
    locations: string[];
    types: string[];
    experience: string[];
    salary: string[];
  };
  onToggle: (category: string, value: string) => void;
  onClearAll: () => void;
  activeFilterCount: number;
}

export const JobSidebar = ({
  subjects,
  locations,
  jobTypes,
  experienceLevels,
  salaryRanges,
  selectedFilters,
  onToggle,
  onClearAll,
  activeFilterCount,
}: JobSidebarProps) => {
  return (
    <div className="sticky top-24 rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-foreground">Filters</h3>
        {activeFilterCount > 0 && (
          <button onClick={onClearAll} className="text-xs font-medium text-primary hover:underline">
            Clear all
          </button>
        )}
      </div>

      <FilterSection
        title="Subject"
        options={subjects}
        selected={selectedFilters.subjects}
        onToggle={(v) => onToggle("subjects", v)}
      />
      <FilterSection
        title="Location"
        options={locations}
        selected={selectedFilters.locations}
        onToggle={(v) => onToggle("locations", v)}
      />
      <FilterSection
        title="Job Type"
        options={jobTypes}
        selected={selectedFilters.types}
        onToggle={(v) => onToggle("types", v)}
      />
      <FilterSection
        title="Experience Level"
        options={experienceLevels}
        selected={selectedFilters.experience}
        onToggle={(v) => onToggle("experience", v)}
      />
      <FilterSection
        title="Salary Range"
        options={salaryRanges}
        selected={selectedFilters.salary}
        onToggle={(v) => onToggle("salary", v)}
      />
    </div>
  );
};

export default JobSidebar;
