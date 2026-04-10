"use client";

import { useEffect, useState } from "react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Loader2, BookmarkX, MapPin, Calendar, Search, Building2, Trash2, ArrowRight, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";

export default function SavedJobsPage() {
  const { bookmarks, loading, fetchBookmarks, toggleBookmark } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    void fetchBookmarks();
  }, [fetchBookmarks]);

  const handleRemove = async (jobId: string | number) => {
    if (!confirm("Remove this job from your saved list?")) return;
    try {
      await toggleBookmark(jobId);
      toast.success("Job removed from saved list.");
    } catch (error) {
      toast.error("Failed to remove saved job.");
    }
  };

  const filteredBookmarks = bookmarks.filter((job: any) => 
    job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.employer?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">Saved Jobs</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Keep track of opportunities you&apos;re interested in.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Input
            placeholder="Search saved jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-sm rounded-xl border-gray-200 focus:ring-primary/5"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {loading && !bookmarks.length ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-primary/40 mb-4" />
          <p className="text-gray-400 font-medium animate-pulse">Syncing your bookmarks...</p>
        </div>
      ) : filteredBookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {filteredBookmarks.map((job: any) => (
            <div 
              key={job.id} 
              className="group relative flex flex-col bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 h-full"
            >
              {/* Card Header (Logo & Delete Button) */}
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {job.employer?.company_logo ? (
                    <img 
                      src={job.employer.company_logo} 
                      alt={job.employer.company_name} 
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <span className="text-base font-black text-primary">{(job.employer?.company_name?.[0] || job.title?.[0] || 'J').toUpperCase()}</span>
                  )}
                </div>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove(job.id);
                  }}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                  title="Remove from saved jobs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Card Body (Title & Details) */}
              <div className="space-y-1.5 flex-grow">
                <Link href={`/jobs/${job.slug || job.id}`} className="block group-hover:text-primary transition-colors">
                  <h3 className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-2" title={job.title}>
                    {job.title}
                  </h3>
                </Link>
                <div className="flex flex-col gap-1 text-xs text-gray-600 font-medium mt-1.5">
                  <span className="flex items-center gap-1.5 line-clamp-1" title={job.employer?.company_name}>
                    <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" /> 
                    {job.employer?.company_name || "Confidential School"}
                  </span>
                  <span className="flex items-center gap-1.5 line-clamp-1" title={job.location}>
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" /> 
                    {job.location || "Location not specified"}
                  </span>
                </div>
              </div>

              {/* Card Footer (Status & Actions) */}
              <div className="mt-4 pt-3 border-t border-gray-50/80 flex flex-col gap-3">
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50">
                     {job.job_status || 'Open'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-violet-500" /> Saved {job.created_at ? new Date(job.created_at).toLocaleDateString() : "Recently"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/jobs/${job.slug || job.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full rounded-xl h-10 text-xs font-bold gap-2">
                       Details
                    </Button>
                  </Link>
                  <Link href={`/apply/${job.slug || job.id}`} className="flex-1">
                    <Button size="sm" className="w-full rounded-xl h-10 text-xs font-bold shadow-lg shadow-primary/20">
                      Apply Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl py-20 px-6 text-center border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-gray-200/20">
            <BookmarkX className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No saved jobs found</h3>
          <p className="text-gray-500 max-w-sm mb-8 font-medium">
            {searchQuery ? "We couldn't find any saved jobs matching your search." : "When you see a job you like, bookmark it to keep track of it here."}
          </p>
          <div className="flex gap-4">
             {searchQuery && (
               <Button variant="outline" onClick={() => setSearchQuery("")} className="rounded-xl px-8 font-bold">Clear Search</Button>
             )}
            <Link href="/jobs">
              <Button className="rounded-xl px-8 font-bold shadow-xl shadow-primary/20">Browse Openings</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
