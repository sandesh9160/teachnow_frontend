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

const bannerImg = "/images/city-skyline-banner.jpg";

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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Breadcrumb Bar - Above Banner */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-[1400px] px-4 py-2.5 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Banner Section */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-100">
        <img 
          src={bannerImg} 
          alt="Banner" 
          className="w-full h-full object-cover brightness-95" 
          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=2070&auto=format&fit=crop"; }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-white/60" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-4 -mt-32 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main Content Area */}
          <div className="space-y-6">
            {/* Header Card */}
            <section className="rounded-xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex flex-col md:flex-row gap-6 md:items-start">
                {/* Logo Box */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#ecf2ff] p-3 text-primary text-2xl font-semibold shadow-sm md:h-22 md:w-22 border border-[#dbeafe]">
                  {employerLogo ? (
                    <img src={normalizeMediaUrl(employerLogo)} alt={employerName} className="h-full w-full object-contain" />
                  ) : (
                    <span>{logoFallback}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-[#111827] sm:text-3xl lg:text-[40px] tracking-tight leading-tight">
                    {title}
                  </h1>
                  <div className="mt-2 flex items-center gap-2 text-slate-500 font-medium">
                    <Building2 className="h-4 w-4" />
                    <Link href={institutionHref} className="hover:text-primary hover:underline transition-colors">
                      {employerName}
                    </Link>
                  </div>

                  {/* Meta Grid */}
                  <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
                    <div className="flex items-center gap-2 text-[14px] font-semibold text-slate-500/90">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2 text-[14px] font-semibold text-slate-500/90">
                      <TrendingUp className="h-4 w-4 text-slate-400" />
                      {salaryRange}
                    </div>
                    <div className="flex items-center gap-2 text-[14px] font-semibold text-slate-500/90">
                      <GraduationCap className="h-4 w-4 text-slate-400" />
                      {job.experience_required}+ Years
                    </div>
                    <div className="flex items-center gap-2 text-[14px] font-semibold text-slate-500/90">
                      <Briefcase className="h-4 w-4 text-slate-400" />
                      {jobType}
                    </div>
                    <div className="flex items-center gap-2 text-[14px] font-semibold text-slate-500/90">
                      <Clock3 className="h-4 w-4 text-slate-400" />
                      {postedText}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mt-6 flex flex-wrap gap-2">
                    {job.category && (
                      <span className="rounded-full bg-blue-50 px-4 py-1.5 text-[12px] font-bold text-[#1e3a8a] border border-blue-100">
                        {job.category.name}
                      </span>
                    )}
                    <span className="rounded-full bg-blue-50 px-4 py-1.5 text-[12px] font-bold text-[#1e3a8a] border border-blue-100">
                      Intermediate
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-10 flex flex-wrap items-center gap-4 pt-10 border-t border-slate-100">
                <Link href={`/apply/${jobSegment}`} className="flex-1 sm:flex-none">
                  <Button className="h-12 w-full sm:w-44 rounded-xl font-bold bg-[#2e3fc7] hover:bg-[#1e2cb2] text-white shadow-none text-base transition-all">
                    Apply Now
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className={cn(
                    "h-12 w-full sm:w-36 rounded-xl font-bold border-slate-200 transition-all",
                    isBookmarked && "bg-blue-50 text-[#1e3a8a] border-blue-100"
                  )}
                  onClick={handleToggleBookmark}
                  disabled={bookmarkBusy}
                >
                  <Bookmark className={cn("h-4 w-4 mr-2", isBookmarked && "fill-[#1e3a8a]")} />
                  {isBookmarked ? "Saved" : "Save"}
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12 w-full sm:w-36 rounded-xl font-bold border-slate-200"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </section>

            {/* Content Tabs Section */}
            <section className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-8 py-5 text-[14px] font-bold transition-all whitespace-nowrap border-b-2",
                      activeTab === tab.id 
                        ? "border-[#2e3fc7] text-[#2e3fc7]" 
                        : "border-transparent text-slate-500 hover:text-slate-900"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-7 sm:p-8 min-h-[400px]">
                {activeTab === "description" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-bold text-[#111827] mb-6">About This Role</h2>
                    <div 
                      className="text-[15px] leading-relaxed text-slate-600 font-medium space-y-4"
                      dangerouslySetInnerHTML={{ __html: job.description || "No description provided." }}
                    />
                  </div>
                )}

                {(activeTab === "responsibilities" || activeTab === "requirements" || activeTab === "benefits") && (
                   <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <h2 className="text-xl font-bold text-[#111827] mb-6">
                        {activeTab === "responsibilities" ? "Key Responsibilities" : 
                         activeTab === "requirements" ? "Requirements & Qualifications" : "Benefits & Perks"}
                     </h2>
                     <ul className="space-y-4">
                        {(activeTab === "responsibilities" ? [
                          "Deliver engaging physics lectures for Intermediate students",
                          "Prepare study materials and practice problem sets",
                          "Conduct regular tests and analyze student performance",
                          "Guide students in IIT-JEE preparation",
                          "Stay updated with the latest exam patterns"
                        ] : activeTab === "requirements" ? [
                          "M.Sc. in Physics from a reputed university",
                          "3+ years of experience in IIT-JEE coaching or teaching",
                          "Strong problem-solving and analytical skills",
                          "Ability to simplify complex concepts for students"
                        ] : [
                          "Performance-based incentives",
                          "Health insurance",
                          "Annual bonus",
                          "Transport facility"
                        ]).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-[14px] text-slate-600 font-medium">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
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
              <section className="pt-8">
                <h2 className="text-2xl font-bold text-[#111827] mb-6">Similar Jobs</h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {similarJobs.slice(0, 3).map((sJob) => (
                    <Link
                      key={sJob.id}
                      href={`/${sanitizeSlug(sJob.slug || String(sJob.id))}`}
                      className="group flex flex-col rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-xl transition-all"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className="h-11 w-11 rounded-lg bg-[#ecf2ff] flex items-center justify-center text-primary font-bold text-lg shrink-0 border border-[#dbeafe]">
                          {(sJob.employer?.company_name?.[0] || sJob.title[0]).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[14px] font-bold text-[#111827] group-hover:text-[#2e3fc7] transition-colors truncate">{sJob.title}</h3>
                          <p className="text-[12px] font-medium text-slate-500 truncate">{sJob.employer?.company_name}</p>
                        </div>
                      </div>
                      <div className="mt-auto space-y-3">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                          <MapPin className="h-3 w-3" /> {sJob.location}
                        </div>
                        <div className="text-[14px] font-bold text-[#2e3fc7]">
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
          <aside className="space-y-6">
            {/* Salary Action Card */}
            <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-center">
              <p className="text-[13px] font-semibold text-slate-400 mb-1">Salary Range</p>
              <p className="text-[20px] sm:text-[22px] font-bold text-[#111827] leading-none mb-6">{salaryRange}</p>
              
              <Link href={`/apply/${jobSegment}`}>
                <Button className="h-11 w-full rounded-xl font-bold bg-[#2e3fc7] hover:bg-[#1e2cb2] text-white text-base shadow-lg shadow-blue-500/20">
                  Apply Now
                </Button>
              </Link>
              <p className="mt-4 text-[11px] font-medium text-slate-400">
                Free to apply · Quick application
              </p>
            </section>

            {/* Institution Profile Card */}
            <section className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="bg-[#2e3fc7] px-6 py-6 text-white relative">
                <div className="flex items-start gap-4">
                   <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-lg border border-white/30 shrink-0">
                      {employerLogo ? (
                        <img src={normalizeMediaUrl(employerLogo)} alt={employerName} className="h-full w-full object-contain" />
                      ) : (
                        logoFallback
                      )}
                   </div>
                   <div className="min-w-0">
                      <h3 className="text-base font-bold leading-tight">{employerName}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-white/80">
                        <MapPin className="h-3 w-3" /> {job.location}
                      </p>
                   </div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-[13px] font-medium text-slate-500 leading-relaxed mb-6">
                  {employerName} is a premier educational institution offering world-class education.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[12px] font-semibold text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400" /> {job.location}, India
                  </div>
                  <div className="flex items-center gap-3 text-[12px] font-semibold text-slate-600">
                    <Building2 className="h-4 w-4 text-slate-400" /> Education - Established Institution
                  </div>
                  <div className="flex items-center gap-3 text-[12px] font-semibold text-slate-600">
                    <Globe className="h-4 w-4 text-slate-400" /> www.{sanitizeSlug(employerName).toLowerCase().replaceAll(' ','')}.edu.in
                  </div>
                </div>
              </div>
            </section>

            {/* Job Highlights Card */}
            <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <h3 className="text-base font-bold text-[#111827] mb-5">Job Highlights</h3>
              <div className="space-y-4">
                {[
                  { label: "Experience", value: `${job.experience_required}+ Years` },
                  { label: "Job Type", value: jobType },
                  { label: "Location", value: job.location },
                  { label: "Posted", value: postedText },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-[13px] font-semibold">
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
