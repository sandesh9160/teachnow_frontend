"use client";

import { useState, useEffect } from "react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { MapPin, Clock3, Bookmark, Building } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useClientSession } from "@/hooks/useClientSession";
import QuickAuthModal from "@/components/auth/QuickAuthModal";
import { JobCardProps } from "@/types/components";
import { sanitizeSlug, formatTimeAgo } from "@/lib/utils";
import { normalizeMediaUrl } from "@/services/api/client";

const JobCard = ({
  id = 1,
  title,
  company,
  location,
  type,
  salary,
  tags,
  posted,
  slug,
  logo,
  institutionType,
  expiresAt,
  savedAt,
  deadline,
  gender,
  vacancies,
  experience,
  experienceType
}: JobCardProps & { 
  expiresAt?: string; 
  savedAt?: string;
  deadline?: string;
  gender?: string;
  vacancies?: number | string;
  experience?: number | string;
  experienceType?: string;
}) => {
  const { bookmarks, toggleBookmark } = useBookmarks();
  const isSavedStatus = bookmarks.some((job) => String(job.id) === String(id));
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [authReason, setAuthReason] = useState<"apply" | "save">("apply");
  const router = useRouter();
  const { isLoggedIn, user } = useClientSession();

  useEffect(() => {
    setMounted(true);
    setSaved(isSavedStatus);
  }, [isSavedStatus]);

  const isExpired = mounted && expiresAt ? new Date(expiresAt) < new Date() : false;

  const jobPath = slug ? sanitizeSlug(slug) : String(id);
  const jobHref = `/${jobPath}`;

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isExpired) return;

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

  return (
    <>
      <div
        onClick={() => router.push(jobHref)}
        className={`group relative flex flex-col h-full rounded-xl border bg-white p-3 transition-all duration-300 cursor-pointer ${isExpired
            ? "border-slate-100 opacity-75 grayscale-[0.5]"
            : "border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200"
          }`}>
        <div className="relative z-10 flex flex-col h-full">
          {/* Top Row: Logo, Title, Bookmark */}
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-14 h-14 shrink-0 rounded-xl flex items-center justify-center overflow-hidden border border-slate-50 ${isExpired ? "bg-slate-100" : "bg-[#ecf2ff]"}`}>
              {logoUrl && !logoError ? (
                <img
                  src={logoUrl}
                  alt={company}
                  className="h-full w-full object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className={`${isExpired ? "text-slate-400" : "text-[#1e3a8a]"} font-semibold text-2xl`}>{company?.[0]?.toUpperCase()}</span>
              )}
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <h3 className={`text-[17px] font-semibold transition-colors mb-1 tracking-tight line-clamp-2 min-h-[48px] leading-[1.4] ${isExpired ? "text-slate-500" : "text-black group-hover:text-blue-600"}`}>
                {title}
              </h3>
            </div>

            <button
              onClick={handleSave}
              className="flex shrink-0 items-center justify-center w-8 h-8 transition-all active:scale-90"
            >
              <Bookmark
                className={`h-5.5 w-5.5 transition-colors ${saved ? "text-[#1e3a8a] fill-[#1e3a8a]" : "text-slate-400 group-hover:text-blue-500"
                  } ${isExpired ? "opacity-40" : ""}`}
              />
            </button>
          </div>

          {/* Company Section - Now Below and Left Aligned */}
          <div className="flex flex-col gap-1 text-[#0F172A]/60 items-start text-left mb-3">
            <div className="flex items-start gap-1.5">
              <Building className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <p className="text-[13.5px] font-medium text-[#0F172A]/70 line-clamp-1 h-[20px]">{company}</p>
            </div>
            {isExpired ? (
              <div className="flex items-center gap-1.5 ml-0.5">
                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                  Job Expired
                </span>
              </div>
            ) : institutionType && (
              <div className="flex items-center gap-1.5 ml-0.5">
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {institutionType}
                </span>
              </div>
            )}
          </div>

          {/* Metadata Row: Location, Job Type, Time */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-medium text-[#0F172A]/60 mb-3 min-h-[24px]">
            <div className="flex items-center gap-1.5 max-w-[120px]">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
            <div className="flex items-center gap-1.5 max-w-[100px]">
              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{type}</span>
            </div>
            
            {experience !== undefined && (
              <div className="flex items-center gap-1.5">
                <Clock3 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="whitespace-nowrap">
                  {Number(experience) === 0 ? "Fresher" : `${experience}+ Years`} 
                  {experienceType && <span className="ml-1 text-[10px] opacity-70 uppercase">({experienceType})</span>}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock3 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="whitespace-nowrap">{mounted ? (() => {
                if (isExpired) return "Closed";
                if (savedAt) {
                  const savedAgo = formatTimeAgo(savedAt);
                  return savedAgo === "Just now" ? "Saved Just now" : `Saved ${savedAgo}`;
                }
                const ago = formatTimeAgo(posted);
                return ago.includes("ago") || ago === "Just now" || ago === "Recently" ? `Posted ${ago}` : `Posted on ${ago}`;
              })() : "..."}</span>
            </div>
            
            {deadline && (
              <div className="flex items-center gap-1.5">
                <Clock3 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="whitespace-nowrap text-red-600 font-semibold">Deadline: {new Date(deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              </div>
            )}
            
            {gender && gender !== "both" && (
              <div className="flex items-center gap-1.5">
                <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[11px] font-bold border border-purple-100 uppercase">
                  {gender} only
                </span>
              </div>
            )}

            {vacancies && Number(vacancies) > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded text-[11px] font-bold border border-orange-100">
                  {vacancies} {Number(vacancies) === 1 ? 'Vacancy' : 'Vacancies'}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-start mb-3">
            {salary && (
              <div className={`text-[15px] font-bold ${isExpired ? "text-slate-400" : "text-[#1e3a8a]"} tracking-tight`}>
                {salary === "Not disclosed" ? "Not Disclosed" : `₹${salary.replace(/\.00/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}
              </div>
            )}
          </div>

          {/* Tags Section */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="bg-[#f0f4f8] text-[#1e293b] px-3 py-0.5 rounded-full text-[11px] font-semibold">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Buttons Row */}
          <div className="mt-auto flex items-center gap-2">
            {isExpired ? (
              <button
                disabled
                className="w-full h-[40px] rounded-lg bg-slate-50 text-slate-400 font-bold text-[12px] cursor-not-allowed border border-slate-100 uppercase tracking-widest"
              >
                Vacancy Closed
              </button>
            ) : (
              <>
                <button
                  onClick={handleApply}
                  className="px-6 h-[40px] rounded-lg bg-[#1e3a8a] text-white font-semibold text-[14px] hover:bg-blue-800 transition-all active:scale-95 shadow-md shadow-blue-900/10"
                >
                  Apply Now
                </button>
                <Link href={jobHref} onClick={(e) => e.stopPropagation()}>
                  <button className="px-8 h-[40px] rounded-lg border border-slate-200 bg-white text-slate-900 font-semibold text-[13px] hover:bg-slate-50 transition-all active:scale-95">
                    Details
                  </button>
                </Link>
              </>
            )}
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
