"use client";

import { useState, useEffect, useRef } from "react";
import { SlidersHorizontal, Search, MapPin, Loader2 } from "lucide-react"; 
import { Button } from "@/shared/ui/Buttons/Buttons";
import { getSearchSuggestions, getLocations, Location } from "@/hooks/useSearch";


interface JobsHeaderProps {
  search: string;
  setSearch: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  onOpenFilters: () => void;
  onSearch: () => void;
  activeFilterCount: number;
  loading?: boolean;
  error?: string;
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
  error,
}: JobsHeaderProps) => {
  const [suggestions, setSuggestions] = useState<{ roles: string[]; cities: string[] }>({ roles: [], cities: [] });
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState(-1);



  const roleRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  // Click Outside
  useEffect(() => {
    const fetchAllLocations = async () => {
      const data = await getLocations();
      setAllLocations(data);
    };
    fetchAllLocations();

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

  // Filter City Suggestions Locally from allLocations
  useEffect(() => {
    if (location.trim().length === 0) {
      setSuggestions(prev => ({ ...prev, cities: [] }));
      return;
    }
    
    const filteredCities = allLocations
      .map(loc => loc.name)
      .filter(name => name.toLowerCase().includes(location.toLowerCase()));
    
    setSuggestions(prev => ({ ...prev, cities: filteredCities }));
  }, [location, allLocations]);

  const handleSearchInternal = () => {
    // Validate city against allLocations
    const isCityValid = !location.trim() || allLocations.length === 0 || allLocations.some(loc => loc.name.toLowerCase() === location.toLowerCase().trim());
    
    if (location.trim() && !isCityValid) {
      setLocation(""); // Clear the invalid text
      return;
    }
    onSearch();
  };

  return (
    <section className="bg-white/50 backdrop-blur-sm relative py-0.5 md:py-1">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.06)] flex flex-col md:flex-row items-stretch md:items-center gap-2 p-1.5 md:p-1 transition-all duration-300 border-transparent md:border-slate-50">
            
            {/* Subject/Role Search */}
            <div className="relative flex-[1.4] w-full" ref={roleRef}>
              <div className="flex items-center gap-3 px-4 py-2 md:py-1.5 bg-slate-50/80 md:bg-slate-50 border-transparent md:border-transparent rounded-xl group focus-within:ring-4 focus-within:ring-blue-600/10 focus-within:border-blue-200 focus-within:bg-white transition-all duration-200">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 shrink-0 transition-colors" />
                <input
                  type="text"
                  placeholder="Job title, subject..."
                  autoComplete="off"
                  className="w-full bg-transparent text-slate-800 font-semibold placeholder:text-slate-400 focus:outline-none text-sm md:text-base"
                  suppressHydrationWarning
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowRoleSuggestions(true);
                    setSelectedIndex(-1);
                  }}
                  onFocus={() => {
                    setShowRoleSuggestions(true);
                    setSelectedIndex(-1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setShowRoleSuggestions(false);
                      handleSearchInternal();
                    }
                  }}
                />
                {isSuggesting && <Loader2 className="h-3 w-3 animate-spin text-blue-600/40 shrink-0" />}
              </div>

              {/* Suggestions - Roles */}
              {showRoleSuggestions && suggestions.roles.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-white rounded-lg shadow-lg overflow-hidden py-1 text-left">
                  {suggestions.roles.slice(0, 5).map((role, idx) => (
                    <button
                      type="button"
                      key={role}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearch(role);
                        setShowRoleSuggestions(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-[13px] font-semibold transition-colors ${selectedIndex === idx ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* City/Location Search */}
            <div className="relative flex-1 w-full" ref={cityRef}>
              <div className="flex items-center gap-3 px-4 py-2 md:py-1.5 bg-slate-50/80 md:bg-slate-50 border-transparent md:border-transparent rounded-xl group focus-within:ring-4 focus-within:ring-blue-600/10 focus-within:border-blue-200 focus-within:bg-white transition-all duration-200">
                <MapPin className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 shrink-0 transition-colors" />
                <input
                  type="text"
                  placeholder="City or remote"
                  autoComplete="off"
                  className="w-full bg-transparent text-slate-800 font-semibold placeholder:text-slate-400 focus:outline-none text-sm md:text-base"
                  suppressHydrationWarning
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setShowCitySuggestions(true);
                    setSelectedIndex(-1);
                  }}
                  onFocus={() => {
                    setShowCitySuggestions(true);
                    setSelectedIndex(-1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setShowCitySuggestions(false);
                      handleSearchInternal();
                    }
                  }}
                />
              </div>

              {/* Suggestions - Cities */}
              {showCitySuggestions && suggestions.cities.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-white rounded-lg shadow-lg overflow-hidden py-1 text-left">
                  {suggestions.cities.slice(0, 5).map((city, idx) => (
                    <button
                      type="button"
                      key={city}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setLocation(city);
                        setShowCitySuggestions(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-[13px] font-semibold transition-colors ${selectedIndex === idx ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleSearchInternal}
              disabled={loading || (!!location && allLocations.length > 0 && !allLocations.some(loc => loc.name.toLowerCase() === location.toLowerCase().trim()))}
              className={`px-8 py-3 h-auto rounded-xl font-bold text-sm md:text-base transition-all shrink-0 w-full md:w-auto flex items-center justify-center gap-2 ${
                (loading || (!!location && allLocations.length > 0 && !allLocations.some(loc => loc.name.toLowerCase() === location.toLowerCase().trim())))
                ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                : "bg-button-gradient text-white shadow-lg shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              <span>{loading ? "Searching..." : "Search Jobs"}</span>
            </Button>
          </div>

          {/* Validation Error Message */}
          {error && (
            <div className="mt-2 px-2 animate-in fade-in slide-in-from-top-1 duration-300">
              <p className="text-[12px] font-bold text-red-500 flex items-center gap-1.5 bg-red-50 w-fit px-3 py-1 rounded-full border border-red-100 shadow-sm">
                <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                {error}
              </p>
            </div>
          )}

          {/* Mobile Filter Toggle */}
          <div className="mt-6 flex justify-center lg:hidden">
            <button
              onClick={onOpenFilters}
              suppressHydrationWarning
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
