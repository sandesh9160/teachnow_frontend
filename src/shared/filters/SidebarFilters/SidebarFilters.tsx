import { Filter, RotateCcw, Check, Briefcase, GraduationCap, Banknote } from "lucide-react";
import CategoryFilter from "../CategoryFilter/CategoryFilter";
import LocationFilter from "../LocationFilter/LocationFilter";
import { Button } from "@/shared/ui/Buttons/Buttons";

interface SidebarFiltersProps {
  categories: string[];
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

const GenericFilter = ({ 
  title, 
  icon: Icon, 
  options, 
  selected, 
  onToggle 
}: { 
  title: string, 
  icon: any, 
  options: string[], 
  selected: string[], 
  onToggle: (val: string) => void 
}) => (
  <div className="mb-8 p-1">
    <h4 className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-800 uppercase tracking-wider">
      {Icon && <Icon className="h-4 w-4 text-primary" />} {title}
    </h4>
    <div className="flex flex-col gap-2.5">
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <label key={opt} className={`group flex cursor-pointer items-center gap-3 text-sm transition-all duration-200 ${isSelected ? "text-primary font-semibold" : "text-slate-500 hover:text-slate-900"}`}>
            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all duration-200 ${isSelected ? "bg-primary border-primary shadow-sm shadow-primary/20" : "bg-white border-slate-200 group-hover:border-slate-300"}`}>
              {isSelected && <Check className="h-3 w-3 text-white stroke-3" />}
            </div>
            <input type="checkbox" checked={isSelected} onChange={() => onToggle(opt)} className="sr-only" />
            <span className="flex-1 truncate">{opt}</span>
          </label>
        );
      })}
    </div>
  </div>
);

export const SidebarFilters = ({
  categories,
  locations,
  jobTypes,
  experienceLevels,
  salaryRanges,
  selectedFilters,
  onToggle,
  onClearAll,
  activeFilterCount,
}: SidebarFiltersProps) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm h-full flex flex-col font-sans">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50 transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Filter className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-display text-xl font-bold text-slate-900 tracking-tight">Active Filters</h3>
        </div>
        
        {activeFilterCount > 0 && (
          <button 
            onClick={onClearAll} 
            className="group flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-all duration-300 hover:scale-105"
          >
            <RotateCcw className="h-3 w-3 transition-transform duration-500 group-hover:rotate-180" />
            Reset
          </button>
        )}
      </div>

      <div className="flex-1 space-y-10 overflow-y-auto pr-2 scrollbar-hide">
        <CategoryFilter
          categories={categories}
          selected={selectedFilters.subjects}
          onToggle={(v) => onToggle("subjects", v)}
        />

        <LocationFilter
          locations={locations}
          selected={selectedFilters.locations}
          onToggle={(v) => onToggle("locations", v)}
        />

        <GenericFilter
          title="Job Type"
          icon={Briefcase}
          options={jobTypes}
          selected={selectedFilters.types}
          onToggle={(v) => onToggle("types", v)}
        />

        <GenericFilter
          title="Experience"
          icon={GraduationCap}
          options={experienceLevels}
          selected={selectedFilters.experience}
          onToggle={(v) => onToggle("experience", v)}
        />

        <GenericFilter
          title="Salary Range"
          icon={Banknote}
          options={salaryRanges}
          selected={selectedFilters.salary}
          onToggle={(v) => onToggle("salary", v)}
        />
      </div>

      {activeFilterCount > 0 && (
        <div className="pt-8 border-t border-slate-50 mt-10">
          <Button 
            className="w-full h-12 rounded-xl shadow-lg shadow-primary/20 font-bold tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            onClick={onClearAll}
          >
            Clear {activeFilterCount} Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default SidebarFilters;
