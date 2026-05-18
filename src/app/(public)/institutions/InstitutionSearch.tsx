"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export default function InstitutionSearch() {
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
      router.replace(`/institutions?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(handler);
  }, [search, router, searchParams]);

  return (
    <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5">
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search institutions by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      {search && (
        <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
