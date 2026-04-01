"use client";

import { Briefcase} from "lucide-react";

interface JobTypeFilterProps {
  types: string[];
  selected: string[];
  onToggle: (type: string) => void;
}

export const JobTypeFilter = ({ types, selected, onToggle }: JobTypeFilterProps) => {
  return (
    <div className="mb-8">
      <h4 className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-800 uppercase tracking-widest">
        <Briefcase className="h-4 w-4 text-primary" /> Job Type
      </h4>
      <div className="flex flex-wrap gap-2">
        {types.map((type) => {
          const isSelected = selected.includes(type);
          return (
            <button
              key={type}
              onClick={() => onToggle(type)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                isSelected
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                  : "bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default JobTypeFilter;
