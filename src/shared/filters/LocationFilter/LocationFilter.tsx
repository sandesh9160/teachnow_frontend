"use client";

import { MapPin } from "lucide-react";

interface LocationFilterProps {
  locations: string[];
  selected: string[];
  onToggle: (location: string) => void;
  onSearchChange?: (val: string) => void;
}

export const LocationFilter = ({ 
  locations, 
  selected, 
  onToggle, 
}: LocationFilterProps) => {
  return (
    <div className="mb-8 p-1">
      <h4 className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-800 uppercase tracking-wider">
        <MapPin className="h-4 w-4 text-primary" /> Location
      </h4>
      
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
        {locations.map((loc) => {
          const isSelected = selected.includes(loc);
          return (
            <label
              key={loc}
              className={`group flex cursor-pointer items-center justify-between gap-3 text-sm py-2 px-3 rounded-lg border transition-all duration-300 ${
                isSelected 
                ? "bg-primary/10 border-primary/20 text-primary" 
                : "bg-white border-transparent hover:border-slate-100 text-slate-500 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full transition-all duration-300 ${isSelected ? "bg-primary scale-125 shadow-sm shadow-primary/40" : "bg-slate-300"}`} />
                <span className="truncate">{loc}</span>
              </div>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(loc)}
                className="sr-only"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default LocationFilter;
