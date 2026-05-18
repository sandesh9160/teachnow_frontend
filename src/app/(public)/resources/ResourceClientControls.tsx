"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export function ResourceSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams?.get("q") || "");

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      if (search) {
        params.set("q", search);
      } else {
        params.delete("q");
      }
      router.replace(`/resources?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(handler);
  }, [search, router, searchParams]);

  return (
    <div className="relative w-full max-w-sm">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-slate-400" />
      </div>
      <input
        type="text"
        placeholder="Search resources..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all placeholder:text-slate-400"
      />
    </div>
  );
}

export function CarouselScrollButton({ direction, targetId }: { direction: "left" | "right", targetId: string }) {
  const scroll = () => {
    const el = document.getElementById(targetId);
    if (el) {
      const scrollAmount = direction === "left" ? -el.offsetWidth * 0.8 : el.offsetWidth * 0.8;
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <button 
      onClick={scroll}
      className={`absolute ${direction === "left" ? "-left-4 xl:-left-12" : "-right-4 xl:-right-12"} top-[40%] -translate-y-1/2 z-20 p-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/40 shadow-xl transition-all duration-300 hidden lg:flex active:scale-90`}
      title={direction === "left" ? "Previous" : "Next"}
    >
      {direction === "left" ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
    </button>
  );
}
