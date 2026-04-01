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
  CheckCircle2,
  Heart,
  Award,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Job } from "@/types/homepage";
import { sanitizeSlug } from "@/lib/utils";
import { normalizeMediaUrl } from "@/services/api/client";
import { useBookmarks } from "@/hooks/useBookmarks";
import { toast } from "sonner";

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

function getResponsibilities(job: Job, employerName: string): string[] {
  if (job.description) {
    const sections = job.description.split(/(?=Responsibilities|Key Responsibilities|What You'll Do)/i);
    const responsibilitiesSection = sections.find(s => /Responsibilities|Key Responsibilities|What You'll Do/i.test(s));
    if (responsibilitiesSection) {
      return responsibilitiesSection
        .replace(/Responsibilities|Key Responsibilities|What You'll Do/i, "")
        .split(/[•\n*-]/)
        .map(s => s.trim().replace(/^[: -]+/, ""))
        .filter(s => s.length > 5);
    }
  }
  return [
    `Deliver high-quality instruction as a ${job.title || "teaching professional"} at ${employerName}.`,
    `Support students with lesson planning, classroom engagement, and academic progress.`,
    `Collaboration with the academic team to improve learning outcomes and curriculum delivery.`,
  ];
}

function getRequirements(job: Job): string[] {
  if (job.description) {
    const sections = job.description.split(/(?=Requirements|Eligibility|What We're Looking For|Necessary Skills)/i);
    const requirementsSection = sections.find(s => /Requirements|Eligibility|What We're Looking For/i.test(s));
    if (requirementsSection) {
      return requirementsSection
        .replace(/Requirements|Eligibility|What We're Looking For|Necessary Skills/i, "")
        .split(/[•\n*-]/)
        .map(s => s.trim().replace(/^[: -]+/, ""))
        .filter(s => s.length > 5);
    }
  }
  return [
    job.experience_required
      ? `${job.experience_required}+ years of relevant teaching experience.`
      : "Relevant teaching or subject expertise preferred.",
    "Strong communication, planning, and learner engagement skills.",
    `Comfort working in a ${formatJobType(job.job_type).toLowerCase()} role based in ${job.location || "India"}.`,
  ];
}

function getBenefits(job: Job): string[] {
  if (job.description) {
    const sections = job.description.split(/(?=Benefits|What We Offer|Perks)/i);
    const benefitsSection = sections.find(s => /Benefits|What We Offer|Perks/i.test(s));
    if (benefitsSection) {
      return benefitsSection
        .replace(/Benefits|What We Offer|Perks/i, "")
        .split(/[•\n*-]/)
        .map(s => s.trim().replace(/^[: -]+/, ""))
        .filter(s => s.length > 5);
    }
  }
  return [
    `Competitive compensation: ${formatSalaryRange(job)}.`,
    "Opportunity to work with a growing academic team and motivated learners.",
    job.vacancies ? `${job.vacancies} active openings for this role.` : "Quick application process and active hiring support.",
  ];
}


export default function JobDetails({ job, slug }: JobDetailsProps) {
  const [activeTab, setActiveTab] = useState("Description");
  const [mounted, setMounted] = useState(false);
  const { bookmarkJob, removeBookmark, getBookmarks } = useBookmarks();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkBookmark = async () => {
      try {
        const bookmarks = await getBookmarks();
        if (Array.isArray(bookmarks)) {
          setIsBookmarked(bookmarks.some((b: any) => b.id === job.id));
        }
      } catch (err) { /* ignore */ }
    };
    checkBookmark();
  }, [job.id, getBookmarks]);

  const handleToggleBookmark = async () => {
    try {
      setBookmarkLoading(true);
      if (isBookmarked) {
        await removeBookmark(job.id);
        setIsBookmarked(false);
        toast.success("Job removed from saved.");
      } else {
        await bookmarkJob(job.id);
        setIsBookmarked(true);
        toast.success("Job saved!");
      }
    } catch (err) {
      toast.error("Failed to update saved jobs.");
    } finally {
      setBookmarkLoading(false);
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
  const description =
    job.description ||
    `${employerName} is looking for a skilled ${title} to join the team in ${job.location || "India"}. This role is ideal for someone who enjoys delivering meaningful outcomes and working in a learner-focused environment.`;

  const responsibilities = getResponsibilities(job, employerName);
  const requirements = getRequirements(job);
  const benefits = getBenefits(job);
  const similarJobs = Array.isArray(job.similar_jobs) ? job.similar_jobs : [];

  const tabs = ["Description", "Responsibilities", "Requirements", "Benefits"];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Sticky Breadcrumb Bar */}
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            {/* Professional Header Section */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md ring-1 ring-slate-200/50">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-start lg:gap-8">
                  {/* Logo Container */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 border border-slate-100 p-2 shadow-sm sm:h-20 sm:w-20">
                    {employerLogo ? (
                      <img src={normalizeMediaUrl(employerLogo)} alt={employerName} className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-2xl font-bold text-primary">{logoFallback}</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 border border-blue-100">
                        <Sparkles className="h-3 w-3" /> Featured
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-100">
                        <Zap className="h-3 w-3" /> Active
                      </span>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                      {title}
                    </h1>

                    <div className="mt-2 flex items-center gap-2">
                      <Link href={institutionHref} className="text-base font-semibold text-primary/80 hover:text-primary transition-colors hover:underline">
                        {employerName}
                      </Link>
                    </div>

                    {/* Compact Meta Grid */}
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-50 pt-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</p>
                        <p className="text-sm font-semibold text-slate-600 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {job.location || "India"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Salary</p>
                        <p className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                          {salaryRange}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Experience</p>
                        <p className="text-sm font-semibold text-slate-600 flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                          {job.experience_required ? `${job.experience_required}+ Yrs` : "Fresher"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Type</p>
                        <p className="text-sm font-semibold text-slate-600 flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                          {jobType}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compact Action Bar */}
                <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-50 pt-6">
                  <Link href={`/apply/${jobSegment}`} className="sm:flex-1">
                    <Button variant="hero" size="lg" className="h-11 w-full rounded-lg font-bold shadow-lg shadow-primary/10">
                      Apply Now
                    </Button>
                  </Link>
                  <Button
                    variant={isBookmarked ? "secondary" : "outline"}
                    size="lg"
                    className={`h-11 rounded-lg px-5 flex items-center gap-2 border-slate-200 ${isBookmarked ? 'text-primary bg-primary/5 border-primary/20' : ''}`}
                    onClick={handleToggleBookmark}
                    disabled={bookmarkLoading}
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-primary' : ''}`} />
                    <span className="font-bold">{isBookmarked ? "Saved" : "Save"}</span>
                  </Button>
                  <Button variant="outline" size="lg" className="h-11 rounded-lg px-5 flex items-center gap-2 border-slate-200">
                    <Share2 className="h-4 w-4" />
                    <span className="font-bold">Share</span>
                  </Button>
                  <div className="ml-auto hidden md:block">
                    <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5" /> {postedText}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Content Tabs Section */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-200/50">
              <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50/20 px-2 no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-5 py-4 text-[13px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab
                        ? "text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary"
                        : "text-slate-500 hover:text-slate-700"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6 sm:p-8">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {activeTab === "Description" && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-bold text-slate-900">Work Environment & Role</h2>
                      <p className="text-[15px] leading-relaxed text-slate-600 font-medium">{description}</p>
                    </div>
                  )}

                  {activeTab === "Responsibilities" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-slate-900">Key Deliverables</h3>
                      <ul className="grid gap-3 sm:grid-cols-2">
                        {responsibilities.map((item, idx) => (
                          <li key={idx} className="flex gap-3 rounded-lg border border-slate-50 bg-slate-50/50 p-4">
                            <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                            <span className="text-[14px] font-semibold text-slate-700 leading-tight">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeTab === "Requirements" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-slate-900">Preferred Qualifications</h3>
                      <div className="space-y-3">
                        {requirements.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="mt-1 h-5 w-5 shrink-0 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-[15px] font-semibold text-slate-600 leading-snug">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "Benefits" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-slate-900">Employee Benefits</h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {benefits.map((item, idx) => {
                          let Icon = Sparkles;
                          const l = item.toLowerCase();
                          if (l.includes("compens") || l.includes("salary") || l.includes("opening")) Icon = Award;
                          else if (l.includes("health") || l.includes("medical") || l.includes("perk") || l.includes("benefit")) Icon = Heart;
                          else if (l.includes("team") || l.includes("environment") || l.includes("support")) Icon = Users;
                          else if (l.includes("growth") || l.includes("opportunity")) Icon = TrendingUp;

                          return (
                            <div key={idx} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 group-hover:text-primary transition-colors">
                                <Icon className="h-4 w-4" />
                              </div>
                              <p className="text-[14px] font-bold text-slate-700">{item}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
    </div>
  );
}
