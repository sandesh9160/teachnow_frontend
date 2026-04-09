"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { toast } from "sonner";
import { useClientSession } from "@/hooks/useClientSession";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  IndianRupee,
  Building2,
  CheckCircle2,
  FileText,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  User,
  Mail,
  Phone,
  Clock,
  Loader2,
  Plus,
  Star,
  Bookmark,
} from "lucide-react";
import { getJobBySlug } from "@/lib/jobs/api";
import { useApplications } from "@/hooks/useApplications";
import { useResumes } from "@/hooks/useResumes";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Job } from "@/types/homepage";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";

const STEPS = ["Review Job", "Your Details", "Resume", "Submit"];

export default function ApplyJobPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { isLoggedIn, user, loading: sessionLoading } = useClientSession();
  const { apply } = useApplications();
  const { resumes } = useResumes({ enabled: isLoggedIn });
  const { bookmarks, fetchBookmarks, toggleBookmark, loading: bookmarksHookLoading } = useBookmarks();
  const [bookmarkBusy, setBookmarkBusy] = useState(false);

  const [step, setStep] = useState(0);
  const [candidate, setCandidate] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    location: "",
    dob: "",
    portfolio_website: "",
    bio: "",
    skills: [] as string[],
  });

  useEffect(() => {
    if (user) {
      setCandidate({
        name: user.name || "",
        email: user.email || "",
        phone: "",
        experience: "",
        location: "",
        dob: "",
        portfolio_website: "",
        bio: "",
        skills: [],
      });
    }
  }, [user]);

  const [submitted, setSubmitted] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string | number>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Job Details
  useEffect(() => {
    async function loadJob() {
      if (!slug) return;
      try {
        const found = await getJobBySlug(slug);
        setJob(found);
      } catch (error) {
        console.error("Error loading job for application:", error);
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [slug]);

  const isBookmarked = bookmarks.some((b) => String(b.id) === String(job?.id));

  useEffect(() => {
    if (isLoggedIn && job?.id) {
      void fetchBookmarks();
    }
  }, [isLoggedIn, job?.id, fetchBookmarks]);

  const handleToggleBookmark = async () => {
    if (!job?.id) return;
    try {
      setBookmarkBusy(true);
      await toggleBookmark(job.id);
      toast.success(isBookmarked ? "Job removed from saved." : "Job saved!");
    } catch (err) {
      toast.error("Failed to update saved jobs.");
    } finally {
      setBookmarkBusy(false);
    }
  };

  // 2. Fetch Jobseeker Profile for pre-filling
  useEffect(() => {
    const fetchFullProfile = async () => {
      if (!isLoggedIn || user?.role !== "job_seeker") return;
      try {
        const { dashboardServerFetch } = await import("@/actions/dashboardServerFetch");
        const res = await dashboardServerFetch<any>("jobseeker/profile", { method: "GET" });
        if (res?.data) {
          const profile = res.data.profile || res.data;
          setCandidate((prev) => ({
            ...prev,
            phone: profile.phone || "",
            experience: profile.experience_years ? String(profile.experience_years) : "",
            location: profile.location || "",
            dob: profile.dob || "",
            portfolio_website: profile.portfolio_website || "",
            bio: profile.bio || "",
            skills: Array.isArray(profile.skills) ? profile.skills : [],
          }));
        }
      } catch (err) {
        console.error("Failed to load profile for application auto-fill", err);
      }
    };
    fetchFullProfile();
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (!resumes.length) return;
    const defaultResume = resumes.find((r) => r.is_default);
    if (defaultResume) setSelectedResumeId(defaultResume.id);
    else setSelectedResumeId(resumes[0].id);
  }, [resumes]);

  useEffect(() => {
    if (!loading && !sessionLoading) {
      if (!isLoggedIn) {
        router.push("/auth/login?redirect=" + encodeURIComponent(`/apply/${slug}`));
      } else if (user?.role === "employer") {
        router.back();
      }
    }
  }, [loading, sessionLoading, isLoggedIn, user, router, slug]);

  if (loading || !job) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen">
        <div className="border-b border-border bg-white/80 backdrop-blur-md sticky top-16 z-40">
          <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
            <Breadcrumb items={[{ label: "Jobs", href: "/jobs" }, { label: "Apply", isCurrent: true }]} />
          </div>
        </div>
        <div className="flex h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              </div>
            </div>
            <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">
              {!loading && !job ? "Job not found" : "Synchronizing..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // We can treat job as jobDetails now that we've ensured it exists
  const jobDetails = job;

  const handleSubmit = async () => {
    if (!jobDetails?.id) return;
    try {
      setIsSubmitting(true);
      const answers: { question_id: number; candidate_answer: string }[] = [];
      const response = await apply(jobDetails.id, answers);
      console.log("DEBUG: Application successful response:", response);

      setSubmitted(true);
      toast.success("Application Submitted Successfully");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to submit application.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn || user?.role === "employer") {
    return null;
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-12">
      {/* Consistent Breadcrumb Bar */}
      <div className="border-b border-border bg-white/80 backdrop-blur-md sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <Breadcrumb items={[
            { label: "Jobs", href: "/jobs" },
            { label: "Apply", isCurrent: true }
          ]} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-10">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">
            {submitted ? "Application Complete" : "Apply for Position"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {jobDetails.title} at {jobDetails.employer?.company_name}
          </p>
        </div>

        {!submitted && (
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((label, i) => {
                let stepClass = "bg-muted text-muted-foreground";
                const isActive = i === step;
                const isCompleted = i < step;
                
                if (isCompleted) {
                  stepClass = "bg-accent/20 text-accent";
                } else if (isActive) {
                  stepClass = "bg-primary text-primary-foreground shadow-lg shadow-primary/20";
                }

                return (
                  <div key={label} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${stepClass}`}
                      >
                        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                      </div>
                      <span className={`mt-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-tight whitespace-nowrap hidden min-[400px]:block ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                        {label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-0.5 flex-1 rounded-full mx-1 md:mx-2 mb-0 md:mb-4 ${isCompleted ? "bg-accent/40" : "bg-muted"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 md:p-8 shadow-card overflow-hidden">
          {step === 0 && !submitted && (
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-muted/30 p-4 md:p-5">
                <div className="flex items-center md:items-start gap-4">
                  <div className="flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-display font-bold text-xl overflow-hidden border border-primary/5">
                    {jobDetails.employer?.company_logo ? (
                      <img src={jobDetails.employer.company_logo} alt="Logo" className="h-full w-full object-contain" />
                    ) : (
                      (jobDetails.employer?.company_name || "J")[0]
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-base md:text-lg font-bold text-foreground truncate">{jobDetails.title}</h3>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                      <Building2 className="h-3.5 w-3.5 text-primary/60 shrink-0" /> <span className="truncate">{jobDetails.employer?.company_name}</span>
                    </p>
                  </div>
                  <button
                    onClick={handleToggleBookmark}
                    disabled={bookmarkBusy || bookmarksHookLoading}
                    className={`shrink-0 rounded-xl p-2.5 transition-all duration-200 border ${
                      isBookmarked 
                        ? "bg-primary/10 border-primary/20 text-primary" 
                        : "bg-white border-border text-muted-foreground hover:border-primary/30 hover:text-primary hover:shadow-sm"
                    }`}
                    title={isBookmarked ? "Remove from saved" : "Save for later"}
                  >
                    <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-primary" : ""}`} />
                  </button>
                </div>
                <div className="mt-5 grid grid-cols-1 min-[450px]:grid-cols-2 gap-y-3 gap-x-6">
                  {[
                    { icon: MapPin, label: "Location", value: jobDetails.location },
                    { icon: IndianRupee, label: "Salary", value: `${jobDetails.salary_min} - ${jobDetails.salary_max}` },
                    { icon: GraduationCap, label: "Experience", value: `${jobDetails.experience_required}+ years` },
                    { icon: Briefcase, label: "Type", value: jobDetails.job_type },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-xs">
                      <item.icon className="h-4 w-4 text-primary/60" />
                      <div className="min-w-0 truncate">
                        <span className="text-muted-foreground">{item.label}: </span>
                        <span className="font-medium text-foreground">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {jobDetails.description && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Job Description</h4>
                  <div 
                    className="text-sm text-muted-foreground leading-relaxed rich-text"
                    dangerouslySetInnerHTML={{ __html: jobDetails.description }}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 h-8 rounded-lg text-[9px] font-bold" onClick={() => router.back()}>Cancel</Button>
                <Button className="flex-1 h-8 rounded-lg text-[9px] font-bold shadow-sm shadow-primary/20" onClick={() => setStep(1)}>
                  Next <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {step === 1 && !submitted && (
            <div className="space-y-4 md:space-y-6">
              <p className="text-sm text-muted-foreground font-medium">Please verify your contact information.</p>
              <div className="grid grid-cols-1 gap-4 md:gap-5">
                {[
                  { key: "name" as const, label: "Full Name", icon: User, type: "text" },
                  { key: "email" as const, label: "Email Address", icon: Mail, type: "email" },
                  { key: "phone" as const, label: "Phone Number", icon: Phone, type: "tel" },
                  { key: "experience" as const, label: "Years of Experience", icon: Clock, type: "text" },
                  { key: "location" as const, label: "Current Location", icon: MapPin, type: "text" },
                ].map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">{field.label}</label>
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                      <field.icon className="h-4 w-4 shrink-0 text-primary/60" />
                      <input
                        type={field.type}
                        value={candidate[field.key]}
                        onChange={(e) => setCandidate({ ...candidate, [field.key]: e.target.value })}
                        className="w-full bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/50"
                        placeholder={`Your ${field.label.toLowerCase()}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button variant="outline" className="flex-1 h-8 rounded-lg text-[9px] font-bold" onClick={() => setStep(0)}>
                  <ArrowLeft className="mr-2 h-3 w-3" /> Back
                </Button>
                <Button className="flex-1 h-8 rounded-lg text-[9px] font-bold shadow-sm shadow-primary/20" onClick={() => setStep(2)}>
                  Next <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && !submitted && (
            <div className="space-y-5 md:space-y-6">
              <p className="text-sm text-muted-foreground font-medium">Select your preferred resume for this application.</p>
              {resumes.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 md:gap-4">
                  {resumes.map((resume) => (
                    <label
                      key={resume.id}
                      className={`flex items-start md:items-center gap-4 rounded-xl border p-4 md:p-5 cursor-pointer transition-all duration-200 ${selectedResumeId === resume.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
                        }`}
                    >
                      <input
                        type="radio"
                        checked={selectedResumeId === resume.id}
                        onChange={() => setSelectedResumeId(resume.id)}
                        className="sr-only"
                      />
                      <div className={`flex h-11 w-11 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${selectedResumeId === resume.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-bold text-foreground truncate">{resume.title ?? resume.file_name ?? "Resume Artifact"}</p>
                          {resume.is_default && <Star className="h-3.5 w-3.5 fill-accent text-accent" />}
                        </div>
                        <p className="text-[11px] font-medium text-muted-foreground/80 uppercase tracking-tight">
                          {(resume.file_name ?? "PDF").split(".").pop()} · {resume.size ?? "Unknown Size"}
                        </p>
                      </div>
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedResumeId === resume.id ? 'border-primary bg-primary' : 'border-border'}`}>
                        {selectedResumeId === resume.id && <div className="h-2 w-2 rounded-full bg-white shadow-sm" />}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center bg-muted/20">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <h4 className="text-base font-bold text-foreground mb-1">No Resumes Found</h4>
                  <p className="text-sm text-muted-foreground max-w-[240px] mx-auto">Please add a resume to your profile to continue with your application.</p>
                </div>
              )}

              <Button variant="outline" className="w-full h-8 rounded-lg text-[9px] font-bold border-dashed border-2 hover:border-primary/50 gap-2" onClick={() => router.push("/dashboard/jobseeker/resume")}>
                <Plus className="h-3 w-3" /> Manage Resumes
              </Button>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button variant="outline" className="flex-1 h-8 rounded-lg text-[9px] font-bold" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-3 w-3" /> Back
                </Button>
                <Button className="flex-1 h-8 rounded-lg text-[9px] font-bold shadow-sm shadow-primary/20" onClick={() => {
                  if (!selectedResumeId && resumes.length > 0) {
                    toast.error("Please select a resume to proceed");
                    return;
                  }
                  setStep(3);
                }}>
                  Next Step <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && !submitted && (
            <div className="space-y-6 md:space-y-8">
              <div className="rounded-2xl border border-border bg-muted/20 p-5 md:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                  {[
                    { label: "Job Position", value: jobDetails.title },
                    { label: "Institution", value: jobDetails.employer?.company_name },
                    { label: "Full Name", value: candidate.name },
                    { label: "Email", value: candidate.email },
                    { label: "Phone", value: candidate.phone || "—" },
                    { label: "Experience", value: candidate.experience ? `${candidate.experience} Years` : "—" },
                    { label: "Location", value: candidate.location || "—" },
                    { label: "Date of Birth", value: candidate.dob || "—" },
                    { label: "Portfolio", value: candidate.portfolio_website || "—" },
                    { label: "Selected Resume", value: resumes.find((r) => r.id === selectedResumeId)?.title ?? resumes.find((r) => r.id === selectedResumeId)?.file_name ?? "Not linked" },
                  ].map((item) => (
                    <div key={item.label} className="min-w-0 group">
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground/60 mb-1 group-hover:text-primary transition-colors">{item.label}</span>
                      <span className="block font-bold text-foreground truncate text-sm md:text-base">{item.value}</span>
                    </div>
                  ))}
                </div>

                {candidate.skills.length > 0 && (
                  <div className="pt-2">
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground/60 mb-2">Skills Expertise</span>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill: any, idx: number) => {
                         const skillName = typeof skill === 'object' ? (skill.name || skill.title || "Skill") : String(skill);
                         return (
                          <span key={idx} className="px-3 py-1 rounded-lg bg-primary/5 text-primary text-[11px] font-bold border border-primary/10 shadow-sm">
                            {skillName.toUpperCase()}
                          </span>
                         );
                      })}
                    </div>
                  </div>
                )}

                {candidate.bio && (
                  <div className="pt-6 border-t border-border/50 space-y-5">
                    <div className="bg-background/50 rounded-xl p-4 border border-border/30">
                      <span className="block text-[10px] uppercase font-bold text-muted-foreground/60 mb-2">Professional Bio</span>
                      <div 
                        className="text-sm text-muted-foreground leading-relaxed rich-text"
                        dangerouslySetInnerHTML={{ __html: candidate.bio.replace(/\n/g, '<br/>') }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1 h-8 rounded-lg text-[9px] font-bold" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-3 w-3" /> Back
                </Button>
                <Button variant="hero" className="flex-1 h-8 rounded-lg text-[9px] font-bold shadow-sm shadow-primary/20" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Sparkles className="mr-2 h-3 w-3" />}
                  {isSubmitting ? "Sending..." : "Submit Application"}
                </Button>
              </div>
            </div>
          )}

          {submitted && (
            <div className="text-center py-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-accent mb-5">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">Application Submitted!</h3>
              <p className="mt-2 text-sm text-muted-foreground mx-auto max-w-sm">
                Your application for <span className="font-semibold text-foreground">{jobDetails.title}</span> at <span className="font-semibold text-foreground">{jobDetails.employer?.company_name}</span> has been sent.
              </p>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => router.push("/dashboard/jobseeker/applied-jobs")}>
                  View Applications
                </Button>
                <Button className="flex-1" onClick={() => router.push("/jobs")}>
                  Browse More
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
