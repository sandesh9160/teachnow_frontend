"use client";

import { useEffect, useState } from "react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Loader2, BookmarkX, MapPin, Calendar, Search, Building2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@/shared/ui/Input/Input";
import { normalizeMediaUrl } from "@/services/api/client";

export default function SavedJobsPage() {
  const { bookmarks, loading, fetchBookmarks, toggleBookmark } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    void fetchBookmarks();
  }, [fetchBookmarks]);

  const handleRemove = async (jobId: string | number) => {
    toast("Remove this job from your saved list?", {
      action: {
        label: "Remove",
        onClick: async () => {
          try {
            await toggleBookmark(jobId);
            toast.success("Job removed from saved list.");
          } catch (error) {
            toast.error("Failed to remove saved job.");
          }
        },
      },
    });
  };

  const filteredBookmarks = bookmarks.filter((job: any) => 
    job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.employer?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 pt-2 px-4 md:px-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-xl font-bold text-slate-800 tracking-tight">Saved Opportunities</h1>
           <p className="text-[11px] font-medium text-indigo-500 uppercase tracking-widest">Collection: {bookmarks.length} Jobs Total</p>
        </div>
        <div className="relative w-full md:w-72">
          <Input
            placeholder="Search your collection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-sm rounded-xl border-slate-200 focus:ring-indigo-500/10 focus:border-indigo-500/30 bg-white"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
        </div>
      </div>

      {loading && !bookmarks.length ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-200 mb-4" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Synchronizing Collection...</p>
        </div>
      ) : filteredBookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBookmarks.map((job: any) => (
            <div 
              key={job.id} 
              className="group relative flex flex-col bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all duration-300 h-full overflow-hidden"
            >
              {/* Vibrant Background Accents */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
              
              <div className="relative z-10 flex flex-col h-full">
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm p-1.5">
                    {job.employer?.company_logo ? (
                      <img 
                        src={normalizeMediaUrl(job.employer.company_logo)} 
                        alt="" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Building2 className="w-6 h-6 text-indigo-200" />
                    )}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove(job.id);
                    }}
                    className="h-8 w-8 flex items-center justify-center text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100 shadow-sm"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Card Content */}
                <div className="space-y-3 flex-grow">
                  <div>
                    <Link href={`/jobs/${job.slug || job.id}`} className="block group-hover:text-indigo-600 transition-colors">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                        {job.title}
                      </h3>
                    </Link>
                    <p className="text-[11px] font-semibold text-indigo-600 mt-1">{job.employer?.company_name || "School Partner"}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span className="text-[10px] font-semibold text-slate-600 truncate">{job.location || "On-site"}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/50 border border-emerald-100/50">
                      <Calendar className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="text-[10px] font-semibold text-emerald-700 truncate">{job.created_at ? new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "New"}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-5 pt-4 border-t border-slate-50 flex items-center gap-2">
                  <Link href={`/jobs/${job.slug || job.id}`} className="flex-1">
                    <button className="w-full h-9 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all transition-all active:scale-[0.98]">
                      View Details
                    </button>
                  </Link>
                  <Link href={`/apply/${job.slug || job.id}`} className="flex-1">
                    <button className="w-full h-9 bg-indigo-600 rounded-xl text-[10px] font-bold text-white hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-md shadow-indigo-600/10">
                      Apply Now
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl py-24 px-6 text-center border border-slate-200 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-slate-100">
            <BookmarkX className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Collection is Empty</h3>
          <p className="text-xs text-slate-500 max-w-xs mb-8 font-medium leading-relaxed">
            {searchQuery ? "No saved jobs match your current search terms." : "Bookmark interesting opportunities to track them here in your master collection."}
          </p>
          <div className="flex gap-3">
             {searchQuery && (
               <button onClick={() => setSearchQuery("")} className="px-6 h-10 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">Reset Search</button>
             )}
            <Link href="/jobs">
              <button className="px-6 h-10 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">Discover Jobs</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
