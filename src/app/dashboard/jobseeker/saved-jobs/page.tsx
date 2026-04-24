"use client";

import { useEffect, useState } from "react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Loader2, BookmarkX, MapPin, Search, Briefcase, ChevronDown } from "lucide-react";
import { Input } from "@/shared/ui/Input/Input";



import JobCard from "@/shared/cards/JobCard/JobCard";

export default function SavedJobsPage() {
  const { bookmarks, loading, fetchBookmarks } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    void fetchBookmarks();
  }, [fetchBookmarks]);

  // Derived filters
  const locations = ["All", ...Array.from(new Set(bookmarks.map((j: any) => j.location).filter(Boolean)))];
  const types = ["All", ...Array.from(new Set(bookmarks.map((j: any) => j.job_type?.replaceAll(/_/g, " ").replaceAll(/\b\w/g, (c: string) => c.toUpperCase())).filter(Boolean)))];

  const filteredBookmarks = bookmarks
    .filter((job: any) => {
      const typeLabel = job.job_type?.replaceAll(/_/g, " ").replaceAll(/\b\w/g, (c: string) => c.toUpperCase()) || "Full Time";
      const isExpired = job.expires_at ? new Date(job.expires_at) < new Date() : false;
      
      const matchesSearch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.employer?.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = selectedLocation === "All" || job.location === selectedLocation;
      const matchesType = selectedType === "All" || typeLabel === selectedType;
      const matchesStatus = selectedStatus === "All" || (selectedStatus === "Active" ? !isExpired : isExpired);
      
      return matchesSearch && matchesLocation && matchesType && matchesStatus;
    })
    .sort((a: any, b: any) => {
      const isAExpired = a.expires_at ? new Date(a.expires_at) < new Date() : false;
      const isBExpired = b.expires_at ? new Date(b.expires_at) < new Date() : false;
      if (isAExpired && !isBExpired) return 1;
      if (!isAExpired && isBExpired) return -1;
      return 0;
    });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 pt-4 px-4 md:px-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-[28px] font-bold text-black tracking-tight leading-none">Saved Jobs</h1>
          <p className="text-[13px] text-black opacity-70 font-medium">Your collection of opportunities</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-[12px] font-bold border border-blue-100/50">
          {bookmarks.length} Total Saved
        </div>
      </div>

      {/* Filter Bar - Premium Consistent Version */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm/5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-3 relative group">
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-[13px] rounded-xl border-slate-100 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 bg-white transition-all"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
          </div>
          
          <div className="md:col-span-3 relative group">
             <select 
               value={selectedStatus}
               onChange={(e) => setSelectedStatus(e.target.value)}
               className="w-full h-10 rounded-xl border border-slate-100 bg-white pl-4 pr-10 text-[12px] font-bold text-slate-600 appearance-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 cursor-pointer outline-none transition-all"
             >
               <option value="All">All Status</option>
               <option value="Active">Active Only</option>
               <option value="Expired">Expired</option>
             </select>
             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                <ChevronDown className="w-3.5 h-3.5" />
             </div>
          </div>

          <div className="md:col-span-3 relative group">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
             </div>
             <select 
               value={selectedLocation}
               onChange={(e) => setSelectedLocation(e.target.value)}
               className="w-full h-10 rounded-xl border border-slate-100 bg-white pl-9 pr-10 text-[12px] font-bold text-slate-600 appearance-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 cursor-pointer outline-none transition-all"
             >
               <option value="All">All Locations</option>
               {locations.filter(l => l !== "All").map(loc => (
                 <option key={loc} value={loc}>{loc}</option>
               ))}
             </select>
             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                <ChevronDown className="w-3.5 h-3.5" />
             </div>
          </div>

          <div className="md:col-span-3 relative group">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
             </div>
             <select 
               value={selectedType}
               onChange={(e) => setSelectedType(e.target.value)}
               className="w-full h-10 rounded-xl border border-slate-100 bg-white pl-9 pr-10 text-[12px] font-bold text-slate-600 appearance-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 cursor-pointer outline-none transition-all"
             >
               <option value="All">All Types</option>
               {types.filter(t => t !== "All").map(t => (
                 <option key={t} value={t}>{t}</option>
               ))}
             </select>
             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                <ChevronDown className="w-3.5 h-3.5" />
             </div>
          </div>
        </div>
      </div>

      {loading && !bookmarks.length ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-blue-200 mb-4" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic animate-pulse">Syncing Collection...</p>
        </div>
      ) : filteredBookmarks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookmarks.map((job: any) => {
            const salary = (() => {
              const parseVal = (v: any) => (!v || v === "null" || v === "0") ? 0 : Number(v);
              const min = parseVal(job.salary_min);
              const max = parseVal(job.salary_max);
              if (!min && !max) return "Not disclosed";
              const fmt = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(1)}L` : n.toLocaleString("en-IN");
              return `${fmt(min)} - ${fmt(max)}`;
            })();

            return (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                company={job.employer?.company_name || "Confidential School"}
                location={job.location}
                type={job.job_type?.replaceAll('_', ' ').replaceAll(/\b\w/g, (c: string) => c.toUpperCase()) || "Full Time"}
                salary={salary}
                tags={[]}
                posted={job.created_at}
                logo={job.employer?.company_logo}
                slug={job.slug}
                savedAt={job.bookmarkedAt}
                expiresAt={job.expires_at}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl py-24 px-6 text-center border border-slate-100 shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-slate-100">
            <BookmarkX className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-black mb-1">No matches found</h3>
          <p className="text-[11px] text-black opacity-70 max-w-xs mb-8 font-medium leading-relaxed">
            Try adjusting your search or filters to find what you&apos;re looking for.
          </p>
          <button 
            onClick={() => {
              setSearchQuery("");
              setSelectedLocation("All");
              setSelectedType("All");
              setSelectedStatus("All");
            }}
            className="px-8 h-10 bg-indigo-600 text-white rounded-xl text-[11px] font-bold shadow-lg shadow-indigo-600/10 hover:bg-indigo-700 transition-all"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
