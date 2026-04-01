"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// import { Button } from "@/shared/ui/Buttons/Buttons";
import { Search, MapPin, Briefcase, X, Loader2 } from "lucide-react";
import { getCompanies } from "@/hooks/useCompanies";
import { Institution } from "@/types/homepage";

export default function InstitutionsPage() {
  const [search, setSearch] = useState("");
  const [companies, setCompanies] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getCompanies();
        setCompanies(data || []);
      } catch (err) {
        console.error("Error loading institutions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = companies.filter((c) => {
    if (search && !c.company_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-12">
      <section className="border-b border-border bg-card py-8">
        <div className="container">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Institutions Hiring Teachers</h1>
          <p className="mt-1 text-muted-foreground">
            Discover top schools, colleges, and edtech companies across India
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
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
          </div>
        </div>
      </section>

      <div className="container py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-lg font-medium text-foreground">No institutions found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search criteria or check back later.</p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> institutions
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((company) => (
                <Link
                  key={company.id || company.slug}
                  href={`/institutions/${company.slug}`}
                  className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/20 hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-4">
                    {company.company_logo ? (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm overflow-hidden transition-transform duration-300 group-hover:scale-110 border border-border">
                        <img src={company.company_logo} alt={company.company_name} className="h-full w-full object-contain p-2" />
                      </div>
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-display font-bold text-xl transition-transform duration-300 group-hover:scale-110">
                        {company.company_name?.[0] || "I"}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {company.company_name}
                      </h3>
                      {company.industry && (
                         <p className="mt-0.5 text-xs text-muted-foreground truncate">{company.industry}</p>
                      )}
                    </div>
                  </div>
                  
                  {(company.city || company.location) && (
                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {company.city || company.location || "Multiple Locations"}
                      </span>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                     {(company.jobs_count || 0) > 0 && (
                        <span className="flex items-center gap-1 text-xs font-medium text-primary">
                          <Briefcase className="h-3.5 w-3.5" />
                          {company.jobs_count} open jobs
                        </span>
                     )}
                     {company.founded_in && (
                        <span className="text-xs text-muted-foreground">Est. {company.founded_in}</span>
                     )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
