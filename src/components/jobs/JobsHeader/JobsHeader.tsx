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
  const [emptySearchError, setEmptySearchError] = useState(false);

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

  // Fetch Job Title Suggestions with Debounce and AbortController
  useEffect(() => {
    if (search.trim().length === 0) {
      setSuggestions(prev => ({ ...prev, roles: [] }));
      return;
    }

    const controller = new AbortController();

    const fetchSugg = async () => {
      setIsSuggesting(true);
      try {
        const data = await getSearchSuggestions(search, controller.signal);
        const filteredRoles = (data.roles || []).filter(r =>
          r.toLowerCase().startsWith(search.toLowerCase())
        );
        setSuggestions(prev => ({ ...prev, roles: filteredRoles }));
      } catch (err: any) {
        if (err.name !== "AbortError" && err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          // console.error("Role suggestions failed:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSuggesting(false);
        }
      }
    };

    const timer = setTimeout(fetchSugg, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search]);

  // Fetch City Suggestions from API with Debounce and AbortController
  useEffect(() => {
    if (location.trim().length === 0) {
      setSuggestions(prev => ({ ...prev, cities: [] }));
      return;
    }

    const controller = new AbortController();

    const fetchCitySugg = async () => {
      try {
        const data = await getSearchSuggestions(location, controller.signal);
        const filteredCities = (data.cities || []).filter(name =>
          name.toLowerCase().startsWith(location.toLowerCase())
        );
        setSuggestions(prev => ({ ...prev, cities: filteredCities }));
      } catch (err: any) {
        if (err.name !== "AbortError" && err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          // console.error("City suggestions failed:", err);
        }
      }
    };

    const timer = setTimeout(fetchCitySugg, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [location, allLocations]);

  // Clear invalid location on blur — dropdown selection only
  const handleLocationBlur = () => {
    if (location.trim() && allLocations.length > 0) {
      const isValid = allLocations.some(
        loc => loc.name.toLowerCase() === location.toLowerCase().trim()
      );
      if (!isValid) {
        setLocation("");
      }
    }
  };

  const handleSearchInternal = () => {
    // Validate city against allLocations — clear if invalid
    const isCityValid =
      !location.trim() ||
      allLocations.length === 0 ||
      allLocations.some(loc => loc.name.toLowerCase() === location.toLowerCase().trim());

    let finalLocation = location;
    if (location.trim() && !isCityValid) {
      setLocation("");
      finalLocation = "";
    }

    // At least one of title or city is required
    if (!search.trim() && !finalLocation.trim()) {
      setEmptySearchError(true);
      return;
    }
    setEmptySearchError(false);

    onSearch();
  };

  return (
    <section className="bg-white/50 backdrop-blur-sm relative py-0.5 md:py-1">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="mx-auto w-full">
          <div className="bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col md:flex-row items-stretch md:items-center gap-3 p-1.5 md:p-2 transition-all duration-300 border border-slate-200 hover:border-indigo-300 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">

            {/* Subject/Role Search */}
            <div className="relative flex-[1.4] w-full" ref={roleRef}>
              <div className={`flex items-center gap-3 px-5 py-2.5 rounded-xl transition-all border ${
                emptySearchError 
                  ? "bg-slate-50/80 md:bg-slate-50 border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100" 
                  : "bg-slate-50/80 md:bg-slate-50 border-transparent focus-within:border-indigo-200"
              }`}>
                <Search className={`h-4 w-4 shrink-0 ${emptySearchError ? "text-red-400" : "text-indigo-400"}`} />
                <input
                  type="text"
                  placeholder="Job title, subject..."
                  autoComplete="off"
                  suppressHydrationWarning
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setEmptySearchError(false);
                    setShowRoleSuggestions(true);
                    setSelectedIndex(-1);
                  }}
                  onFocus={() => {
                    setShowRoleSuggestions(true);
                    setSelectedIndex(-1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setSelectedIndex(prev => (prev + 1) % (suggestions.roles.length || 1));
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setSelectedIndex(prev => (prev - 1 + (suggestions.roles.length || 1)) % (suggestions.roles.length || 1));
                    }
                    if (e.key === "Enter") {
                      if (selectedIndex >= 0) {
                        const selectedRole = suggestions.roles[selectedIndex];
                        setSearch(selectedRole);
                        setShowRoleSuggestions(false);
                      } else {
                        setShowRoleSuggestions(false);
                        handleSearchInternal();
                      }
                    }
                    if (e.key === "Escape") setShowRoleSuggestions(false);
                  }}
                  className="w-full bg-transparent text-slate-800 font-semibold placeholder:text-slate-400 focus:outline-none text-[15px]"
                />
                {isSuggesting && <Loader2 className="h-3 w-3 animate-spin text-indigo-400/40 shrink-0" />}
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
                      className={`w-full text-left px-4 py-2 text-[13px] font-semibold transition-colors ${
                        selectedIndex === idx ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </div>            
            
            {/* City/Location Search — dropdown only */}
            <div className="relative flex-1 w-full flex flex-col items-stretch" ref={cityRef}>
              <div className="flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all border bg-slate-50/80 md:bg-slate-50 border-transparent focus-within:border-indigo-200">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="text"
                  placeholder="Select city"
                  autoComplete="off"
                  suppressHydrationWarning
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setEmptySearchError(false);
                    setShowCitySuggestions(true);
                    setSelectedIndex(-1);
                  }}
                  onFocus={() => {
                    setShowCitySuggestions(true);
                    setSelectedIndex(-1);
                  }}
                  onBlur={handleLocationBlur}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setSelectedIndex(prev => (prev + 1) % (suggestions.cities.length || 1));
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setSelectedIndex(prev => (prev - 1 + (suggestions.cities.length || 1)) % (suggestions.cities.length || 1));
                    }
                    if (e.key === "Enter") {
                      if (selectedIndex >= 0) {
                        const selectedCity = suggestions.cities[selectedIndex];
                        setLocation(selectedCity);
                        setShowCitySuggestions(false);
                      } else {
                        setShowCitySuggestions(false);
                        handleSearchInternal();
                      }
                    }
                    if (e.key === "Escape") setShowCitySuggestions(false);
                  }}
                  className="w-full bg-transparent text-slate-800 font-semibold placeholder:text-slate-400 focus:outline-none text-[15px]"
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
                      className={`w-full text-left px-4 py-2 text-[13px] font-semibold transition-colors ${
                        selectedIndex === idx ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleSearchInternal}
              disabled={loading}
              className={`px-8 py-2.5 h-auto rounded-xl font-bold text-base transition-all shrink-0 w-full md:w-auto flex items-center justify-center gap-3 ${
                loading
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                  : "bg-button-gradient hover:scale-[1.02] active:scale-[0.98] text-white shadow-xl shadow-indigo-100"
              }`}
            >
              <Search className="h-5 w-5" />
              <span>Search Jobs</span>
            </Button>
          </div>

          {emptySearchError && (
            <div className="mt-2 px-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <p className="text-[13px] font-semibold text-red-500 flex items-center gap-1.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-red-500" />
                Please enter a job title or select a city
              </p>
            </div>
          )}
 

          {/* External error prop (e.g. from parent) */}

      
          {error && (

            <div className="mt-2 px-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <p className="text-[13px] font-semibold text-red-500 flex items-center gap-1.5">
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
