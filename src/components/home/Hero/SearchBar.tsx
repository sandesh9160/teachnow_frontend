"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { getSearchSuggestions, getLocations, Location } from "@/hooks/useSearch";


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
  const [emptySearchError, setEmptySearchError] = useState(false);

  const [suggestions, setSuggestions] = useState<{ roles: string[]; cities: string[] }>({ roles: [], cities: [] });
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);



  const queryRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  const handleLoadLocations = async () => {
    const data = await getLocations();
    setAllLocations(data);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (queryRef.current && !queryRef.current.contains(e.target as Node)) setShowQuerySuggestions(false);
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setShowCitySuggestions(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch Query Suggestions with Debounce and AbortController
  useEffect(() => {
    if (query.trim().length === 0) {
      setSuggestions(prev => {
        if (prev.roles.length === 0) return prev;
        return { ...prev, roles: [] };
      });
      return;
    }

    const controller = new AbortController();

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const data = await getSearchSuggestions(query, controller.signal);
        const filteredRoles = (data.roles || []).filter(r =>
          r.toLowerCase().startsWith(query.toLowerCase())
        );
        setSuggestions(prev => ({ ...prev, roles: filteredRoles }));
      } catch (err: any) {
        if (err.name !== "AbortError" && err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          // console.error("Query suggestions failed:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Fetch City Suggestions from API with Debounce and AbortController
  useEffect(() => {
    if (city.trim().length === 0) {
      setSuggestions(prev => {
        if (prev.cities.length === 0) return prev;
        return { ...prev, cities: [] };
      });
      return;
    }

    const controller = new AbortController();

    const fetchCitySugg = async () => {
      try {
        const data = await getSearchSuggestions(city, controller.signal);
        const filteredCities = (data.cities || []).filter(name =>
          name.toLowerCase().startsWith(city.toLowerCase())
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
  }, [city]);

  // Clear invalid city on blur — must be selected from dropdown only
  const handleCityBlur = () => {
    if (city.trim() && allLocations.length > 0) {
      const isValid = allLocations.some(
        loc => loc.name.toLowerCase() === city.toLowerCase().trim()
      );
      if (!isValid) {
        setCity("");
      }
    }
  };

  const handleSearch = (searchQuery?: string, searchCity?: string) => {
    const activeQuery = typeof searchQuery === "string" ? searchQuery : query;
    const activeCity = typeof searchCity === "string" ? searchCity : city;

    // Validate city against the locations list — clear silently if invalid
    const isCityValid =
      !activeCity.trim() ||
      allLocations.length === 0 ||
      allLocations.some(loc => loc.name.toLowerCase() === activeCity.toLowerCase().trim());

    let finalCity = activeCity.trim();
    if (finalCity && !isCityValid) {
      setCity("");
      finalCity = "";
    }

    let finalQuery = activeQuery.trim();

    // At least one of title or city is required
    if (!finalQuery && !finalCity) {
      setEmptySearchError(true);
      return;
    }
    setEmptySearchError(false);

    const combinedQuery = [finalQuery, finalCity].filter(Boolean).join(" ");

    if (!combinedQuery) {
      router.push("/jobs");
      return;
    }

    const slug = combinedQuery
      .toLowerCase()
      .trim()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/^-+|-+$/g, "");

    if (!slug) {
      router.push("/jobs");
      return;
    }

    router.push(`/jobs/${slug}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-auto">
      <div className="bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col md:flex-row items-stretch md:items-center gap-3 p-1.5 md:p-2 transition-all duration-300 border border-slate-300 hover:border-indigo-300 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">

        {/* Subject/Role Search */}
        <div className="relative flex-[1.4] w-full" ref={queryRef}>
          <div className={`flex items-center gap-3 px-5 py-2.5 rounded-xl transition-all border ${
            emptySearchError 
              ? "bg-slate-50/80 md:bg-slate-50 border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100" 
              : "bg-slate-50/80 md:bg-slate-50 border-slate-200 focus-within:border-indigo-200"
          }`}>
            <Search className={`h-4 w-4 shrink-0 ${emptySearchError ? "text-red-400" : "text-indigo-400"}`} />
            <input
              type="text"
              id="query-search-input"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setEmptySearchError(false);
                setShowQuerySuggestions(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => {
                handleLoadLocations();
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
              aria-label="Search by job title or subject"
              autoComplete="off"
              className="w-full bg-transparent font-semibold focus:outline-none text-[15px] text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Query Suggestions */}
          {showQuerySuggestions && query.trim().length > 0 && suggestions.roles.length > 0 && (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-white rounded-lg shadow-lg overflow-hidden py-1 text-left">
              {suggestions.roles.slice(0, 5).map((role, index) => (
                <button
                  key={role}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setQuery(role);
                    setShowQuerySuggestions(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-[13px] font-semibold transition-colors ${
                    selectedIndex === index ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"
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
          <div className="flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all border bg-slate-50/80 md:bg-slate-50 border-slate-200 focus-within:border-indigo-200">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="text"
              id="city-search-input"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setEmptySearchError(false);
                setShowCitySuggestions(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => {
                handleLoadLocations();
                setShowCitySuggestions(true);
                setSelectedIndex(-1);
              }}
              onBlur={handleCityBlur}
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
              placeholder="Select city"
              aria-label="Search by city or location"
              autoComplete="off"
              className="w-full bg-transparent font-semibold focus:outline-none text-[15px] text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* City Suggestions */}
          {showCitySuggestions && city.trim().length > 0 && suggestions.cities.length > 0 && (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-white rounded-lg shadow-lg overflow-hidden py-1 text-left">
              {suggestions.cities.slice(0, 5).map((c, index) => (
                <button
                  key={c}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setCity(c);
                    setShowCitySuggestions(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-[13px] font-semibold transition-colors ${
                    selectedIndex === index ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          className="px-8 py-2.5 h-auto rounded-xl font-bold text-base transition-all shrink-0 w-full md:w-auto flex items-center justify-center gap-3 bg-button-gradient hover:scale-[1.02] active:scale-[0.98] text-white shadow-xl shadow-indigo-100 disabled:opacity-70"
          onClick={() => handleSearch()}
          disabled={isLoading}
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

    </div>
  );
}