"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  MapPin,
  Briefcase,
  GraduationCap,
  IndianRupee,
  Building2,
  CheckCircle2,
  FileText,
  Upload,
  Eye,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  User,
  Mail,
  Phone,
  Clock,
  LogIn,
  AlertCircle,
} from "lucide-react";

interface ApplyModalProps {
  open: boolean;
  onClose: () => void;
  job: {
    title: string;
    company: string;
    location: string;
    salary: string;
    experience: string;
    type: string;
    description?: string;
    responsibilities?: string[];
    requirements?: string[];
  };
}

const STEPS = ["Review Job", "Your Details", "Resume", "Cover Letter", "Submit"];

const ApplyModal = ({ open, onClose, job }: ApplyModalProps) => {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [step, setStep] = useState(0);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

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
        name: user.full_name || user.name || "",
        email: user.email || "",
        phone: "",
        experience: "",
        location: "",
      });
    }
  }, [user]);

  if (!open) return null;

  const handleClose = () => {
    setStep(0);
    setSubmitted(false);
    setShowResumePreview(false);
    setCoverLetter("");
    onClose();
  };

  const handleSubmit = () => {
    const application = {
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      resume: "Resume.pdf",
      coverLetter: coverLetter,
      jobTitle: job.title,
      company: job.company,
      appliedAt: new Date().toISOString(),
    };
    
    // In a real app, this would be a POST request to your backend
    const existing = JSON.parse(localStorage.getItem("teachnow_applications") || "[]");
    existing.push(application);
    localStorage.setItem("teachnow_applications", JSON.stringify(existing));

    setSubmitted(true);
    toast.success("Application Submitted Successfully", {
      description: `Your application for ${job.title} at ${job.company} has been submitted.`,
    });
  };

  // Not logged in
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
          type="button"
          className="absolute inset-0 w-full cursor-default border-none bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
          aria-label="Close modal"
        />
        <div className="relative w-full max-w-md animate-fade-in rounded-2xl border border-border bg-card shadow-2xl p-6">
          <button onClick={handleClose} className="absolute right-4 top-4 rounded-lg p-2 hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <LogIn className="h-8 w-8" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">Login Required</h3>
            <p className="mt-2 text-sm text-muted-foreground">Login required to apply for jobs.</p>
            <div className="mt-6 flex flex-col gap-3">
              <Button variant="hero" className="w-full" onClick={() => { handleClose(); router.push("/auth/login"); }}>
                Login as Job Seeker
              </Button>
              <Button variant="outline" className="w-full" onClick={() => { handleClose(); router.push("/auth/register"); }}>
                Register as Job Seeker
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Employer trying to apply
  if (user?.role === "employer") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
          type="button"
          className="absolute inset-0 w-full cursor-default border-none bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
          aria-label="Close modal"
        />
        <div className="relative w-full max-w-md animate-fade-in rounded-2xl border border-border bg-card shadow-2xl p-6">
          <button onClick={handleClose} className="absolute right-4 top-4 rounded-lg p-2 hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">Access Restricted</h3>
            <p className="mt-2 text-sm text-muted-foreground">Only Job Seekers can apply for jobs.</p>
            <div className="mt-6">
              <Button variant="outline" className="w-full" onClick={() => { handleClose(); router.push("/auth/login"); }}>
                Switch to Job Seeker Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 w-full cursor-default border-none bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-label="Close modal"
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4 rounded-t-2xl">
          <h2 className="font-display text-lg font-bold text-foreground">
            {submitted ? "Application Complete" : "Apply for Position"}
          </h2>
          <button onClick={handleClose} className="rounded-lg p-2 hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Step Indicator */}
        {!submitted && (
          <div className="px-6 pt-5">
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
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${stepClass}`}
                      >
                        {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                      </div>
                      <span className={`mt-1 text-[10px] font-medium ${i === step ? "text-primary" : "text-muted-foreground"}`}>
                        {label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-0.5 flex-1 rounded-full mx-1 mb-4 ${i < step ? "bg-accent" : "bg-muted"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Step 1: Review Job */}
          {step === 0 && !submitted && (
            <div className="animate-fade-in space-y-5">
              <div className="rounded-xl border border-border bg-muted/30 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-display font-bold text-xl">
                    {job.company[0]}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{job.title}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" /> {job.company}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    { icon: MapPin, label: "Location", value: job.location },
                    { icon: IndianRupee, label: "Salary", value: job.salary },
                    { icon: GraduationCap, label: "Experience", value: job.experience },
                    { icon: Briefcase, label: "Type", value: job.type },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-sm">
                      <item.icon className="h-4 w-4 text-primary/60" />
                      <div>
                        <span className="text-muted-foreground">{item.label}: </span>
                        <span className="font-medium text-foreground">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {job.description && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Job Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{job.description}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
                <Button className="flex-1" onClick={() => setStep(1)}>
                  Continue Application <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Candidate Details */}
          {step === 1 && !submitted && (
            <div className="animate-fade-in space-y-4">
              <p className="text-sm text-muted-foreground">Review and update your details below.</p>

              {[
                { key: "name" as const, label: "Full Name", icon: User, placeholder: "Your full name" },
                { key: "email" as const, label: "Email Address", icon: Mail, placeholder: "your@email.com" },
                { key: "phone" as const, label: "Phone Number", icon: Phone, placeholder: "+91 XXXXXXXXXX" },
                { key: "experience" as const, label: "Years of Experience", icon: Clock, placeholder: "e.g. 4" },
                { key: "location" as const, label: "Current Location", icon: MapPin, placeholder: "Your city" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">{field.label}</label>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5">
                    <field.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      type="text"
                      value={candidate[field.key]}
                      onChange={(e) => setCandidate({ ...candidate, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
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

          {/* Step 3: Resume */}
          {step === 2 && !submitted && (
            <div className="animate-fade-in space-y-5">
              <p className="text-sm text-muted-foreground">Your resume is ready to be submitted.</p>

              <div className="rounded-xl border border-border bg-muted/30 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">Resume.pdf</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Application will use your primary resume.</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowResumePreview(true)}>
                    <Eye className="mr-1 h-3.5 w-3.5" /> Preview Resume
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-1 h-3.5 w-3.5" /> Replace Resume
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button className="flex-1" onClick={() => setStep(3)}>
                  Continue <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Cover Letter */}
          {step === 3 && !submitted && (
            <div className="animate-fade-in space-y-4">
              <p className="text-sm text-muted-foreground">Write a short message explaining why you are a good fit for this teaching role.</p>

              <div>
                <label htmlFor="cover-letter" className="mb-1.5 block text-sm font-medium text-foreground">Cover Letter</label>
                <textarea
                  id="cover-letter"
                  value={coverLetter}
                  onChange={(e) => { if (e.target.value.length <= 1500) setCoverLetter(e.target.value); }}
                  placeholder="Why are you a good fit?"
                  rows={6}
                  className="flex w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
                <p className="mt-1.5 text-xs text-muted-foreground text-right">{coverLetter.length} / 1500 characters</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button className="flex-1" onClick={() => setStep(4)}>
                  Review & Submit <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Confirm & Submit */}
          {step === 4 && !submitted && (
            <div className="animate-fade-in space-y-5">
              <p className="text-sm text-muted-foreground">Please review your application before submitting.</p>

              <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-3">
                {[
                  { label: "Job Title", value: job.title },
                  { label: "Company", value: job.company },
                  { label: "Candidate", value: candidate.name },
                  { label: "Email", value: candidate.email },
                  { label: "Phone", value: candidate.phone },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button variant="hero" className="flex-1" onClick={handleSubmit}>
                  <Sparkles className="mr-1 h-4 w-4" /> Submit Application
                </Button>
              </div>
            </div>
          )}

          {/* Success State */}
          {submitted && (
            <div className="animate-fade-in text-center py-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-accent mb-5">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                Application Submitted!
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                Your application for <span className="font-semibold text-foreground">{job.title}</span> at{" "}
                <span className="font-semibold text-foreground">{job.company}</span> has been successfully submitted.
              </p>
              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { handleClose(); router.push("/dashboard/applications"); }}
                >
                  View My Applications
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => { handleClose(); router.push("/jobs"); }}
                >
                  Browse More Jobs
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resume Preview Modal */}
      {showResumePreview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 w-full cursor-default border-none bg-black/50"
            onClick={() => setShowResumePreview(false)}
            aria-label="Close preview"
          />
          <div className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto animate-fade-in rounded-2xl border border-border bg-card shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-bold text-foreground">Resume Preview</h3>
              <button onClick={() => setShowResumePreview(false)} className="rounded-lg p-2 hover:bg-muted">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="text-center border-b border-border pb-4">
                <h4 className="font-display text-xl font-bold text-foreground">{candidate.name || "Candidate Name"}</h4>
                <p className="text-sm text-muted-foreground mt-1">{candidate.email || "Email Address"}</p>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-primary mb-2">Education & Experience</h5>
                <p className="text-sm text-muted-foreground italic">Resume details will be loaded from your profile.</p>
              </div>
            </div>
            <Button variant="outline" className="mt-5 w-full" onClick={() => setShowResumePreview(false)}>
              Close Preview
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyModal;
