"use client";

import { useState, useEffect } from "react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { MapPin, Clock3, Bookmark, BookmarkCheck } from "lucide-react";
// import { Button } from "@/shared/ui/Buttons/Buttons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useClientSession } from "@/hooks/useClientSession";
import QuickAuthModal from "@/components/auth/QuickAuthModal";
import { JobCardProps } from "@/types/components";
import { sanitizeSlug, cn, formatTimeAgo } from "@/lib/utils";
import { normalizeMediaUrl } from "@/services/api/client";

const JobCard = ({ id = 1, title, company, location, type, salary, tags, posted, slug, logo }: JobCardProps) => {
  const { bookmarks, toggleBookmark } = useBookmarks();
  const isSavedStatus = bookmarks.some((job) => String(job.id) === String(id));
  const [saved, setSaved] = useState(isSavedStatus);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [authReason, setAuthReason] = useState<"apply" | "save">("apply");
  const router = useRouter();
  const { isLoggedIn, user } = useClientSession();

  // Keep internal state in sync if global bookmarks change
  useEffect(() => {
    setSaved(isSavedStatus);
  }, [isSavedStatus]);
  
  // Clean the slug for a "neat" URL, fallback to ID if no slug provided
  const jobPath = slug ? sanitizeSlug(slug) : String(id);
  const jobHref = `/${jobPath}`;

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      toast.info("Need to login as job seeker to apply for this job");
      setAuthReason("apply");
      setShowAuthModal(true);
      return;
    }
    if (user?.role === "employer") {
      toast.error("Employers cannot apply for jobs.");
      return;
    }
    router.push(`/apply/${jobPath}`);
  };

  const handleAuthSuccess = () => {
    router.push(`/apply/${jobPath}`);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.info("Need to login as job seeker to save this job");
      setAuthReason("save");
      setShowAuthModal(true);
      return;
    }

    if (user?.role === "employer") {
      toast.error("Employers cannot bookmark jobs.");
      return;
    }

    try {
      // Optimistic UI update
      setSaved(!saved);
      
      await toggleBookmark(id);
      toast.success(saved ? "Removed from saved jobs" : "Job saved successfully!");

    } catch (error: any) {
      // Rollback on failure
      setSaved(isSavedStatus);
      toast.error(error.message || "An error occurred while saving the job.");
    }
  };

  const logoUrl = logo ? normalizeMediaUrl(logo) : null;

  return (
    <>
      <div
        className="group relative block rounded-xl border-2 border-blue-500 bg-white p-4 sm:p-5 shadow-none transition-all duration-300 overflow-hidden h-full flex flex-col"
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-blue-50 rounded-full -mr-16 -mt-16 animate-pulse pointer-events-none" />
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between gap-3 mb-4">
            <Link href={jobHref} className="flex gap-3 flex-1 items-start">
              <div className="w-12 h-12 shrink-0 rounded-lg border border-slate-100 bg-white p-2 shadow-sm flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                {logoUrl && !logoError ? (
                  <img 
                    src={logoUrl} 
                    alt={company} 
                    className="h-full w-full object-contain" 
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="text-indigo-600 font-medium text-lg">{company && company[0]}</span>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-[17px] font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[46px] leading-tight tracking-tight">
                  {title}
                </h3>
                <p className="text-indigo-600 font-medium text-[13px] mt-0.5 tracking-tight truncate">{company}</p>
              </div>
            </Link>

            <button
              onClick={handleSave}
              suppressHydrationWarning={true}
              className={cn(
                "p-2.5 rounded-lg transition-all duration-300 active:scale-95 shrink-0 z-20",
                saved 
                  ? "bg-blue-600 text-white" 
                  : "bg-slate-50 text-slate-400 border border-slate-100"
              )}
              title={saved ? "Saved" : "Save Job"}
            >
              {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-[11px] font-medium border border-emerald-100/50 tracking-tight flex items-center gap-1.5">
               <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
               {type}
            </span>
            <span className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-500 border border-slate-200">
              <Clock3 className="h-3 w-3" />
              {formatTimeAgo(posted)}
            </span>
            <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-lg text-[11px] font-medium border border-slate-200 flex items-center gap-1.5 tracking-tight">
               <MapPin className="w-3.5 h-3.5 text-indigo-500" />
               <span className="truncate max-w-[80px] sm:max-w-none">{location}</span>
            </span>
          </div>

          <div className="mb-4">
            {salary && (
               <span className="inline-flex bg-indigo-50 text-indigo-900 px-4 py-1.5 rounded-lg text-[11px] font-medium border border-indigo-100/50 items-center gap-1.5 tracking-tight">
                 ₹{salary}
               </span>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
                <Link href={jobHref} className="flex-1">
                  <button className="w-full h-11 px-4 rounded-xl bg-emerald-600 text-white font-bold text-[13px] hover:bg-emerald-700 transition-all active:scale-95">
                     Details
                  </button>
               </Link>
               <button 
                 onClick={handleApply}
                 className="flex-[1.5] h-11 px-4 rounded-xl bg-indigo-600 text-white font-bold text-[13px] hover:bg-indigo-700 transition-all active:scale-95 whitespace-nowrap"
               >
                  Apply Now
               </button>
            </div>
          </div>
        </div>
      </div>

      <QuickAuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        title={authReason === "save" ? "Save Job" : "Apply for this Job"}
        subTitle={authReason === "save" 
          ? "Need to login as job seeker to save this job" 
          : "Need to login as job seeker to apply for this job"}
        submitText={authReason === "save" ? "Login to Save" : "Login to Apply"}
      />
    </>
  );
};

export default JobCard;
