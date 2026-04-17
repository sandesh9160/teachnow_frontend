"use client";

import { useState, useEffect, useRef } from "react";
import { SlidersHorizontal, ArrowUpRight, Search, MapPin, Loader2 } from "lucide-react"; 
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
    if (search.trim().length < 2) {
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
    if (location.trim().length < 2) {
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
    <section className="bg-slate-50 relative pt-4 md:pt-12 pb-4 md:pb-6">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="container relative z-10 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="relative group/search-container">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/15 via-primary/5 to-primary/15 rounded-xl blur-xl opacity-0 group-focus-within/search-container:opacity-100 transition-opacity duration-500" />
            
            <div className="relative bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)] border border-slate-200 p-1 md:p-1.5 flex flex-col md:flex-row items-stretch md:items-center gap-1 md:gap-0 transition-all duration-500 focus-within:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)]">

              {/* Job Title Input */}
              <div className="relative flex-[1.2] w-full rounded-lg border border-slate-100 md:border-transparent focus-within:border-primary/40 md:focus-within:border-primary/40 transition-all duration-300" ref={roleRef}>
                <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 group">
                  <div className="p-1.5 md:p-2 bg-slate-100/50 rounded-lg group-focus-within:bg-primary/10 group-focus-within:text-primary transition-colors">
                    <Search className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-0.5 md:mb-1">What</label>
                    <input
                      type="text"
                      placeholder="Role or keyword"
                      autoComplete="off"
                      className="w-full bg-transparent text-xs md:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
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
                  </div>
                  {isSuggesting && <Loader2 className="h-3 w-3 animate-spin text-primary/40 shrink-0" />}
                </div>

                {/* Suggestions - Roles */}
                {showRoleSuggestions && suggestions.roles.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-white/95 backdrop-blur-2xl rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-100/50">
                      Suggested Roles
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                      {suggestions.roles.map((role) => {
                        const startsWithSearch = role.toLowerCase().startsWith(search.toLowerCase());
                        const matchPart = startsWithSearch ? role.slice(0, search.length) : "";
                        const restPart = startsWithSearch ? role.slice(search.length) : role;

                        return (
                          <button
                            type="button"
                            key={role}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setSearch(role);
                              setShowRoleSuggestions(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-primary/5 transition-all flex items-center justify-between group/item cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-slate-400 group-hover/item:bg-white group-hover/item:text-primary group-hover/item:border-primary/20 transition-all duration-300">
                                <Search className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-xs font-medium text-slate-600 group-hover/item:text-slate-900 transition-colors">
                                <span className="font-bold text-slate-900">{matchPart}</span>
                                {restPart}
                              </span>
                            </div>
                            <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden md:block w-px h-10 bg-slate-200/60 mx-1" />

              {/* Location Input */}
              <div className="relative flex-1 w-full rounded-lg border border-slate-100 md:border-transparent focus-within:border-orange-500/40 md:focus-within:border-orange-500/40 transition-all duration-300" ref={cityRef}>
                <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 group">
                  <div className="p-1.5 md:p-2 bg-slate-100/50 rounded-lg group-focus-within:bg-orange-500/10 group-focus-within:text-orange-500 transition-colors">
                    <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <label className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-0.5 md:mb-1">Where</label>
                    <input
                      type="text"
                      placeholder="Location"
                      autoComplete="off"
                      className="w-full bg-transparent text-xs md:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
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
                </div>

                {/* Suggestions - Cities */}
                {showCitySuggestions && suggestions.cities.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-white/95 backdrop-blur-2xl rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="px-4 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-100/50">
                      Popular Locations
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                      {suggestions.cities.map((city) => {
                        const startsWithLocation = city.toLowerCase().startsWith(location.toLowerCase());
                        const matchPart = startsWithLocation ? city.slice(0, location.length) : "";
                        const restPart = startsWithLocation ? city.slice(location.length) : city;

                        return (
                          <button
                            type="button"
                            key={city}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setLocation(city);
                              setShowCitySuggestions(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-orange-500/5 transition-all flex items-center justify-between group/item cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-slate-400 group-hover/item:bg-white group-hover/item:text-orange-500 group-hover/item:border-orange-500/20 transition-all duration-300">
                                <MapPin className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-xs font-medium text-slate-600 group-hover/item:text-slate-900 transition-colors">
                                <span className="font-bold text-slate-900">{matchPart}</span>
                                {restPart}
                              </span>
                            </div>
                            <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                              <svg className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="hero"
                onClick={onSearch}
                disabled={loading}
                className="rounded-lg md:rounded-xl h-11 md:h-[3.25rem] px-6 md:px-8 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold group shrink-0 m-0.5 md:min-w-[160px] w-full md:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="animate-pulse">Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 md:hidden" />
                    <span className="text-sm md:text-base">Search Jobs</span>
                    <div className="hidden md:flex bg-white/20 rounded-lg p-1 group-hover:translate-x-1 transition-transform duration-300">
                      <ArrowUpRight className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    </div>
                  </>
                )}
              </Button>
            </div>
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
