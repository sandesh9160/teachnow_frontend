"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { getSearchSuggestions } from "@/hooks/useSearch";

interface SearchBarProps {
  // no props needed
}

export function SearchBar({ }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [showQuerySuggestions, setShowQuerySuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const [suggestions, setSuggestions] = useState<{ roles: string[]; cities: string[] }>({ roles: [], cities: [] });
  const [isLoading, setIsLoading] = useState(false);

  const queryRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (queryRef.current && !queryRef.current.contains(e.target as Node)) setShowQuerySuggestions(false);
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setShowCitySuggestions(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch Query Suggestions with Debounce
  useEffect(() => {
    if (query.trim().length === 0) {
      setSuggestions(prev => ({ ...prev, roles: [] }));
      return;
    }
    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const data = await getSearchSuggestions(query);
        const filteredRoles = (data.roles || []).filter(r => 
          r.toLowerCase().startsWith(query.toLowerCase())
        );
        setSuggestions(prev => ({ ...prev, roles: filteredRoles }));
      } catch (err) {
        // console.error("Query suggestions failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch City Suggestions with Debounce
  useEffect(() => {
    if (city.trim().length === 0) {
      setSuggestions(prev => ({ ...prev, cities: [] }));
      return;
    }
    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const data = await getSearchSuggestions(city);
        const filteredCities = (data.cities || []).filter(c => 
          c.toLowerCase().startsWith(city.toLowerCase())
        );
        setSuggestions(prev => ({ ...prev, cities: filteredCities }));
      } catch (err) {
        // console.error("City suggestions failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [city]);

  const handleSearch = (searchQuery?: string, searchCity?: string) => {
    const activeQuery = typeof searchQuery === "string" ? searchQuery : query;
    const activeCity = typeof searchCity === "string" ? searchCity : city;
    const combined = [activeQuery, activeCity].filter(Boolean).join(" ");

    const slug = decodeURIComponent(combined.replaceAll("+", " "))
      .toLowerCase()
      .trim()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/^-+|-+$/g, "");

    if (!slug) return;
    router.push(`/jobs/${slug}`);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative group/search-container">
        {/* Glow effect Backdrop */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 rounded-xl blur-xl opacity-0 group-focus-within/search-container:opacity-100 transition-opacity duration-500" />
        
        <div className="relative flex flex-col md:flex-row items-stretch md:items-center gap-0 rounded-xl border border-slate-200 bg-white/90 backdrop-blur-xl p-1.5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)] focus-within:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] transition-all duration-500">
          
          {/* Subject/Role Search */}
          <div className="relative flex-[1.2] rounded-lg border border-slate-200 focus-within:border-primary/40 transition-all duration-300" ref={queryRef}>
            <div className="flex items-center gap-3 px-4 py-3 group">
              <div className="p-2 bg-slate-100/50 rounded-lg group-focus-within:bg-primary/10 group-focus-within:text-primary transition-colors">
                <Search className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="flex flex-col flex-1">
                <label htmlFor="query-search-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1">What</label>
                <input
                  type="text"
                  id="query-search-input"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowQuerySuggestions(true);
                  }}
                  onFocus={() => setShowQuerySuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setShowQuerySuggestions(false);
                      handleSearch();
                    }
                    if (e.key === "Escape") setShowQuerySuggestions(false);
                  }}
                  placeholder="Job title, keywords..."
                  autoComplete="off"
                  suppressHydrationWarning
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Suggestions - Roles */}
            {showQuerySuggestions && suggestions.roles.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-white/95 backdrop-blur-2xl rounded-xl shadow-[0_15px_50px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-300">
                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-100/50">
                  Popular Searches
                </div>
                <div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
                  {suggestions.roles.map((role) => {
                    const startsWithQuery = role.toLowerCase().startsWith(query.toLowerCase());
                    const matchPart = startsWithQuery ? role.slice(0, query.length) : "";
                    const restPart = startsWithQuery ? role.slice(query.length) : role;

                    return (
                      <button
                        key={role}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setQuery(role);
                          setShowQuerySuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/5 transition-all flex items-center justify-between group/item cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-slate-400 group-hover/item:bg-white group-hover/item:text-primary group-hover/item:border-primary/20 transition-all duration-300">
                            <Search className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-semibold text-slate-600 group-hover/item:text-slate-900 transition-colors">
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

          {/* City/Location Search */}
          <div className="relative flex-1 rounded-lg border border-slate-200 focus-within:border-orange-500/40 transition-all duration-300" ref={cityRef}>
            <div className="flex items-center gap-3 px-4 py-3 group">
              <div className="p-2 bg-slate-100/50 rounded-lg group-focus-within:bg-orange-500/10 group-focus-within:text-orange-500 transition-colors">
                <MapPin className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="flex flex-col flex-1">
                <label htmlFor="city-search-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1">Where</label>
                <input
                  type="text"
                  id="city-search-input"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setShowCitySuggestions(true);
                  }}
                  onFocus={() => setShowCitySuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setShowCitySuggestions(false);
                      handleSearch();
                    }
                    if (e.key === "Escape") setShowCitySuggestions(false);
                  }}
                  placeholder="City or location"
                  autoComplete="off"
                  suppressHydrationWarning
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Suggestions - Cities */}
            {showCitySuggestions && suggestions.cities.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-white/95 backdrop-blur-2xl rounded-xl shadow-[0_15px_50px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-300">
                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-100/50">
                  Trending Locations
                </div>
                <div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
                  {suggestions.cities.map((c) => {
                    const startsWithCity = c.toLowerCase().startsWith(city.toLowerCase());
                    const matchPart = startsWithCity ? c.slice(0, city.length) : "";
                    const restPart = startsWithCity ? c.slice(city.length) : c;

                    return (
                      <button
                        key={c}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setCity(c);
                          setShowCitySuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-500/5 transition-all flex items-center justify-between group/item cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-slate-400 group-hover/item:bg-white group-hover/item:text-orange-500 group-hover/item:border-orange-500/20 transition-all duration-300">
                            <MapPin className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-semibold text-slate-600 group-hover/item:text-slate-900 transition-colors">
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
            className="md:rounded-xl h-12 md:h-[3.25rem] px-8 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold group shrink-0 m-0.5"
            onClick={() => handleSearch()}
            disabled={isLoading}
          >
            <Search className="h-4 w-4 md:hidden" />
            <span>Search Jobs</span>
            <div className="hidden md:flex bg-white/20 rounded-lg p-1 group-hover:translate-x-1 transition-transform duration-300">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
