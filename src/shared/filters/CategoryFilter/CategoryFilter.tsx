"use client";

import { Check } from "lucide-react";

interface CategoryFilterProps {
  categories: string[];
  selected: string[];
  onToggle: (category: string) => void;
  maxInitial?: number;
}

export const CategoryFilter = ({ categories, selected, onToggle }: CategoryFilterProps) => {
  return (
    <div className="mb-8">
      <h4 className="mb-4 text-sm font-bold text-slate-800 uppercase tracking-wider">Subject / Category</h4>
      <div className="flex flex-col gap-2.5">
        {categories.map((cat) => {
          const isSelected = selected.includes(cat);
          return (
            <label
              key={cat}
              className={`group flex cursor-pointer items-center gap-3 text-sm transition-all duration-200 ${
                isSelected ? "text-primary font-semibold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all duration-200 ${
                isSelected 
                ? "bg-primary border-primary shadow-sm shadow-primary/20" 
                : "bg-white border-slate-200 group-hover:border-slate-300"
              }`}>
                {isSelected && <Check className="h-3 w-3 text-white stroke-3" />}
              </div>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(cat)}
                className="sr-only"
              />
              <span className="flex-1 truncate">{cat}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
