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
  Wand2,
  Loader2,
  Plus,
  Star,
} from "lucide-react";
import { getJobBySlug } from "@/lib/jobs/api";
import { useApplications } from "@/hooks/useApplications";
import { useResumes } from "@/hooks/useResumes";
import { Job } from "@/types/homepage";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";

const STEPS = ["Review Job", "Your Details", "Resume", "Cover Letter", "Submit"];

export default function ApplyJobPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { isLoggedIn, user } = useClientSession();
  const { apply } = useApplications();
  const { resumes } = useResumes({ enabled: isLoggedIn });

  const [step, setStep] = useState(0);
  const [candidate, setCandidate] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    location: "",
  });

  useEffect(() => {
    if (user) {
      setCandidate({
        name: user.name || "",
        email: user.email || "",
        phone: "",
        experience: "",
        location: "",
      });
    }
  }, [user]);

  const [submitted, setSubmitted] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | number>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJob() {
      if (!slug) return;
      try {
        const found = await getJobBySlug(slug);
        setJob(found);
      } catch (error) {
        //console.error("Error loading job for application:", error);
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [slug]);

  useEffect(() => {
    if (!resumes.length) return;
    const defaultResume = resumes.find((r) => r.is_default);
    if (defaultResume) setSelectedResumeId(defaultResume.id);
    else setSelectedResumeId(resumes[0].id);
  }, [resumes]);

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.push("/auth/login");
      } else if (user?.role === "employer") {
        router.back();
      }
    }
  }, [loading, isLoggedIn, user, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading job details...</p>
        </div>
      </div>
    );
  }

  const jobDetails = job || {
    id: 0,
    title: "Job Position",
    employer: { company_name: "Institute", company_logo: "" },
    location: "Location",
    salary_min: "As per industry",
    salary_max: "As per industry",
    experience_required: 0,
    job_type: "Full Time",
    description: "Please apply for this teaching position."
  };

  const handleSubmit = async () => {
    if (!jobDetails.id) return;
    try {
      setIsSubmitting(true);
      const answers: { question_id: number; candidate_answer: string }[] = [];
      if (jobDetails.cover_letter_question_id != null && coverLetter.trim()) {
        answers.push({
          question_id: jobDetails.cover_letter_question_id,
          candidate_answer: coverLetter,
        });
      }
      await apply(jobDetails.id, answers);

      setSubmitted(true);
      toast.success("Application Submitted Successfully");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to submit application.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRewriteWithAI = () => {
    if (!coverLetter.trim()) return;
    setIsRewriting(true);
    setTimeout(() => {
      const improved = "AI suggested rewrite of your cover letter based on your specific skills and job requirements.";
      setAiSuggestion(improved);
      setIsRewriting(false);
      toast.success("AI suggestion ready");
    }, 2000);
  };

  const handleGenerateWithAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated = `Dear Hiring Manager,\n\nI am writing to express my interest in the ${jobDetails.title} position at your institution. With my background in education and commitment to student development, I am confident in my ability to contribute effectively.\n\nBest regards,\n${candidate.name}`;
      setCoverLetter(generated);
      setIsGenerating(false);
      toast.success("Cover letter generated");
    }, 2500);
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

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">
            {submitted ? "Application Complete" : "Apply for Position"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {jobDetails.title} at {jobDetails.employer?.company_name}
          </p>
        </div>

        {!submitted && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((label, i) => {
                let stepClass = "bg-muted text-muted-foreground";
                if (i < step) {
                  stepClass = "bg-accent text-accent-foreground";
                } else if (i === step) {
                  stepClass = "bg-primary text-primary-foreground";
                }

                return (
                  <div key={label} className="flex items-center gap-2 flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-colors ${stepClass}`}
                      >
                        {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                      </div>
                      <span className={`mt-1.5 text-[10px] font-medium hidden sm:block ${i === step ? "text-primary" : "text-muted-foreground"}`}>
                        {label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-0.5 flex-1 rounded-full mx-1 mb-5 ${i < step ? "bg-accent" : "bg-muted"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
          {step === 0 && !submitted && (
            <div className="space-y-5">
              <div className="rounded-xl border border-border bg-muted/30 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-display font-bold text-xl overflow-hidden">
                    {jobDetails.employer?.company_logo ? (
                      <img src={jobDetails.employer.company_logo} alt="Logo" className="h-full w-full object-contain" />
                    ) : (
                      (jobDetails.employer?.company_name || "J")[0]
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{jobDetails.title}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" /> {jobDetails.employer?.company_name}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
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
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">{jobDetails.description}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => router.back()}>Cancel</Button>
                <Button className="flex-1" onClick={() => setStep(1)}>
                  Continue Application <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 1 && !submitted && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Review and update your details below.</p>
              {[
                { key: "name" as const, label: "Full Name", icon: User },
                { key: "email" as const, label: "Email Address", icon: Mail },
                { key: "phone" as const, label: "Phone Number", icon: Phone },
                { key: "experience" as const, label: "Years of Experience", icon: Clock },
                { key: "location" as const, label: "Current Location", icon: MapPin },
              ].map((field) => (
                <div key={field.key}>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">{field.label}</label>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5">
                    <field.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      type="text"
                      value={candidate[field.key]}
                      onChange={(e) => setCandidate({ ...candidate, [field.key]: e.target.value })}
                      className="w-full bg-transparent text-sm text-foreground focus:outline-none"
                    />
                  </div>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button className="flex-1" onClick={() => setStep(2)}>
                  Continue <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && !submitted && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">Select a resume to submit.</p>
              {resumes.length > 0 ? (
                <div className="space-y-2.5">
                  {resumes.map((resume) => (
                    <label
                      key={resume.id}
                      className={`flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-colors ${selectedResumeId === resume.id
                          ? "border-primary bg-primary/3"
                          : "border-border bg-card hover:bg-muted/30"
                        }`}
                    >
                      <input
                        type="radio"
                        checked={selectedResumeId === resume.id}
                        onChange={() => setSelectedResumeId(resume.id)}
                        className="sr-only"
                      />
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${selectedResumeId === resume.id ? 'bg-primary/20' : 'bg-muted'}`}>
                        <FileText className={`h-5 w-5 ${selectedResumeId === resume.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">{resume.title ?? resume.file_name ?? "—"}</p>
                          {resume.is_default && <Star className="h-3 w-3 fill-primary text-primary" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          {(resume.file_name ?? "").split(".").pop() ?? "—"} · {resume.size ?? "—"}
                        </p>
                      </div>
                      {selectedResumeId === resume.id && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-10 text-center">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground/30" />
                  <p className="mt-2 text-sm text-muted-foreground">No resumes found.</p>
                </div>
              )}

              <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/jobseeker/resume")}>
                <Plus className="mr-1 h-4 w-4" /> Go to Resume Management
              </Button>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button className="flex-1" onClick={() => {
                  if (!selectedResumeId && resumes.length > 0) {
                    toast.error("Please select a resume");
                    return;
                  }
                  setStep(3);
                }}>
                  Continue <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && !submitted && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRewriteWithAI}
                  disabled={isRewriting || !coverLetter.trim()}
                  className="gap-1.5 text-xs text-primary border-primary/30"
                >
                  {isRewriting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />} Rewrite with AI
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateWithAI}
                  disabled={isGenerating}
                  className="gap-1.5 text-xs text-accent border-accent/30"
                >
                  {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Generate with AI
                </Button>
              </div>

              {aiSuggestion && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div className="text-sm text-foreground whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                    {aiSuggestion}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => { setCoverLetter(aiSuggestion); setAiSuggestion(null); toast.success("Applied AI version"); }}>Apply</Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setAiSuggestion(null)}>Keep Original</Button>
                  </div>
                </div>
              ) || (
                  <div>
                    <label htmlFor="cover-letter" className="mb-1.5 block text-xs font-medium text-foreground">Cover Letter</label>
                    <textarea
                      id="cover-letter"
                      value={coverLetter}
                      onChange={(e) => { if (e.target.value.length <= 1500) setCoverLetter(e.target.value); }}
                      placeholder="Tell the employer why you're a great fit..."
                      rows={8}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none resize-none"
                    />
                    <p className="mt-1 text-right text-[10px] text-muted-foreground">{coverLetter.length} / 1500</p>
                  </div>
                )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button className="flex-1" onClick={() => setStep(4)}>
                  Review <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && !submitted && (
            <div className="space-y-5">
              <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-3">
                {[
                  { label: "Job", value: jobDetails.title },
                  { label: "Company", value: jobDetails.employer?.company_name },
                  { label: "Candidate", value: candidate.name },
                  { label: "Resume", value: resumes.find((r) => r.id === selectedResumeId)?.title ?? resumes.find((r) => r.id === selectedResumeId)?.file_name ?? "Not selected" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground text-right truncate max-w-[60%]">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button variant="hero" className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4" />}
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
    </div>
  );
}
