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
  Globe,
  User,
  Mail,
  Phone,
  Clock,
  Loader2,
  Plus,
  // Star,
  Bookmark,
  X,
  Eye,
  Check,
} from "lucide-react";
import { getJobBySlug } from "@/lib/jobs/api";
import { useApplications } from "@/hooks/useApplications";
import { useResumes } from "@/hooks/useResumes";
import { useCV } from "@/hooks/useCV";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Job } from "@/types/homepage";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import QuickAuthModal from "@/components/auth/QuickAuthModal";
import Link from "next/link";

// We'll define dynamic steps inside the component
// const STEPS = ["Review Job", "Your Details", "Resume", "Submit"];


export default function ApplyJobPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { isLoggedIn, user } = useClientSession();
  const { apply } = useApplications();
  const { resumes, fetchResumes, generatedResumes } = useResumes({ enabled: isLoggedIn });
  const { fetchTemplates, templates: cvTemplates, generateCVWithJob, fetchGeneratedCVs } = useCV();
  const { bookmarks, fetchBookmarks, toggleBookmark, loading: bookmarksHookLoading } = useBookmarks();

  useEffect(() => {
    if (isLoggedIn) {
      void fetchGeneratedCVs();
    }
  }, [isLoggedIn, fetchGeneratedCVs]);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !isLoggedIn) {
      const timer = setTimeout(() => setShowAuthModal(true), 1500);
      return () => clearTimeout(timer);
    }
    return;
  }, [mounted, isLoggedIn]);

  const [step, setStep] = useState(0);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step]);
  const [candidate, setCandidate] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    location: "",
    dob: "",
    portfolio_website: "",
    bio: "",
    skills: [] as any[],
    educations: [] as any[],
    experiences: [] as any[],
  });

  const [questionAnswers, setQuestionAnswers] = useState<Record<number, string>>({});


  // Candidate data is initialized via the profile fetch effect below which handles both session user and detailed profile data


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
    // 1. Priority: Sync name/email from active session immediately
    if (user) {
      setCandidate(prev => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
      }));
    }

    const fetchFullProfile = async () => {
      if (!isLoggedIn || user?.role !== "job_seeker") return;
      try {
        const { dashboardServerFetch } = await import("@/actions/dashboardServerFetch");
        const res = await dashboardServerFetch<any>("jobseeker/profile", { method: "GET" });

        console.log("DEBUG: Profile response fetched:", res);

        if (res) {
          // Extract data using exact same logic as useClientSession for consistency
          const profile = (
            (res?.data as any)?.job_seeker ??
            res?.data ??
            res?.profile ??
            res
          );

          if (profile) {
            setCandidate((prev) => ({
              ...prev,
              name: profile.user?.name || profile.name || prev.name || user?.name || "",
              email: profile.user?.email || profile.email || prev.email || user?.email || "",
              phone: profile.phone || prev.phone || "",
              experience: profile.experience_years ? String(profile.experience_years) : (prev.experience || ""),
              location: profile.location || prev.location || "",
              dob: profile.dob || prev.dob || "",
              portfolio_website: profile.portfolio_website || prev.portfolio_website || "",
              bio: profile.bio || prev.bio || "",
              skills: Array.isArray(profile.skills) ? profile.skills : prev.skills,
              educations: Array.isArray(profile.educations) ? profile.educations : prev.educations,
              experiences: Array.isArray(profile.experiences) ? profile.experiences : prev.experiences,
            }));
          }
        }
      } catch (err) {
        console.error("CRITICAL: Failed to load profile for application auto-fill", err);
      }
    };
    fetchFullProfile();
  }, [isLoggedIn, user]);

  // Initialize recruiter questions answers
  useEffect(() => {
    if (job) {
      const initial: Record<number, string> = {};
      if (job.cover_letter_question_id) {
        initial[job.cover_letter_question_id] = "";
      }

      // Support both legacy screening_questions and new questions array
      job.screening_questions?.forEach(q => {
        initial[q.id] = "";
      });

      job.questions?.forEach(q => {
        initial[q.id] = "";
      });

      setQuestionAnswers(prev => ({ ...initial, ...prev }));
    }
  }, [job]);



  useEffect(() => {

    console.log("DEBUG: Current candidate state:", candidate);
  }, [candidate]);

  useEffect(() => {
    if (!resumes.length) return;
    const defaultResume = resumes.find((r) => r.is_default);
    if (defaultResume) setSelectedResumeId(defaultResume.id);
    else setSelectedResumeId(resumes[0].id);
  }, [resumes]);

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const [showTemplateOverlay, setShowTemplateOverlay] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [uploadedPage, setUploadedPage] = useState(1);
  const [generatedPage, setGeneratedPage] = useState(1);
  const [resumeTab, setResumeTab] = useState<'uploaded' | 'generated'>('uploaded');

  const itemsPerPage = 5;

  const handlePreviewResume = (path: string | null | undefined) => {
    const url = getFullFileUrl(path);
    console.log("DEBUG: handlePreviewResume triggered with path:", path, "Resolved URL:", url);
    if (url) {
      setPreviewUrl(url);
      setShowResumePreview(true);
    }
  };

  const handleGenerateResume = async (templateId: number | string) => {
    if (!job?.id) return;
    try {
      setIsGenerating(true);
      const res = await generateCVWithJob({
        template_id: templateId,
        job_id: job.id,
      });


      if (res?.status) {
        toast.success("Resume generated with AI!");
        await fetchResumes();
        setShowTemplateOverlay(false);
      }
    } catch (err: any) {
      toast.error(err?.message || "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (showTemplateOverlay) {
      void fetchTemplates();
    }
  }, [showTemplateOverlay, fetchTemplates]);

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

  const getFullFileUrl = (path: string | null | undefined) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";
    const url = `${baseUrl}/${path.startsWith("/") ? path.slice(1) : path}`;
    console.log("DEBUG: Resolved File URL:", url);
    return url;
  };

  const handleSubmit = async () => {
    if (!jobDetails?.id) return;
    try {
      // Collect all answers
      const answers: { question_id: number; candidate_answer: string }[] = [];

      Object.entries(questionAnswers).forEach(([qid, ans]) => {
        if (ans.trim()) {
          answers.push({
            question_id: parseInt(qid),
            candidate_answer: ans.trim()
          });
        }
      });

      const finalResumeId = typeof selectedResumeId === 'number' 
        ? selectedResumeId 
        : parseInt(String(selectedResumeId).replace('cv-', ''));

      console.log("DEBUG: Submitting application...", {
        jobId: jobDetails.id,
        answers,
        resumeId: finalResumeId
      });

      setIsSubmitting(true);

      const response = await apply(jobDetails.id, answers, finalResumeId);
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

  const hasQuestions = !!(jobDetails?.screening_questions?.length) || !!(jobDetails?.questions?.length) || !!jobDetails?.cover_letter_question_id;
  const currentSteps = ["Review Job", "Your Details", "Resume", ...(hasQuestions ? ["Questions"] : []), "Submit"];

  const questionsStepIdx = currentSteps.indexOf("Questions");
  const submitStepIdx = currentSteps.indexOf("Submit");







  if (!mounted) return null;

  if (!isLoggedIn) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen">
        <div className="border-b border-border bg-white/80 backdrop-blur-md sticky top-16 z-40">
          <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
            <Breadcrumb items={[{ label: "Jobs", href: "/jobs" }, { label: "Apply", isCurrent: true }]} />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <User className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Login Required</h2>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                You need to be logged in as a Job Seeker to apply for
                <span className="text-primary font-bold"> {jobDetails.title}</span>.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Button variant="hero" size="lg" className="w-full h-12 rounded-xl font-bold text-base" onClick={() => setShowAuthModal(true)}>
                Sign In to Apply
              </Button>
              <Button variant="outline" className="w-full h-11 border-slate-200 rounded-xl font-bold text-sm" onClick={() => router.back()}>
                Go Back
              </Button>
            </div>
          </div>

          <QuickAuthModal
            open={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onSuccess={() => {
              setShowAuthModal(false);
              // Page will automatically re-render because isLoggedIn state changes
            }}
            title="Sign In to Apply"
            subTitle="Submit your application for this position in seconds."
          />
        </div>
      </div>
    );
  }

  if (user?.role === "employer") {
    return (
      <div className="bg-[#F8FAFC] min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl border border-amber-200 shadow-xl max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <Building2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Access Restricted</h2>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              Employer accounts cannot apply for jobs. Please log in as a
              <span className="text-primary font-bold"> Job Seeker</span> to submit applications.
            </p>
          </div>
          <Link href="/dashboard/employer" className="block pt-2">
            <Button variant="hero" className="w-full h-12 rounded-xl font-bold text-base">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
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

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="mb-5">
          <h1 className="font-display text-xl font-bold text-foreground">
            {submitted ? "Application Complete" : "Apply for Position"}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {jobDetails.title} at {jobDetails.employer?.company_name}
          </p>
        </div>

        {!submitted && (
          <div className="mb-5">
            <div className="flex items-center justify-between">
              {currentSteps.map((label, i: number) => {
                let stepClass = "bg-muted text-muted-foreground";
                const isActive = i === step;
                const isCompleted = i < step;

                if (isCompleted) {
                  stepClass = "bg-accent/20 text-accent";
                } else if (isActive) {
                  stepClass = "bg-primary text-primary-foreground shadow-md shadow-primary/20";
                }

                return (
                  <div key={label} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ${stepClass}`}
                      >
                        {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                      </div>
                      <span className={`mt-1 text-[8px] font-bold uppercase tracking-tight whitespace-nowrap hidden min-[400px]:block ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                        {label}
                      </span>
                    </div>
                    {i < currentSteps.length - 1 && (
                      <div className={`h-0.5 flex-1 rounded-full mx-1 md:mx-2 mb-0 min-[400px]:mb-3 ${isCompleted ? "bg-accent/40" : "bg-muted"}`} />
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
                    className={`shrink-0 rounded-xl p-2.5 transition-all duration-200 border ${isBookmarked
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

              <div className="flex gap-3 pt-6">
                <Button variant="outline" className="flex-1 h-12 rounded-xl text-sm font-semibold" onClick={() => router.back()}>Cancel</Button>
                <Button className="flex-1 h-12 rounded-xl text-sm font-semibold shadow-sm shadow-primary/20" onClick={() => setStep(1)}>
                  Continue Application <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 1 && !submitted && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground font-medium">Verify your details. Fields marked <span className="text-red-500">*</span> are required.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: "name" as const, label: "Full Name", icon: User, type: "text", required: true },
                  { key: "email" as const, label: "Email", icon: Mail, type: "email", required: true },
                  { key: "phone" as const, label: "Phone", icon: Phone, type: "tel", required: true },
                  { key: "experience" as const, label: "Experience (Yrs)", icon: Clock, type: "text", required: true },
                  { key: "location" as const, label: "Location", icon: MapPin, type: "text", required: true },
                  { key: "dob" as const, label: "Date of Birth", icon: Clock, type: "date", required: false },
                  { key: "portfolio_website" as const, label: "Portfolio / Website", icon: Globe, type: "url", required: false },
                ].map((field) => (
                  <div key={field.key} className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                      {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2.5 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                      <field.icon className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                      <input
                        type={field.type}
                        value={candidate[field.key]}
                        onChange={(e) => setCandidate({ ...candidate, [field.key]: e.target.value })}
                        className="w-full bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/40"
                        placeholder={field.label}
                        required={field.required}
                        suppressHydrationWarning
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Bio <span className="text-slate-400 text-[8px] normal-case">(optional)</span></label>
                <div className="rounded-lg border border-border bg-background px-3 py-2.5 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                  <textarea
                    value={candidate.bio}
                    onChange={(e) => setCandidate({ ...candidate, bio: e.target.value })}
                    className="w-full bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/40 min-h-[70px] resize-none"
                    placeholder="Brief professional summary..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 h-12 rounded-xl text-sm font-semibold" onClick={() => setStep(0)}>
                  Cancel
                </Button>
                <Button className="flex-1 h-12 rounded-xl text-sm font-semibold shadow-sm shadow-primary/20" onClick={() => {
                  if (!candidate.name.trim()) { toast.error("Full Name is required"); return; }
                  if (!candidate.email.trim()) { toast.error("Email is required"); return; }
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email)) { toast.error("Enter a valid email address"); return; }
                  if (!candidate.phone.trim()) { toast.error("Phone number is required"); return; }
                  if (!/^\+?\d{7,15}$/.test(candidate.phone.replace(/[\s-]/g, ''))) { toast.error("Enter a valid phone number"); return; }
                  if (!candidate.experience.trim()) { toast.error("Years of experience is required"); return; }
                  if (!candidate.location.trim()) { toast.error("Location is required"); return; }
                  setStep(2);
                }}>
                  Continue Application <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && !submitted && (
            <div className="space-y-5 md:space-y-6">
              <p className="text-sm text-muted-foreground font-medium">Select your preferred resume for this application.</p>

              {(resumes.length > 0 || generatedResumes.length > 0) ? (
                <div className="space-y-6">
                  {/* Tab Switcher / Toggle */}
                  <div className="flex items-center justify-center">
                    <div className="inline-flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl border border-slate-200/50">
                      <button
                        onClick={() => setResumeTab('uploaded')}
                        className={`flex items-center gap-2 px-6 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${resumeTab === 'uploaded' ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200/50' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <FileText className="w-3 h-3" />
                        Uploaded
                      </button>
                      <button
                        onClick={() => setResumeTab('generated')}
                        className={`flex items-center gap-2 px-6 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${resumeTab === 'generated' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200/50' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <FileText className="w-3 h-3" />
                        AI Generated
                      </button>
                    </div>
                  </div>

                  {/* Tab Content: Uploaded */}
                  {resumeTab === 'uploaded' && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(function () {
                          const start = (uploadedPage - 1) * itemsPerPage;
                          const paginated = resumes.slice(start, start + itemsPerPage);
                          if (resumes.length === 0) return <div className="col-span-full h-40 flex items-center justify-center text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-xl">No uploads found</div>;

                          return paginated.map((resume) => {
                            const isSelected = String(selectedResumeId) === String(resume.id);
                            return (
                              <label
                                key={resume.id}
                                className={`flex items-start md:items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all duration-200 ${isSelected
                                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                  : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
                                  }`}
                              >
                                <input
                                  type="radio"
                                  checked={isSelected}
                                  onChange={() => setSelectedResumeId(resume.id)}
                                  className="sr-only"
                                />
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-bold text-foreground truncate">{resume.title ?? resume.file_name ?? "Resume"}</p>
                                  <p className="text-[10px] font-medium text-muted-foreground/80 uppercase tracking-tight">
                                    {resume.file_name?.split(".").pop() || "PDF"} · {resume.size ?? "Unknown Size"}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePreviewResume(resume.url); }}
                                  className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </label>
                            );
                          });
                        })()}
                      </div>

                      {resumes.length > itemsPerPage && (
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Page {uploadedPage} of {Math.ceil(resumes.length / itemsPerPage)}</span>
                          <div className="flex gap-2">
                            <Button variant="outline" className="h-8 px-4 text-[10px] font-bold" onClick={() => setUploadedPage(p => Math.max(1, p - 1))} disabled={uploadedPage === 1}>
                              <ArrowLeft className="w-3 h-3 mr-1.5" /> Previous
                            </Button>
                            <Button variant="hero" className="h-8 px-4 text-[10px] font-bold" onClick={() => setUploadedPage(p => Math.min(Math.ceil(resumes.length / itemsPerPage), p + 1))} disabled={uploadedPage === Math.ceil(resumes.length / itemsPerPage)}>
                              Next <ArrowRight className="w-3 h-3 ml-1.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab Content: AI Generated */}
                  {resumeTab === 'generated' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(function () {
                          const start = (generatedPage - 1) * itemsPerPage;
                          const paginated = generatedResumes.slice(start, start + itemsPerPage);
                          if (generatedResumes.length === 0) return <div className="col-span-full h-40 flex items-center justify-center text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest border-2 border-dashed border-emerald-100 rounded-xl">No AI drafts generated</div>;

                          return paginated.map((cv) => {
                            const isSelected = String(selectedResumeId) === `cv-${cv.id}`;
                            return (
                              <label
                                key={cv.id}
                                className={`flex items-start md:items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all duration-200 ${isSelected
                                  ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200"
                                  : "border-border bg-card hover:border-emerald-300 hover:bg-emerald-50/30"
                                  }`}
                              >
                                <input
                                  type="radio"
                                  checked={isSelected}
                                  onChange={() => setSelectedResumeId(`cv-${cv.id}`)}
                                  className="sr-only"
                                />
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-bold text-foreground truncate">{cv.title || "AI Resume"}</p>
                                  <p className="text-[10px] font-medium text-muted-foreground/80 uppercase tracking-tight">
                                    {new Date(cv.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePreviewResume(cv.pdf_path); }}
                                  className="p-2 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </label>
                            );
                          });
                        })()}
                      </div>

                      {generatedResumes.length > itemsPerPage && (
                        <div className="flex items-center justify-between pt-4 border-t border-emerald-100">
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Page {generatedPage} of {Math.ceil(generatedResumes.length / itemsPerPage)}</span>
                          <div className="flex gap-2">
                            <Button variant="outline" className="h-8 px-4 text-[10px] font-bold" onClick={() => setGeneratedPage(p => Math.max(1, p - 1))} disabled={generatedPage === 1}>
                              <ArrowLeft className="w-3 h-3 mr-1.5" /> Previous
                            </Button>
                            <Button variant="outline" className="h-8 px-4 text-[10px] font-bold border-emerald-200 text-emerald-600 hover:bg-emerald-50" onClick={() => setGeneratedPage(p => Math.min(Math.ceil(generatedResumes.length / itemsPerPage), p + 1))} disabled={generatedPage === Math.ceil(generatedResumes.length / itemsPerPage)}>
                              Next <ArrowRight className="w-3 h-3 ml-1.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="flex-1 h-11 rounded-xl text-sm font-semibold gap-1 border-slate-200 hover:border-primary/40 hover:text-primary transition-all" onClick={() => router.push("/dashboard/jobseeker/resume")}>
                  <Plus className="h-4 w-4" /> Manage Resumes
                </Button>
                <Button
                  variant="hero"
                  className="flex-1 h-11 rounded-xl text-sm font-semibold shadow-sm shadow-primary/20 gap-2"
                  onClick={() => setShowTemplateOverlay(true)}
                  disabled={isGenerating}
                >
                  <FileText className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? "Generating..." : "Generate CV with AI"}
                </Button>
              </div>

              <div className="flex gap-3 pt-6">
                <Button variant="outline" className="flex-1 h-12 rounded-xl text-sm font-semibold" onClick={() => setStep(1)}>
                  Cancel
                </Button>
                <Button className="flex-1 h-12 rounded-xl text-sm font-semibold shadow-sm shadow-primary/20" onClick={() => {
                  if (!selectedResumeId && resumes.length > 0) {
                    toast.error("Please select a resume to proceed");
                    return;
                  }
                  setStep(step + 1);
                }}>
                  Continue Application <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Questions Step */}
          {hasQuestions && step === questionsStepIdx && !submitted && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Recruiter Questions</h3>
                </div>
                <p className="text-sm text-muted-foreground">Please provide these final details to complete your application for {jobDetails.employer?.company_name}.</p>

                <div className="space-y-6 mt-4">
                  {jobDetails.cover_letter_question_id && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Cover Letter / Motivation <span className="text-red-500 ml-1">*</span></label>
                      <div className="rounded-xl border border-border bg-background px-4 py-3 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                        <textarea
                          value={questionAnswers[jobDetails.cover_letter_question_id] || ""}
                          onChange={(e) => setQuestionAnswers({ ...questionAnswers, [jobDetails.cover_letter_question_id!]: e.target.value })}
                          className="w-full bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/30 min-h-[120px] resize-none"
                          placeholder="Why are you applying for this position? How do your skills match our requirements?"
                        />
                      </div>
                    </div>
                  )}

                  {jobDetails.questions?.map((q) => {
                    const isBoolean = q.question_type === "boolean";
                    const isNumeric = q.question_type === "numeric";

                    return (
                      <div key={q.id} className="space-y-3">
                        <label className="text-sm font-medium text-slate-700">
                          {q.question} <span className="text-red-500 ml-1">*</span>
                        </label>

                        {isBoolean ? (
                          <div className="flex gap-4 ml-1">
                            {["Yes", "No"].map((opt) => (
                              <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                                <div
                                  onClick={() => setQuestionAnswers({ ...questionAnswers, [q.id]: opt.toLowerCase() })}
                                  className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${questionAnswers[q.id] === opt.toLowerCase()
                                      ? "border-primary bg-primary"
                                      : "border-slate-200 group-hover:border-primary/40"
                                    }`}
                                >
                                  {questionAnswers[q.id] === opt.toLowerCase() && <div className="h-2 w-2 rounded-full bg-white animate-in zoom-in-50 duration-200" />}
                                </div>
                                <span className={`text-sm ${questionAnswers[q.id] === opt.toLowerCase() ? "text-primary font-medium" : "text-slate-500"}`}>{opt}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-border bg-background px-4 py-3 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                            {isNumeric ? (
                              <input
                                type="number"
                                min="0"
                                value={questionAnswers[q.id] || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === "" || parseFloat(val) >= 0) {
                                    setQuestionAnswers({ ...questionAnswers, [q.id]: val });
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "-" || e.key === "e") e.preventDefault();
                                }}
                                className="w-full bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/30"
                                placeholder="Enter years (0 or more)..."
                              />
                            ) : (
                              <textarea
                                value={questionAnswers[q.id] || ""}
                                onChange={(e) => setQuestionAnswers({ ...questionAnswers, [q.id]: e.target.value })}
                                className="w-full bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/30 min-h-[80px] resize-none"
                                placeholder="Provide your answer here..."
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Legacy Support for screening_questions */}
                  {jobDetails.screening_questions?.map((sq) => (
                    <div key={sq.id} className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">{sq.question} <span className="text-red-500 ml-1">*</span></label>
                      <div className="rounded-xl border border-border bg-background px-4 py-3 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                        <textarea
                          value={questionAnswers[sq.id] || ""}
                          onChange={(e) => setQuestionAnswers({ ...questionAnswers, [sq.id]: e.target.value })}
                          className="w-full bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/30 min-h-[80px] resize-none"
                          placeholder="Provide your answer here..."
                        />
                      </div>
                    </div>
                  ))}

                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <Button variant="outline" className="flex-1 h-12 rounded-xl text-sm font-semibold" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
                <Button className="flex-1 h-12 rounded-xl text-sm font-semibold shadow-sm shadow-primary/20" onClick={() => {
                  // Mandatory Validation for all questions
                  if (jobDetails.cover_letter_question_id && !questionAnswers[jobDetails.cover_letter_question_id]?.trim()) {
                    toast.error("Please provide your Cover Letter/Motivation.");
                    return;
                  }

                  const hasIncomplete = jobDetails.questions?.some(q => !questionAnswers[q.id]?.trim()) ||
                    jobDetails.screening_questions?.some(sq => !questionAnswers[sq.id]?.trim());

                  if (hasIncomplete) {
                    toast.error("Please answer all recruiter questions to proceed.");
                    return;
                  }

                  setStep(step + 1);
                }}>
                  Continue Application <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Submit/Review Step */}
          {step === submitStepIdx && !submitted && (
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
                    {
                      label: "Selected Resume",
                      value: (function () {
                        const rid = String(selectedResumeId);
                        let title = "Not selected";
                        let url = "";

                        if (rid.startsWith("cv-")) {
                          const id = rid.replace("cv-", "");
                          const cv = generatedResumes.find(cv => String(cv.id) === id);
                          title = cv?.title || "AI Generated Resume";
                          url = cv?.pdf_path || "";
                        } else {
                          const r = resumes.find(r => String(r.id) === rid);
                          title = r?.title || r?.file_name || "Uploaded Resume";
                          url = r?.url || "";
                        }
                        if (!rid) return "No resume linked";

                        return (
                          <div className="flex items-center gap-2">
                            <span className="truncate">{title}</span>
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePreviewResume(url); }}
                              className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-medium hover:bg-indigo-100 transition-all border border-indigo-100"
                            >
                              View File
                            </button>
                          </div>
                        );
                      })()
                    },
                  ].map((item) => (
                    <div key={item.label} className="min-w-0 group">
                      <span className="block text-[10px] font-medium text-slate-400 mb-1 group-hover:text-primary transition-colors">{item.label}</span>
                      <div className="block font-semibold text-foreground text-sm md:text-base">{item.value}</div>
                    </div>
                  ))}
                </div>

                {candidate.skills.length > 0 && (
                  <div className="pt-2">
                    <span className="block text-[10px] font-medium text-slate-400 mb-2">Skills Expertise</span>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill: any, idx: number) => {
                        const skillName = typeof skill === 'object' ? (skill.name || skill.title || "Skill") : String(skill);
                        return (
                          <span key={idx} className="px-3 py-1 rounded-lg bg-indigo-50/50 text-indigo-600 text-[11px] font-medium border border-indigo-100 shadow-sm capitalize">
                            {skillName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {candidate.bio && (
                  <div className="pt-6 border-t border-border/50 space-y-5">
                    <div className="bg-background/50 rounded-xl p-4 border border-border/30">
                      <span className="block text-[10px] font-medium text-slate-400 mb-2">Professional Bio</span>
                      <div
                        className="text-sm text-muted-foreground leading-relaxed rich-text"
                        dangerouslySetInnerHTML={{ __html: candidate.bio.replace(/\n/g, '<br/>') }}
                      />
                    </div>
                  </div>
                )}

                {candidate.educations.length > 0 && (
                  <div className="pt-6 border-t border-border/50">
                    <span className="block text-[10px] font-medium text-slate-400 mb-3 flex items-center gap-2">
                      <GraduationCap className="w-3 h-3" /> Education History
                    </span>
                    <div className="space-y-3">
                      {candidate.educations.map((edu: any, idx: number) => (
                        <div key={idx} className="bg-background/40 rounded-xl p-3 border border-border/20">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{edu.degree} in {edu.field_of_study}</p>
                              <p className="text-xs text-muted-foreground font-medium">{edu.institution}</p>
                            </div>
                            <span className="text-[10px] font-medium text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full">
                              {edu.start_year} — {edu.is_current ? "Present" : edu.end_year}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {candidate.experiences.length > 0 && (
                  <div className="pt-6 border-t border-border/50">
                    <span className="block text-[10px] font-medium text-slate-400 mb-3 flex items-center gap-2">
                      <Briefcase className="w-3 h-3" /> Professional Experience
                    </span>
                    <div className="space-y-3">
                      {candidate.experiences.map((exp: any, idx: number) => (
                        <div key={idx} className="bg-background/40 rounded-xl p-3 border border-border/20">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{exp.job_title}</p>
                              <p className="text-xs text-muted-foreground font-medium">{exp.company_name}</p>
                              {exp.description && (
                                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{exp.description}</p>
                              )}
                            </div>
                            <span className="text-[10px] font-medium text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full">
                              {new Date(exp.start_date).getFullYear()} — {exp.is_current ? "Present" : (exp.end_date ? new Date(exp.end_date).getFullYear() : "Present")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hasQuestions && Object.values(questionAnswers).some(a => a.trim()) && (
                  <div className="pt-6 border-t border-border/50">
                    <span className="block text-[10px] font-medium text-slate-400 mb-3 flex items-center gap-2">
                      Recruiter Questions Review
                    </span>
                    <div className="space-y-4">
                      {Object.entries(questionAnswers).map(([qid, ans]) => {
                        const q = jobDetails.questions?.find(sq => String(sq.id) === qid) ||
                          jobDetails.screening_questions?.find(sq => String(sq.id) === qid);
                        const label = q ? q.question : (parseInt(qid) === jobDetails.cover_letter_question_id ? "Motivation / Cover Letter" : "Question");
                        if (!ans.trim()) return null;
                        return (
                          <div key={qid} className="bg-background/40 rounded-xl p-3 border border-border/20">
                            <p className="text-[10px] font-medium text-primary/60 tracking-tight mb-1">{label}</p>
                            <p className="text-sm text-foreground whitespace-pre-wrap">{ans === "yes" ? "Yes" : (ans === "no" ? "No" : ans)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-6">
                <Button variant="outline" className="flex-1 h-12 rounded-xl text-sm font-semibold" onClick={() => setStep(step - 1)}>
                  Cancel
                </Button>
                <Button variant="hero" className="flex-1 h-12 rounded-xl text-sm font-semibold shadow-sm shadow-primary/20" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  {isSubmitting ? "Submitting..." : "Submit Application"}
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

      {/* Template Selection Overlay */}
      {showTemplateOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-primary animate-pulse" />
                  Generate AI Enhanced CV
                </h2>
                <p className="text-slate-500 font-medium text-sm mt-1">Select a template below to proceed with AI generation.</p>
              </div>
              <button onClick={() => setShowTemplateOverlay(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cvTemplates.map((template) => {
                  const isSelected = selectedTemplate === String(template.id);
                  return (
                    <div
                      key={template.id}
                      className={`group relative rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${isSelected ? "border-primary shadow-lg shadow-primary/20 scale-[1.02]" : "border-slate-100 hover:border-primary/30 hover:shadow-md"
                        }`}
                      onClick={() => setSelectedTemplate(String(template.id))}
                    >
                      <div className="aspect-[3/4] p-2 bg-slate-50 group-hover:bg-primary/5 transition-colors overflow-hidden">
                        {template.preview_image ? (
                          <img
                            src={template.preview_image}
                            alt={template.name}
                            className="w-full h-full object-cover rounded-lg shadow-sm border border-slate-200"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300">
                            <FileText className="w-10 h-10" />
                            <span className="text-[10px] font-medium uppercase tracking-widest ">No Preview</span>
                          </div>
                        )}
                      </div>
                      {selectedTemplate === String(template.id) && (
                        <div className="absolute top-3 right-3 bg-primary text-white p-1.5 rounded-full shadow-lg z-10 animate-in zoom-in duration-300">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                      <div className="p-4 flex items-center justify-between bg-white relative">
                        <div className="min-w-0">
                          <span className={`text-[9px] font-black uppercase tracking-[1.5px] block mb-1.5 transition-colors duration-300 ${isSelected ? 'text-primary' : 'text-slate-400'}`}>
                            {isSelected ? 'Selected Style' : 'Select Resume'}
                          </span>
                          <span className="text-xs font-bold text-slate-700 truncate block">{template.name}</span>
                        </div>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isSelected ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/25' : 'border-slate-200 bg-white text-slate-100 group-hover:border-primary/30'}`}>
                          <Check className={`w-3.5 h-3.5 stroke-[3] transition-all duration-300 ${isSelected ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-12 flex flex-col items-center justify-center gap-4">
                <Button
                  variant="hero"
                  className="min-w-[280px] h-12 rounded-2xl text-xs font-black uppercase tracking-[2px] shadow-xl shadow-primary/20 disabled:opacity-50 transition-all active:scale-95"
                  onClick={() => selectedTemplate && handleGenerateResume(selectedTemplate)}
                  disabled={!selectedTemplate || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Crafting your Resume...
                    </>
                  ) : (
                    <>Generate My CV</>
                  )}
                </Button>
                {selectedTemplate && (
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2">
                    Selected: {cvTemplates.find(t => String(t.id) === selectedTemplate)?.name || selectedTemplate}
                  </p>
                )}
              </div>
            </div>

            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Selected Style</p>
                <p className="text-sm font-bold text-slate-900">{cvTemplates.find(t => String(t.id) === selectedTemplate)?.name || "Please select a template"}</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 sm:flex-none h-11 px-6 rounded-xl" onClick={() => setShowTemplateOverlay(false)}>Cancel</Button>
                <Button
                  variant="hero"
                  className="flex-1 sm:flex-none h-11 px-8 rounded-xl shadow-xl shadow-primary/20"
                  disabled={!selectedTemplate || isGenerating}
                  onClick={() => selectedTemplate && handleGenerateResume(selectedTemplate)}
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {isGenerating ? "Analyzing JD & Generating..." : "Generate My CV"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Resume Preview Overlay */}
      {showResumePreview && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Resume Preview
                </h2>
              </div>
              <button onClick={() => setShowResumePreview(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden bg-slate-100 relative">
              {previewUrl ? (
                <iframe
                  src={`/api/files/preview?url=${encodeURIComponent(previewUrl)}#toolbar=0`}
                  className="w-full h-full border-none"
                  title="Resume Content"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="font-bold text-sm">Loading document...</p>
                </div>
              )}
            </div>

            <div className="px-8 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <Button className="rounded-xl px-8" onClick={() => setShowResumePreview(false)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
