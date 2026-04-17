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
    <div className="w-full max-w-4xl mx-auto h-auto">
      <div className="bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col md:flex-row items-stretch md:items-center gap-3 p-2 transition-all duration-300 border border-slate-50">
        
        {/* Subject/Role Search */}
        <div className="relative flex-[1.4] w-full" ref={queryRef}>
          <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50 rounded-xl group focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
            <Search className="h-5 w-5 text-indigo-400 shrink-0" />
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
                  setSelectedIndex(prev => (prev + 1) % (suggestions.roles.length || 1));
                }
                if (e.key === "ArrowUp") {
                  setSelectedIndex(prev => (prev - 1 + (suggestions.roles.length || 1)) % (suggestions.roles.length || 1));
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
              placeholder="Job title, subject..."
              autoComplete="off"
              className="w-full bg-transparent text-slate-800 font-semibold placeholder:text-slate-400 focus:outline-none text-base md:text-lg"
            />
          </div>

          {/* Query Suggestions */}
          {showQuerySuggestions && query.trim().length > 0 && suggestions.roles.length > 0 && (
            <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-50 bg-white rounded-2xl shadow-3xl border border-slate-100 overflow-hidden py-2 text-left">
              {suggestions.roles.slice(0, 5).map((role, index) => (
                <button
                  key={role}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setQuery(role);
                    setShowQuerySuggestions(false);
                  }}
                  className={`w-full text-left px-6 py-3 text-sm font-bold transition-colors ${selectedIndex === index ? "bg-slate-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* City/Location Search */}
        <div className="relative flex-1 w-full" ref={cityRef}>
          <div className="flex items-center gap-3 px-6 py-3.5 bg-slate-50 rounded-xl group focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
            <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
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
                  setSelectedIndex(prev => (prev + 1) % (suggestions.cities.length || 1));
                }
                if (e.key === "ArrowUp") {
                  setSelectedIndex(prev => (prev - 1 + (suggestions.cities.length || 1)) % (suggestions.cities.length || 1));
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
              placeholder="City or remote"
              autoComplete="off"
              className="w-full bg-transparent text-slate-800 font-semibold placeholder:text-slate-400 focus:outline-none text-base md:text-lg"
            />
          </div>

          {/* City Suggestions */}
          {showCitySuggestions && city.trim().length > 0 && suggestions.cities.length > 0 && (
            <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-50 bg-white rounded-2xl shadow-3xl border border-slate-100 overflow-hidden py-2 text-left">
              {suggestions.cities.slice(0, 5).map((c, index) => (
                <button
                  key={c}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setCity(c);
                    setShowCitySuggestions(false);
                  }}
                  className={`w-full text-left px-6 py-3 text-sm font-bold transition-colors ${selectedIndex === index ? "bg-slate-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          className="bg-button-gradient hover:scale-[1.02] active:scale-[0.98] text-white px-8 py-3.5 h-auto rounded-xl font-bold text-lg transition-all shrink-0 w-full md:w-auto shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
          onClick={() => handleSearch()}
          disabled={isLoading}
        >
          <Search className="h-5 w-5" />
          <span>Search</span>
        </Button>
      </div>
    </div>
  );
}