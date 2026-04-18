"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import {
  Bookmark,
  Briefcase,
  ChevronRight,
  Clock3,
  GraduationCap,
  MapPin,
  Share2,
  TrendingUp,
  Globe,

  Building2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Job } from "@/types/homepage";
import { sanitizeSlug, cn } from "@/lib/utils";
import { normalizeMediaUrl } from "@/services/api/client";
import { useBookmarks } from "@/hooks/useBookmarks";
import { toast } from "sonner";
import { useClientSession } from "@/hooks/useClientSession";
import QuickAuthModal from "@/components/auth/QuickAuthModal";

type JobDetailsProps = Readonly<{
  job: Job;
  slug: string;
}>;

// --- format helpers ---
function formatCurrency(value?: string): string {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "Not disclosed";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatSalaryRange(job: Job): string {
  const min = formatCurrency(job.salary_min);
  const max = formatCurrency(job.salary_max);
  if (min === "Not disclosed" && max === "Not disclosed") return "Salary not disclosed";
  if (min === "Not disclosed") return `${max}/mo`;
  if (max === "Not disclosed") return `${min}/mo`;
  return `${min} – ${max}/mo`;
}

function formatJobType(jobType?: string): string {
  return String(jobType || "full_time")
    .replaceAll(/_/g, " ")
    .replaceAll(/\b\w/g, (char) => char.toUpperCase());
}

function formatPostedDate(date?: string): string {
  if (!date) return "Posted recently";

  const postedDate = new Date(date);
  if (Number.isNaN(postedDate.getTime())) return "Posted recently";

  const diffInHours = Math.max(1, Math.floor((Date.now() - postedDate.getTime()) / (1000 * 60 * 60)));
  if (diffInHours < 24) return `Posted ${diffInHours} hours ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `Posted ${diffInDays} days ago`;

  return `Posted on ${postedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}



export default function JobDetails({ job, slug }: JobDetailsProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const { isLoggedIn, user } = useClientSession();
  const { bookmarks, fetchBookmarks, toggleBookmark, loading: bookmarksHookLoading } = useBookmarks();
  const [bookmarkBusy, setBookmarkBusy] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    void fetchBookmarks();
  }, [job.id, fetchBookmarks]);

  const isBookmarked = bookmarks.some((b) => String(b.id) === String(job?.id));

  const handleToggleBookmark = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    if (user?.role === "employer") {
      toast.error("Employers cannot bookmark jobs.");
      return;
    }
    const wasBookmarked = isBookmarked;
    try {
      setBookmarkBusy(true);
      await toggleBookmark(job.id);
      toast.success(wasBookmarked ? "Job removed from saved." : "Job saved!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save job.");
    } finally {
      setBookmarkBusy(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${title} | TeachNow`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") toast.error("Could not share this job.");
    }
  };

  const title = job.title || "Job Opening";
  const employerName = job.employer?.company_name || "Confidential School";
  const employerLogo = job.employer?.company_logo || null;
  const logoFallback = (employerName[0] || title[0] || "J").toUpperCase();
  const jobType = formatJobType(job.job_type);
  const salaryRange = formatSalaryRange(job);
  const postedText = mounted ? formatPostedDate(job.created_at) : "Posted recently";
  const jobSegment = sanitizeSlug(job.slug || slug || String(job.id));
  const institutionHref = job.employer?.slug ? `/${sanitizeSlug(job.employer.slug)}` : `/${job.employer?.id || ""}`;

  const breadcrumbItems = [
    { label: "Jobs", href: "/jobs" },
    { label: title, isCurrent: true },
  ];

  const tabs = [
    { id: "description", label: "Description" },
    { id: "responsibilities", label: "Responsibilities" },
    { id: "requirements", label: "Requirements" },
    { id: "benefits", label: "Benefits" },
  ];

  const similarJobs = Array.isArray(job.similar_jobs) ? job.similar_jobs : [];

  const getBannerImage = () => {
    const loc = (job.location || "").toLowerCase();
    if (loc.includes("delhi")) return "/images/cities/delhi.jpg";
    if (loc.includes("mumbai")) return "/images/cities/mumbai.jpg";
    if (loc.includes("bangalore") || loc.includes("bengaluru")) return "/images/cities/bangalore.jpg";
    if (loc.includes("hyderabad")) return "/images/cities/hyderabad.jpg";
    if (loc.includes("pune")) return "/images/cities/pune.jpg";
    if (loc.includes("chennai")) return "/images/cities/chennai.jpg";
    if (loc.includes("ahmedabad")) return "/images/cities/ahmedabad.jpg";
    if (loc.includes("jaipur")) return "/images/cities/jaipur.jpg";
    
    // Default high-quality school/education themed banner
    return "/images/job-detail-banner.jpg";
  };

  const bannerImg = getBannerImage();

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
          <div className="overflow-x-auto no-scrollbar whitespace-nowrap">
            <Breadcrumb items={breadcrumbItems} className="py-0" />
          </div>
        </div>
      </div>

      {/* Banner Section */}
      <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden bg-slate-100">
        <img 
          src={bannerImg} 
          alt="Banner" 
          className="w-full h-full object-cover brightness-95" 
          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1541339907198-e08756ebafe1?q=80&w=2070&auto=format&fit=crop"; }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-white/60" />
      </div>

      <div className="relative mx-auto max-w-7xl pl-5 pr-6 -mt-12 sm:-mt-24 md:-mt-32 pb-16 sm:px-6 lg:px-8 overflow-x-hidden">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_340px] w-full">
          {/* Main Content Area */}
          <div className="space-y-6 min-w-0">
            {/* Header Card */}
            <section className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-7 shadow-sm max-w-full">
              <div className="flex items-start gap-4 sm:gap-7">
                {/* Logo Box */}
                <div className="flex h-14 w-14 sm:h-22 sm:w-22 shrink-0 items-center justify-center rounded-xl bg-[#ecf2ff] p-2 sm:p-3 text-primary text-lg sm:text-2xl font-bold border border-[#dbeafe]">
                  {employerLogo ? (
                    <img src={normalizeMediaUrl(employerLogo)} alt={employerName} className="h-full w-full object-contain" />
                  ) : (
                    <span>{logoFallback}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-base sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight break-words">
                    {title}
                  </h1>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] sm:text-base text-slate-500 font-medium">
                    <Building2 className="h-3 w-3 shrink-0" />
                    <Link href={institutionHref} className="hover:text-primary hover:underline transition-colors break-words">
                      {employerName}
                    </Link>
                  </div>

                  {/* Meta Grid */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
                    <div className="flex items-center gap-1 text-[10px] sm:text-[13px] font-bold text-slate-500">
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] sm:text-[13px] font-bold text-slate-500">
                      <TrendingUp className="h-3 w-3 text-slate-400 shrink-0" />
                      {salaryRange}
                    </div>
                  </div>

                  {/* Tags Row */}
                  <div className="mt-3 flex items-center gap-x-4">
                    <span className="text-[10px] sm:text-sm font-bold text-primary italic">
                      {job.category?.name || 'Education'}
                    </span>
    
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <Link href={`/apply/${jobSegment}`} className="w-full sm:w-auto">
                  <Button className="h-11 w-full sm:px-10 rounded-xl font-bold bg-[#3b49df] hover:bg-[#2e3bb3] text-white text-[14px]">
                    Apply Now
                  </Button>
                </Link>
                
                <div className="grid grid-cols-2 w-full sm:flex sm:w-auto gap-3">
                  <Button
                    variant="outline"
                    className={cn(
                      "h-11 w-full sm:w-auto sm:px-8 rounded-xl font-bold border-slate-200 text-slate-700 text-[12px] px-1",
                      isBookmarked && "bg-blue-50 text-primary border-blue-200"
                    )}
                    onClick={handleToggleBookmark}
                    disabled={bookmarkBusy}
                  >
                    <Bookmark className={cn("h-4 w-4 mr-1", isBookmarked && "fill-primary")} />
                    {isBookmarked ? "Saved" : "Save"}
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-11 w-full sm:w-auto sm:px-8 rounded-xl font-bold border-slate-200 text-slate-700 text-[12px] px-1"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </section>

            {/* Content Tabs Section */}
            <section className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar scroll-smooth">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-6 sm:px-8 py-4 sm:py-5 text-[13px] sm:text-[14px] font-bold transition-all whitespace-nowrap border-b-2",
                      activeTab === tab.id 
                        ? "border-[#2e3fc7] text-[#2e3fc7]" 
                        : "border-transparent text-slate-500 hover:text-slate-900"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6 sm:p-8 min-h-[300px] sm:min-h-[400px]">
                {activeTab === "description" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-lg sm:text-xl font-bold text-[#111827] mb-4 sm:mb-6">About This Role</h2>
                    <div 
                      className="text-[14px] sm:text-[15px] leading-relaxed text-slate-600 font-medium space-y-4"
                      dangerouslySetInnerHTML={{ __html: job.description || "No description provided." }}
                    />
                  </div>
                )}

                {(activeTab === "responsibilities" || activeTab === "requirements" || activeTab === "benefits") && (
                   <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <h2 className="text-lg sm:text-xl font-bold text-[#111827] mb-4 sm:mb-6">
                        {activeTab === "responsibilities" ? "Key Responsibilities" : 
                         activeTab === "requirements" ? "Requirements & Qualifications" : "Benefits & Perks"}
                     </h2>
                     <ul className="space-y-3.5 sm:space-y-4">
                        {(activeTab === "responsibilities" ? (
                          (job as any).responsibilities ? (Array.isArray((job as any).responsibilities) ? (job as any).responsibilities : [(job as any).responsibilities]) : [
                            "Deliver engaging physics lectures for Intermediate students",
                            "Prepare study materials and practice problem sets",
                            "Conduct regular tests and analyze student performance",
                            "Guide students in IIT-JEE preparation",
                            "Stay updated with the latest exam patterns"
                          ]
                        ) : activeTab === "requirements" ? (
                          (job as any).requirements ? (Array.isArray((job as any).requirements) ? (job as any).requirements : [(job as any).requirements]) : [
                            "M.Sc. in Physics from a reputed university",
                            "3+ years of experience in IIT-JEE coaching or teaching",
                            "Strong problem-solving and analytical skills",
                            "Ability to simplify complex concepts for students"
                          ]
                        ) : (
                          (job as any).benefits ? (Array.isArray((job as any).benefits) ? (job as any).benefits : [(job as any).benefits]) : [
                            "Performance-based incentives",
                            "Health insurance",
                            "Annual bonus",
                            "Transport facility"
                          ]
                        )).map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2.5 sm:gap-3 text-[13px] sm:text-[14px] text-slate-600 font-medium leading-relaxed">
                            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                     </ul>
                   </div>
                )}
              </div>
            </section>

            {/* Similar Jobs Section */}
            {similarJobs.length > 0 && (
              <section className="pt-6 sm:pt-10">
                <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-6 sm:mb-8">Similar Jobs</h2>
                <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {similarJobs.slice(0, 3).map((sJob) => (
                    <Link
                      key={sJob.id}
                      href={`/${sanitizeSlug(sJob.slug || String(sJob.id))}`}
                      className="group flex flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-xl transition-all"
                    >
                      <div className="flex items-start gap-2.5 mb-4">
                        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg bg-[#ecf2ff] flex items-center justify-center text-primary font-bold text-base sm:text-lg shrink-0 border border-[#dbeafe]">
                          {(sJob.employer?.company_name?.[0] || sJob.title[0]).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[13px] sm:text-[14px] font-bold text-[#111827] group-hover:text-[#2e3fc7] transition-colors truncate">{sJob.title}</h3>
                          <p className="text-[11px] sm:text-[12px] font-medium text-slate-500 truncate">{sJob.employer?.company_name}</p>
                        </div>
                      </div>
                      <div className="mt-auto space-y-2.5 sm:space-y-3">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                          <MapPin className="h-3 w-3" /> {sJob.location}
                        </div>
                        <div className="text-[13px] sm:text-[14px] font-bold text-[#2e3fc7]">
                          {formatSalaryRange(sJob)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 sm:space-y-6">
            {/* Salary Action Card */}
            <section className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm">
              <div className="text-center mb-6">
                <p className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Salary Range</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-none">{salaryRange}</p>
              </div>
              
              <div className="flex flex-col gap-3">
                <Link href={`/apply/${jobSegment}`} className="w-full">
                  <Button className="h-12 w-full rounded-xl font-bold bg-[#3b49df] hover:bg-[#2e3bb3] text-white text-[15px] shadow-sm transition-all">
                    Apply Now
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 rounded-xl font-bold border-slate-200 transition-all text-[14px]",
                    isBookmarked && "bg-blue-50 text-primary border-blue-100"
                  )}
                  onClick={handleToggleBookmark}
                  disabled={bookmarkBusy}
                >
                  <Bookmark className={cn("h-4 w-4 mr-2", isBookmarked && "fill-primary")} />
                  {isBookmarked ? "Saved" : "Save"}
                </Button>
              </div>
              
              <p className="mt-5 text-xs font-medium text-slate-400 text-center">
                Free to apply · Join 1,000+ applicants
              </p>
            </section>

            {/* Institution Profile Card */}
            <section className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
              <div className="bg-[#3b49df] px-6 py-6 text-white relative">
                <div className="flex items-center gap-4">
                   <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-xl border border-white/30 shrink-0">
                      {employerLogo ? (
                        <img src={normalizeMediaUrl(employerLogo)} alt={employerName} className="h-full w-full object-contain" />
                      ) : (
                        logoFallback
                      )}
                   </div>
                   <div className="min-w-0">
                      <h3 className="text-sm sm:text-lg font-bold leading-tight truncate">{employerName}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-white/80">
                        <MapPin className="h-3 w-3" /> {job.location}
                      </p>
                   </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <p className="text-[11px] sm:text-[13px] font-medium text-slate-500 leading-relaxed mb-4 sm:mb-6">
                  {employerName} is a premier educational institution offering world-class education.
                </p>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 text-[10px] sm:text-[12px] font-semibold text-slate-600">
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" /> {job.location}, India
                  </div>
                  <div className="flex items-center gap-2 text-[10px] sm:text-[12px] font-semibold text-slate-600">
                    <Building2 className="h-3 w-3 text-slate-400 shrink-0" /> Education - Established Institution
                  </div>
                  <div className="flex items-center gap-2 text-[10px] sm:text-[12px] font-semibold text-slate-600">
                    <Globe className="h-3 w-3 text-slate-400 shrink-0" /> www.{sanitizeSlug(employerName).toLowerCase().replaceAll(' ','')}.edu.in
                  </div>
                </div>
              </div>
            </section>

            {/* Job Highlights Card */}
            <section className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <h3 className="text-[15px] sm:text-base font-bold text-[#111827] mb-4 sm:mb-5">Job Highlights</h3>
              <div className="space-y-3.5 sm:space-y-4">
                {[
                  { label: "Experience", value: `${job.experience_required}+ Year(s)` },
                  { label: "Job Type", value: jobType },
                  { label: "Location", value: job.location },
                  { label: "Posted", value: postedText },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-[12px] sm:text-[13px] font-semibold">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-[#111827]">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>

      <QuickAuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          void fetchBookmarks();
        }}
        title="Save Job"
        subTitle="Need to login as job seeker to save this job"
        submitText="Login to Save"
      />
    </div>
  );
}   
