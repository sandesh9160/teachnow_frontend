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
  const [selectedIndex, setSelectedIndex] = useState(-1);

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
      <div className="relative">
        <div className="relative flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-0 rounded-2xl md:rounded-xl border border-slate-200 bg-white p-2 md:p-1.5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.2)] transition-all duration-300">
          
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
                    setSelectedIndex(-1);
                  }}
                  onFocus={() => {
                    setShowQuerySuggestions(true);
                    setSelectedIndex(-1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setSelectedIndex(prev => (prev + 1) % suggestions.roles.length);
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setSelectedIndex(prev => (prev - 1 + suggestions.roles.length) % suggestions.roles.length);
                    }
                    if (e.key === "Enter") {
                      if (selectedIndex >= 0) {
                        const selectedRole = suggestions.roles[selectedIndex];
                        setQuery(selectedRole);
                        setShowQuerySuggestions(false);
                      } else {
                        setShowQuerySuggestions(false);
                        handleSearch();
                      }
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
                    setSelectedIndex(-1);
                  }}
                  onFocus={() => {
                    setShowCitySuggestions(true);
                    setSelectedIndex(-1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setSelectedIndex(prev => (prev + 1) % suggestions.cities.length);
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setSelectedIndex(prev => (prev - 1 + suggestions.cities.length) % suggestions.cities.length);
                    }
                    if (e.key === "Enter") {
                      if (selectedIndex >= 0) {
                        const selectedCity = suggestions.cities[selectedIndex];
                        setCity(selectedCity);
                        setShowCitySuggestions(false);
                      } else {
                        setShowCitySuggestions(false);
                        handleSearch();
                      }
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
          </div>

          <Button
            variant="hero"
            className="rounded-xl md:rounded-xl h-14 md:h-[3.25rem] px-8 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold group shrink-0 m-0.5"
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

          {/* Portal-like absolute suggestions (DIRECT CHILDREN OF THE CONTAINER) */}
          {showQuerySuggestions && query.trim().length > 0 && suggestions.roles.length > 0 && (
            <div className="absolute left-[8px] right-[8px] md:left-[8px] md:right-auto md:w-[380px] top-[calc(100%+8px)] z-[9999] bg-white rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.5)] border border-slate-200 pointer-events-auto overflow-hidden ring-4 ring-black/5">
              <div className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50/50 border-b border-slate-100">
                Suggestions
              </div>
              <div className="max-h-[400px] overflow-y-auto bg-white">
                {suggestions.roles.map((role, index) => {
                  const startsWithQuery = query.length > 0 && role.toLowerCase().startsWith(query.toLowerCase());
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
                      className={`w-full text-left px-5 py-2.5 transition-all flex items-center justify-between group cursor-pointer ${selectedIndex === index ? "bg-slate-50" : "hover:bg-slate-50/50"}`}
                    >
                      <div className="flex items-center gap-3">
                        <Search className="h-4 w-4 text-slate-500" />
                        <span className="text-[14px] font-semibold text-slate-700 group-hover:text-primary transition-colors">
                          <span className="text-primary font-bold">{matchPart}</span>
                          {restPart}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {showCitySuggestions && city.trim().length > 0 && suggestions.cities.length > 0 && (
            <div className="absolute left-[8px] right-[8px] md:left-auto md:right-[140px] md:w-[350px] top-[calc(100%+8px)] z-[9999] bg-white rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.5)] border border-slate-200 pointer-events-auto overflow-hidden ring-4 ring-black/5">
              <div className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50/50 border-b border-slate-100">
                Locations
              </div>
              <div className="max-h-[400px] overflow-y-auto bg-white">
                {suggestions.cities.map((c, index) => {
                  const startsWithCity = city.length > 0 && c.toLowerCase().startsWith(city.toLowerCase());
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
                      className={`w-full text-left px-5 py-2.5 transition-all flex items-center justify-between group cursor-pointer ${selectedIndex === index ? "bg-slate-50" : "hover:bg-slate-50/50"}`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <span className="text-[14px] font-semibold text-slate-700 group-hover:text-primary transition-colors">
                          <span className="text-primary font-bold">{matchPart}</span>
                          {restPart}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
