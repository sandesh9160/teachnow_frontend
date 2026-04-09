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
  Users,

  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Job } from "@/types/homepage";
import { sanitizeSlug } from "@/lib/utils";
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
  if (min === "Not disclosed") return max;
  if (max === "Not disclosed") return min;
  return `${min} - ${max}`;
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
    } catch (err) {
      toast.error("Failed to update saved jobs.");
    } finally {
      setBookmarkBusy(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${title} | TeachNow`,
      text: `Check out this job opening: ${title} at ${employerName}`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        toast.error("Could not share this job.");
      }
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
  const description = job.description || "";

  // No longer using split sections
  const similarJobs = Array.isArray(job.similar_jobs) ? job.similar_jobs : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Sticky Breadcrumb Bar */}
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-20 z-40">
        <div className="mx-auto max-w-7xl px-3 py-2 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 py-6 sm:py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            {/* Professional Header Section */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md ring-1 ring-slate-200/50 w-full">
              <div className="p-3.5 sm:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-start lg:gap-8">
                  {/* Logo Container */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 border border-slate-100 p-2 shadow-sm sm:h-20 sm:w-20 mx-auto md:mx-0">
                    {employerLogo ? (
                      <img src={normalizeMediaUrl(employerLogo)} alt={employerName} className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-2xl font-bold text-primary">{logoFallback}</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 border border-blue-100">
                        <Sparkles className="h-3 w-3" /> Featured
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-100">
                        <Zap className="h-3 w-3" /> Active
                      </span>
                    </div>

                    <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                      {title}
                    </h1>

                    <div className="mt-2 flex items-center justify-center md:justify-start gap-2">
                      <Link href={institutionHref} className="text-sm sm:text-base font-semibold text-primary/80 hover:text-primary transition-colors hover:underline">
                        {employerName}
                      </Link>
                    </div>

                    {/* Compact Meta Grid */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 border-t border-slate-50 pt-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</p>
                        <p className="text-sm font-semibold text-slate-600 flex items-center justify-center md:justify-start gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {job.location || "India"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Salary</p>
                        <div className="text-sm font-semibold text-slate-700 flex items-center justify-center md:justify-start gap-1">
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="leading-tight">{salaryRange}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Experience</p>
                        <p className="text-sm font-semibold text-slate-600 flex items-center justify-center md:justify-start gap-1">
                          <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                          {job.experience_required ? `${job.experience_required}+ Yrs` : "Fresher"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Type</p>
                        <p className="text-sm font-semibold text-slate-600 flex items-center justify-center md:justify-start gap-1">
                          <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                          {jobType}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-t border-slate-50 pt-6">
                  <Link href={`/apply/${jobSegment}`} className="flex-1">
                    <Button variant="hero" size="lg" className="h-12 w-full rounded-xl font-bold shadow-lg shadow-primary/10 text-base">
                      Apply Now
                    </Button>
                  </Link>
                  <div className="flex gap-3">
                    <Button
                      variant={isBookmarked ? "secondary" : "outline"}
                      size="lg"
                      className={`h-12 flex-1 sm:flex-none rounded-xl px-6 flex items-center justify-center gap-2 border-slate-200 ${isBookmarked ? 'text-primary bg-primary/5 border-primary/20' : ''}`}
                      onClick={handleToggleBookmark}
                      disabled={bookmarkBusy || bookmarksHookLoading}
                    >
                      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-primary' : ''}`} />
                      <span className="font-bold">{isBookmarked ? "Saved" : "Save"}</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="h-12 flex-1 sm:flex-none rounded-xl px-6 flex items-center justify-center gap-2 border-slate-200"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="font-bold">Share</span>
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Job Content Section */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/50">
              <div className="border-b border-slate-100 bg-slate-50/20 px-8 py-4">
                <h2 className="text-[13px] font-bold uppercase tracking-wider text-primary">Job Overview & Details</h2>
              </div>

              <div className="p-6 sm:p-8">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="prose prose-slate max-w-none">
                    {description ? (
                      <div 
                        className="text-[15px] leading-relaxed text-slate-600 font-medium space-y-4"
                        dangerouslySetInnerHTML={{ __html: description }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                        <Briefcase className="w-8 h-8 opacity-20 mb-2" />
                        <p className="text-sm font-semibold italic">No detailed description provided for this opening.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Compact Sidebar */}
          <aside className="space-y-6">
            {/* Quick Action Card */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-200/50">
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Avg. Compensation</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{salaryRange}</p>
              </div>

              <div className="mt-6 space-y-3">
                <Link href={`/apply/${jobSegment}`}>
                  <Button variant="hero" className="h-11 w-full rounded-lg font-bold shadow-lg shadow-primary/10">
                    Apply for this job
                  </Button>
                </Link>
                <div className="flex items-center justify-center gap-3 py-1">
                  <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" /> {postedText}
                  </p>
                </div>
              </div>
            </section>

            {/* Institution Profile Card */}
            <section className="overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm ring-1 ring-slate-200/50">
              <div className="h-16 bg-slate-50 border-b border-slate-100" />
              <div className="relative -mt-8 flex px-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white p-1.5 shadow-md border border-slate-100">
                  {employerLogo ? (
                    <img src={normalizeMediaUrl(employerLogo)} alt={employerName} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-xl font-bold text-primary">{logoFallback}</span>
                  )}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900 truncate leading-tight">{employerName}</h3>
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                </div>
                <p className="mt-1 text-xs font-medium text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {job.location || "India"}
                </p>

                <div className="mt-6 space-y-3">
                  {[
                    { icon: Users, label: "Hiring State", value: job.vacancies ? "Bulk Hiring" : "Selective Hiring" },
                    { icon: Globe, label: "Profile Status", value: "Verified Profile" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-50 text-slate-400 shrink-0">
                        <item.icon className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-xs font-bold text-slate-600">{item.value}</p>
                    </div>
                  ))}
                </div>

                {institutionHref && (
                  <Link href={institutionHref} className="mt-6 flex items-center justify-between rounded-lg bg-slate-50 p-3 transition-all hover:bg-primary/5 group">
                    <p className="text-xs font-bold text-slate-700">View School Profile</p>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                  </Link>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* Similar Jobs Grid */}
      {similarJobs.length > 0 && (
        <section className="mt-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 border-t border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900">Similar Job Openings</h2>
            <Link href="/jobs" className="text-sm font-bold text-primary hover:underline">
              Browse All <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similarJobs.slice(0, 3).map((sJob) => (
              <Link
                key={sJob.id}
                href={`/${sanitizeSlug(sJob.slug || sJob.id.toString())}`}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30 group"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                    <span className="text-sm font-bold text-primary">{(sJob.employer?.company_name?.[0] || "J").toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors truncate">{sJob.title}</h3>
                    <p className="text-[11px] font-semibold text-slate-400 truncate">{sJob.employer?.company_name}</p>
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="text-[12px] font-bold text-primary">{formatSalaryRange(sJob)}</span>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

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
