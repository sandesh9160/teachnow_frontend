"use client";

import { MapPin, Search } from "lucide-react";
import { useState } from "react";

interface JobLocationFilterProps {
  locations: string[];
  selected: string[];
  onToggle: (location: string) => void;
}

export const JobLocationFilter = ({ locations, selected, onToggle }: JobLocationFilterProps) => {
  const [search, setSearch] = useState("");
  const filtered = locations.filter(loc => loc.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="mb-8">
      <h4 className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-800 uppercase tracking-widest">
        <MapPin className="h-4 w-4 text-primary" /> Location
      </h4>
      
      <div className="relative mb-4 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 text-sm bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all duration-300"
        />
      </div>

      <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
        {filtered.map((loc) => {
          const isSelected = selected.includes(loc);
          return (
            <label
              key={loc}
              className={`group flex cursor-pointer items-center justify-between gap-3 text-sm py-2.5 px-3 rounded-xl border transition-all duration-300 ${
                isSelected 
                ? "bg-primary/5 border-primary/20 text-primary" 
                : "bg-white border-transparent hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full transition-all duration-300 ${isSelected ? "bg-primary scale-125 shadow-sm shadow-primary/40" : "bg-slate-300 group-hover:bg-slate-400"}`} />
                <span className="truncate">{loc}</span>
              </div>
              <input type="checkbox" checked={isSelected} onChange={() => onToggle(loc)} className="sr-only" />
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default JobLocationFilter;
