"use client";

import { useState, useEffect, useRef } from "react";
import { SlidersHorizontal, ArrowUpRight, Search, MapPin, Loader2 } from "lucide-react";import { Button } from "@/shared/ui/Buttons/Buttons";
import { getSearchSuggestions } from "@/hooks/useSearch";

interface JobsHeaderProps {
  search: string;
  setSearch: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  onOpenFilters: () => void;
  onSearch: () => void;
  activeFilterCount: number;
}

export const JobsHeader = ({
  search,
  setSearch,
  location,
  setLocation,
  onOpenFilters,
  onSearch,
  activeFilterCount,
}: JobsHeaderProps) => {
  const [suggestions, setSuggestions] = useState<{ roles: string[]; cities: string[] }>({ roles: [], cities: [] });
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  
  const roleRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  // Click Outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setShowRoleSuggestions(false);
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setShowCitySuggestions(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch Job Title Suggestions
  useEffect(() => {
    if (search.trim().length < 2) {
      setSuggestions(prev => ({ ...prev, roles: [] }));
      return;
    }
    const fetchSugg = async () => {
      setIsSuggesting(true);
      try {
        const data = await getSearchSuggestions(search);
        setSuggestions(prev => ({ ...prev, roles: data.roles || [] }));
      } catch (err) {
        console.error("Role suggestions failed:", err);
      } finally {
        setIsSuggesting(false);
      }
    };
    const timer = setTimeout(fetchSugg, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Location Suggestions
  useEffect(() => {
    if (location.trim().length < 2) {
      setSuggestions(prev => ({ ...prev, cities: [] }));
      return;
    }
    const fetchSugg = async () => {
      setIsSuggesting(true);
      try {
        const data = await getSearchSuggestions(location);
        setSuggestions(prev => ({ ...prev, cities: data.cities || [] }));
      } catch (err) {
        console.error("City suggestions failed:", err);
      } finally {
        setIsSuggesting(false);
      }
    };
    const timer = setTimeout(fetchSugg, 300);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <section className="bg-slate-50 relative z-30 pt-12 pb-6">
      {/* Decorative background circle */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="container relative z-10 px-4">
        {/* Search Pill Container */}
        <div className="mx-auto max-w-3xl">
          <div className="bg-white rounded-2xl md:rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-2 flex flex-col md:flex-row items-center gap-2">
            
            {/* Job Title Input */}
            <div className="relative flex-1 w-full" ref={roleRef}>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50/50 px-4 py-3 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 w-full group">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground/70 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Job Title"
                  className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowRoleSuggestions(true);
                  }}
                  onFocus={() => setShowRoleSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setShowRoleSuggestions(false);
                      onSearch();
                    }
                  }}
                />
                {isSuggesting && <Loader2 className="h-3 w-3 animate-spin text-primary/40" />}
              </div>

              {/* Stylish Role Suggestions */}
              {showRoleSuggestions && suggestions.roles.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="px-4 py-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
                    Suggested Roles
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {suggestions.roles.map((role) => (
                      <button
                        type="button"
                        key={role}
                        onClick={() => {
                          setSearch(role);
                          setShowRoleSuggestions(false);
                          setTimeout(onSearch, 100);
                        }}
                        className="w-full text-left px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors flex items-center gap-3 group/item border-b border-slate-50 last:border-0"
                      >
                        <Search className="h-3.5 w-3.5 text-muted-foreground/30 group-hover/item:text-primary transition-colors" />
                        <span className="text-sm font-medium text-slate-600 group-hover/item:text-slate-900 line-clamp-1">{role}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Location Input */}
            <div className="relative flex-1 w-full" ref={cityRef}>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50/50 px-4 py-3 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 w-full group">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/70 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setShowCitySuggestions(true);
                  }}
                  onFocus={() => setShowCitySuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setShowCitySuggestions(false);
                      onSearch();
                    }
                  }}
                />
              </div>

              {/* Stylish City Suggestions */}
              {showCitySuggestions && suggestions.cities.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="px-4 py-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
                    Popular Locations
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {suggestions.cities.map((city) => (
                      <button
                        type="button"
                        key={city}
                        onClick={() => {
                          setLocation(city);
                          setShowCitySuggestions(false);
                          setTimeout(onSearch, 100);
                        }}
                        className="w-full text-left px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors flex items-center gap-3 group/item border-b border-slate-50 last:border-0"
                      >
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground/30 group-hover/item:text-primary transition-colors" />
                        <span className="text-sm font-medium text-slate-600 group-hover/item:text-slate-900">{city}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button 
              onClick={onSearch}
              className="rounded-xl md:rounded-full h-12 px-8 flex items-center gap-3 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-bold group w-full md:w-auto shrink-0"
            >
              Search
              <div className="bg-white/20 rounded-full p-1 group-hover:rotate-45 transition-transform duration-300">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </Button>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="mt-4 flex justify-center lg:hidden">
            <button
              onClick={onOpenFilters}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100 hover:text-primary transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JobsHeader;
