"use client";

import { useState, useEffect } from "react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { MapPin, Clock3, Bookmark, BookmarkCheck, Building } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useClientSession } from "@/hooks/useClientSession";
import QuickAuthModal from "@/components/auth/QuickAuthModal";
import { JobCardProps } from "@/types/components";
import { sanitizeSlug, formatTimeAgo } from "@/lib/utils";
import { normalizeMediaUrl } from "@/services/api/client";

const JobCard = ({ id = 1, title, company, location, type, salary, tags, posted, slug, logo, institutionType }: JobCardProps) => {
  const { bookmarks, toggleBookmark } = useBookmarks();
  const isSavedStatus = bookmarks.some((job) => String(job.id) === String(id));
  const [saved, setSaved] = useState(isSavedStatus);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [authReason, setAuthReason] = useState<"apply" | "save">("apply");
  const router = useRouter();
  const { isLoggedIn, user } = useClientSession();

  useEffect(() => {
    setSaved(isSavedStatus);
  }, [isSavedStatus]);
  
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
      setSaved(!saved);
      await toggleBookmark(id);
      toast.success(saved ? "Removed from saved jobs" : "Job saved successfully!");
    } catch (error: any) {
      setSaved(isSavedStatus);
      toast.error(error.message || "An error occurred while saving the job.");
    }
  };

  const logoUrl = logo ? normalizeMediaUrl(logo) : null;
  console.log(logoUrl);

  return (
    <>
      <div className="group relative flex flex-col h-full rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-blue-200">
        <div className="relative z-10 flex flex-col h-full">
          {/* Top Row: Logo, Title/Company, Bookmark */}
          <div className="flex items-start gap-4 mb-3">
            <div className="w-14 h-14 shrink-0 rounded-[16px] bg-[#ecf2ff] flex items-center justify-center overflow-hidden border border-slate-50">
              {logoUrl && !logoError ? (
                <img 
                  src={logoUrl} 
                  alt={company} 
                  className="h-full w-full object-contain" 
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-[#1e3a8a] font-bold text-2xl">{company?.[0]?.toUpperCase()}</span>
              )}
            </div>
            
            <div className="min-w-0 flex-1 pt-0.5">
              <h3 className="text-[19px] font-bold text-[#1e3a8a] group-hover:text-blue-800 transition-colors leading-tight mb-1.5 tracking-tight">
                {title}
              </h3>
              <div className="flex flex-col gap-1 text-slate-400">
                <div className="flex items-start gap-1.5 ">
                  <Building className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-[15px] font-medium text-slate-500 line-clamp-2">{company}</p>
                </div>
                {institutionType && (
                   <div className="flex items-center gap-1.5 ml-0.5">
                     <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                       {institutionType}
                     </span>
                   </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSave}
              className="flex shrink-0 items-center justify-center w-8 h-8 text-slate-400 hover:text-blue-600 transition-all active:scale-90"
            >
              {saved ? <BookmarkCheck className="h-5.5 w-5.5 text-[#1e3a8a]" /> : <Bookmark className="h-5.5 w-5.5" />}
            </button>
          </div>

          {/* Metadata Row: Location, Job Type, Time */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] font-medium text-slate-500 mb-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-400" />
              <span>{type}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock3 className="w-4 h-4 text-slate-400" />
              <span>{(() => {
                const ago = formatTimeAgo(posted);
                return ago.includes("ago") || ago === "Just now" || ago === "Recently" ? ago : `Posted on ${ago}`;
              })()}</span>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            {salary && salary !== "Not disclosed" && (
              <div className="text-[17px] font-semibold text-slate-900">
                ₹{salary}
              </div>
            )}
          </div>

          {/* Tags Section - Capsule Shape */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {(tags && tags.length > 0 ? tags : ["Teacher", "Staff Selection"]).slice(0, 3).map((tag, idx) => (
              <span key={idx} className="bg-[#f0f4f8] text-[#475569] px-4 py-1 rounded-full text-[12px] font-bold tracking-tight">
                {tag}
              </span>
            ))}
          </div>

          {/* Buttons Row */}
          <div className="mt-auto flex items-center gap-3">
            <button 
              onClick={handleApply}
              className="flex-[2] h-[48px] rounded-xl bg-[#1e3a8a] text-white font-bold text-[15px] hover:bg-blue-800 transition-all active:scale-95 shadow-md shadow-blue-900/10"
            >
              Apply Now
            </button>
            <Link href={jobHref} className="flex-1">
              <button className="w-full h-[48px] rounded-xl border border-slate-200 bg-white text-slate-900 font-bold text-[14px] hover:bg-slate-50 transition-all active:scale-95">
                View Details
              </button>
            </Link>
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
