"use client";

import { useState, useEffect, useRef } from "react";
import { SlidersHorizontal, Search, MapPin, Loader2 } from "lucide-react"; 
import { Button } from "@/shared/ui/Buttons/Buttons";
import { getSearchSuggestions } from "@/hooks/useSearch";

interface JobsHeaderProps {
  search: string;
  setSearch: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  onOpenFilters: () => void;
  onSearch: () => void;
  activeFilterCount: number;
  loading?: boolean;
}

export const JobsHeader = ({
  search,
  setSearch,
  location,
  setLocation,
  onOpenFilters,
  onSearch,
  activeFilterCount,
  loading,
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

  // Fetch Job Title Suggestions with Debounce
  useEffect(() => {
    if (search.trim().length === 0) {
      setSuggestions(prev => ({ ...prev, roles: [] }));
      return;
    }
    const fetchSugg = async () => {
      setIsSuggesting(true);
      try {
        const data = await getSearchSuggestions(search);
        const filteredRoles = (data.roles || []).filter(r => 
          r.toLowerCase().startsWith(search.toLowerCase())
        );
        setSuggestions(prev => ({ ...prev, roles: filteredRoles }));
      } catch (err) {
        // console.error("Role suggestions failed:", err);
      } finally {
        setIsSuggesting(false);
      }
    };
    const timer = setTimeout(fetchSugg, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Location Suggestions with Debounce
  useEffect(() => {
    if (location.trim().length === 0) {
      setSuggestions(prev => ({ ...prev, cities: [] }));
      return;
    }
    const fetchSugg = async () => {
      setIsSuggesting(true);
      try {
        const data = await getSearchSuggestions(location);
        const filteredCities = (data.cities || []).filter(c => 
          c.toLowerCase().startsWith(location.toLowerCase())
        );
        setSuggestions(prev => ({ ...prev, cities: filteredCities }));
      } catch (err) {
        // console.error("City suggestions failed:", err);
      } finally {
        setIsSuggesting(false);
      }
    };
    const timer = setTimeout(fetchSugg, 300);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <section className="bg-white/50 backdrop-blur-sm relative py-3 md:py-4">
      <div className="container relative z-10 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="bg-white rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.06)] flex flex-col md:flex-row items-stretch md:items-center gap-2 p-1.5 transition-all duration-300 border border-slate-50">
            
            {/* Subject/Role Search */}
            <div className="relative flex-[1.4] w-full" ref={roleRef}>
              <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-xl group focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                <Search className="h-5 w-5 text-indigo-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, subject..."
                  autoComplete="off"
                  className="w-full bg-transparent text-slate-800 font-semibold placeholder:text-slate-400 focus:outline-none text-sm md:text-base"
                  suppressHydrationWarning={true}
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
                {isSuggesting && <Loader2 className="h-3 w-3 animate-spin text-indigo-400/40 shrink-0" />}
              </div>

              {/* Suggestions - Roles */}
              {showRoleSuggestions && suggestions.roles.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-50 bg-white rounded-xl shadow-3xl border border-slate-100 overflow-hidden py-2 text-left">
                  {suggestions.roles.slice(0, 5).map((role) => (
                    <button
                      type="button"
                      key={role}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearch(role);
                        setShowRoleSuggestions(false);
                      }}
                      className="w-full text-left px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* City/Location Search */}
            <div className="relative flex-1 w-full" ref={cityRef}>
              <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-xl group focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="City or remote"
                  autoComplete="off"
                  className="w-full bg-transparent text-slate-800 font-semibold placeholder:text-slate-400 focus:outline-none text-sm md:text-base"
                  suppressHydrationWarning={true}
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

              {/* Suggestions - Cities */}
              {showCitySuggestions && suggestions.cities.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-50 bg-white rounded-xl shadow-3xl border border-slate-100 overflow-hidden py-2 text-left">
                  {suggestions.cities.slice(0, 5).map((city) => (
                    <button
                      type="button"
                      key={city}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setLocation(city);
                        setShowCitySuggestions(false);
                      }}
                      className="w-full text-left px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={onSearch}
              disabled={loading}
              className="bg-button-gradient hover:scale-[1.02] active:scale-[0.98] text-white px-8 py-3 h-auto rounded-xl font-bold text-sm md:text-base transition-all shrink-0 w-full md:w-auto shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              <span>{loading ? "Searching..." : "Search Jobs"}</span>
            </Button>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="mt-6 flex justify-center lg:hidden">
            <button
              onClick={onOpenFilters}
              className="flex items-center gap-3 text-sm font-bold text-slate-600 bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-100 hover:text-indigo-600 transition-all active:scale-95"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">
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
