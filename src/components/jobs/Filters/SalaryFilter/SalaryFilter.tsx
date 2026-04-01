"use client";

import { Banknote, Check } from "lucide-react";

interface SalaryFilterProps {
  ranges: string[];
  selected: string[];
  onToggle: (range: string) => void;
}

export const SalaryFilter = ({ ranges, selected, onToggle }: SalaryFilterProps) => {
  return (
    <div className="mb-8">
      <h4 className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
        <Banknote className="h-3.5 w-3.5" /> Salary Range
      </h4>
      <div className="flex flex-col gap-2.5">
        {ranges.map((range) => {
          const isSelected = selected.includes(range);
          return (
            <label
              key={range}
              className={`group flex cursor-pointer items-center justify-between text-sm py-2 px-3 rounded-lg transition-all duration-300 ${
                isSelected ? "text-primary font-semibold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all duration-200 ${
                  isSelected ? "bg-primary border-primary" : "bg-white border-slate-200"
                }`}>
                  {isSelected && <Check className="h-3 w-3 text-white stroke-3" />}
                </div>
                <span>{range}</span>
              </div>
              <input type="checkbox" checked={isSelected} onChange={() => onToggle(range)} className="sr-only" />
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default SalaryFilter;
