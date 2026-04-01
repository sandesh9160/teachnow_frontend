"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { getSearchSuggestions } from "@/hooks/useSearch";

interface SearchBarProps {
  // no props needed
}

export function SearchBar({}: SearchBarProps) {
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

  // Fetch Query Suggestions
  useEffect(() => {
    if (query.trim().length === 0) {
      setSuggestions(prev => ({ ...prev, roles: [] }));
      return;
    }
    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const data = await getSearchSuggestions(query);
        setSuggestions(prev => ({ ...prev, roles: data.roles || [] }));
      } catch (err) {
        console.error("Query suggestions failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestions();
  }, [query]);

  // Fetch City Suggestions
  useEffect(() => {
    if (city.trim().length === 0) {
      setSuggestions(prev => ({ ...prev, cities: [] }));
      return;
    }
    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const data = await getSearchSuggestions(city);
        setSuggestions(prev => ({ ...prev, cities: data.cities || [] }));
      } catch (err) {
        console.error("City suggestions failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestions();
  }, [city]);

  const handleSearch = (searchQuery?: string, searchCity?: string) => {
    const activeQuery = typeof searchQuery === "string" ? searchQuery : query;
    const activeCity = typeof searchCity === "string" ? searchCity : city;
    const combined = [activeQuery, activeCity].filter(Boolean).join(" ");
    
    // SEO-friendly slug generation
    const slug = decodeURIComponent(combined.replaceAll("+", " "))
      .toLowerCase()
      .trim()
      .replaceAll(/[^a-z0-9]+/g, "-") // Replace all non-alphanumeric with hyphens
      .replaceAll(/^-+|-+$/g, "");    // Remove leading/trailing hyphens

    if (!slug) return;
    router.push(`/jobs/${slug}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="flex flex-col gap-2 rounded-2xl md:rounded-full border border-slate-100 bg-white p-2 shadow-[0_20px_50px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center relative z-40 overflow-visible">
        {/* Subject/Role Search */}
        <div className={`relative flex-1 ${showQuerySuggestions ? "z-50" : "z-10"}`} ref={queryRef}>
          <label htmlFor="query-search-input" className="sr-only">Search job titles or keywords</label>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50/50 px-4 py-3 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 group">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground/70 group-focus-within:text-primary transition-colors" aria-hidden="true" />
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
              placeholder="Search job titles or keywords..."
              suppressHydrationWarning
              className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          {/* Custom Stylish Suggestions - Roles */}
          {showQuerySuggestions && suggestions.roles.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="px-4 py-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
                Suggested Roles
              </div>
              <div className="max-h-64 overflow-y-auto">
                {suggestions.roles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setQuery(role);
                      setShowQuerySuggestions(false);
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

        <div className="h-8 w-px bg-border hidden sm:block mx-1" />

        {/* City/Location Search */}
        <div className={`relative flex-1 ${showCitySuggestions ? "z-50" : "z-10"}`} ref={cityRef}>
          <label htmlFor="city-search-input" className="sr-only">City or location</label>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50/50 px-4 py-3 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 group">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/70 group-focus-within:text-primary transition-colors" aria-hidden="true" />
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
              suppressHydrationWarning
              className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          {/* Custom Stylish Suggestions - Cities */}
          {showCitySuggestions && suggestions.cities.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="px-4 py-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest bg-slate-50 border-b border-slate-100">
                Popular Locations
              </div>
              <div className="max-h-64 overflow-y-auto">
                {suggestions.cities.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCity(c);
                      setShowCitySuggestions(false);
                    }}
                    className="w-full text-left px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors flex items-center gap-3 group/item border-b border-slate-50 last:border-0"
                  >
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/30 group-hover/item:text-primary transition-colors" />
                    <span className="text-sm font-medium text-slate-600 group-hover/item:text-slate-900 line-clamp-1">{c}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button 
          variant="hero"
          size="lg" 
          className="rounded-xl md:rounded-full h-12 px-8 flex items-center gap-3 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-bold group w-full sm:w-auto shrink-0" 
          onClick={() => handleSearch()} 
          disabled={isLoading}
        >
          Search
          <div className="bg-white/20 rounded-full p-1 group-hover:rotate-45 transition-transform duration-300">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </Button>
      </div>
    </div>
  );
}
