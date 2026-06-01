"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Briefcase,
  Loader2,
  Save,
  Trash2,
  DollarSign,
  FileText,
  Eye,
  Plus,
  Target,
  HelpCircle,
  MapPin,
  Clock,
  Users,
  User,
  Folder,
  Tag,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import { TipTapEditor } from "@/shared/ui/TipTapEditor/TipTapEditor";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/shared/ui/DatePicker/DatePicker";
import { format } from "date-fns";

interface Question {
  question: string;
  question_type: "boolean" | "numeric" | "text";
  recruiter_answer: string;
}

interface PostJobClientProps {
  metadata: {
    categories: Array<{ id: number; name: string }>;
    locations: Array<{ id: number; name: string }>;
  };
  initialData?: {
    job: any;
    questions?: Question[];
  };
  isEdit?: boolean;
  userRole?: string;
  profile?: any;

  session?: any;
}

export default function PostJobClient({
  metadata,
  initialData,
  isEdit = false,
  userRole = "employer",
  profile,

  session
}: PostJobClientProps) {
  const router = useRouter();
  const job = isEdit ? initialData?.job : initialData;
  let initialQuestions = isEdit ? (initialData?.questions || job?.questions || []) : [];

  // If top-level questions is empty but job has questions, prefer job.questions
  if (isEdit && initialQuestions.length === 0 && job?.questions?.length > 0) {
    initialQuestions = job.questions;
  }

  if (isEdit) {
    console.log("[PostJobClient] Full initialData for debug:", JSON.stringify(initialData, null, 2));
  }
  console.log(`[PostJobClient] isEdit: ${isEdit}, jobTitle: ${job?.title}, questionsCount: ${initialQuestions?.length || 0}`);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [limitReachedField, setLimitReachedField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: job?.title || "",
    category_id: job?.category_id || "",
    job_type: job?.job_type || "",
    location: job?.location || "",
    experience_type: job?.experience_type || "",
    experience_required: job?.experience_required || "",
    vacancies: job?.vacancies || 1,
    gender: job?.gender || "",
    salary_min: job?.salary_min != null ? job.salary_min.toString().split('.')[0] : "",
    salary_max: job?.salary_max != null ? job.salary_max.toString().split('.')[0] : "",
    education_qualification: job?.education_qualification || "",
    skills: Array.isArray(job?.skills) ? job.skills : [],
    benefits: Array.isArray(job?.benefits) ? job.benefits : [],
    meta_title: job?.meta_title || "",
    meta_description: job?.meta_description || "",
    meta_keywords: job?.meta_keywords || "",
    keywords: job?.keywords || job?.keyword || "",
  });

  const [description, setDescription] = useState(job?.description || "");
  const [questions, setQuestions] = useState<Question[]>(
    (Array.isArray(initialQuestions) ? initialQuestions : [])
      .filter((q: any) => q != null)
      .map((q: any) => ({
        ...q,
        question: q.question || "",
        recruiter_answer: q.recruiter_answer || "",
        question_type: q.question_type || "boolean"
      }))
  );
  const [deadline, setDeadline] = useState<Date | undefined>(
    job?.deadline || job?.application_deadline ? new Date(job.deadline || job.application_deadline) : undefined
  );
  const [salaryUndisclosed, setSalaryUndisclosed] = useState(!job?.salary_min && !job?.salary_max && isEdit);

  const updateField = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRewriteJD = async () => {
    // Check if we have at least a title if description is empty
    if ((!description || description.replace(/<[^>]*>/g, '').trim().length < 10) && !formData.title?.toString().trim()) {
      toast.warning("Please provide a Job Title first so AI can generate a description.", {
        style: {
          background: '#FFFAF0',
          color: '#744210',
          border: '1px solid #FBD38D',
          fontWeight: '600',
          fontSize: '13px'
        }
      });
      return;
    }

    setIsRewriting(true);
    const toastId = toast.loading(description ? "Optimizing with AI..." : "Generating with AI...");

    try {
      // Use the appropriate endpoint based on userRole
      const endpoint = `${userRole}/jd-rewrite`;

      const result = await dashboardServerFetch(endpoint, {
        method: "POST",
        data: {
          data: {
            ...formData,
            description: description || ""
          }
        }
      });

      if (result.status && result.output?.job_description) {
        // Immediate update of description state
        setDescription(result.output.job_description);
        // Increment key to force TipTapEditor to re-initialize with new content immediately
        setEditorKey(prev => prev + 1);

        toast.dismiss(toastId);
        toast.success(description ? "Job description optimized!" : "Job description generated!", {
          style: {
            background: '#F0FFF4',
            color: '#22543D',
            border: '1px solid #9AE6B4',
            fontWeight: '600',
            fontSize: '13px'
          }
        });
      } else {
        toast.dismiss(toastId);
        toast.error(result.message || "Failed to process JD.");
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("An error occurred during AI processing.");
    } finally {
      setIsRewriting(false);
    }
  };

  const steps = [
    { id: 1, name: "Job Details", icon: Briefcase },
    { id: 2, name: "Job Description", icon: FileText },
    { id: 3, name: "Questions", icon: Target },
    { id: 4, name: "Salary", icon: DollarSign },
    { id: 5, name: "Preview & Publish", icon: Eye },
  ];

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title?.toString().trim()) {
          newErrors.title = "Please provide a Job Title to continue";
        } else if (formData.title.length < 7) {
          newErrors.title = "Job Title is too short (minimum 7 characters required)";
        } else if (formData.title.length > 50) {
          newErrors.title = "Job Title is too long (maximum 50 characters allowed)";
        }
        if (!formData.category_id) newErrors.category_id = "Please select a Subject or Category for this job";
        if (!formData.job_type) newErrors.job_type = "Please select a Job Type (Full-time or Part-time)";
        if (!formData.location) newErrors.location = "Please select a City location for this job";

        if (!formData.experience_required?.toString().trim()) newErrors.experience_required = "Please specify the Experience Required for this role";
        if (!formData.experience_type) newErrors.experience_type = "Please select whether the role is for Freshers or Experienced candidates";
        if (!formData.gender) newErrors.gender = "Please specify a Gender Preference (or Select Any / Both)";
        break;
      case 2:
        const jdLength = description.replace(/<[^>]*>/g, '').trim().length;
        if (!description || jdLength < 50)
          newErrors.description = "Job Description is too short. Please provide at least 50 characters to help candidates.";
        if (jdLength > 3000)
          newErrors.description = "Job Description is too long. Please keep it under 3000 characters.";
        break;
      case 4:
        if (!salaryUndisclosed) {
          if (!formData.salary_min) newErrors.salary_min = "Please enter the Minimum Salary";
          if (!formData.salary_max) newErrors.salary_max = "Please enter the Maximum Salary";
          if (formData.salary_min && formData.salary_max && Number(formData.salary_min) > Number(formData.salary_max))
            newErrors.salary_range = "Maximum salary must be greater than or equal to the Minimum salary";
        }
        if (!deadline) {
          newErrors.deadline = "Please set an Application Deadline for this job";
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (deadline < today) {
            newErrors.deadline = "The Application Deadline cannot be a date in the past";
          }
        }
        if (!formData.vacancies || Number(formData.vacancies) <= 0) newErrors.vacancies = "Please specify how many vacancies are available";
        break;
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    const errorKeys = Object.keys(stepErrors);

    if (errorKeys.length > 0) {
      toast.warning(stepErrors[errorKeys[0]], {
        style: {
          background: '#FFFAF0',
          color: '#744210',
          border: '1px solid #FBD38D',
          fontWeight: '600',
          fontSize: '13px'
        },
        duration: 3000
      });
      return;
    }

    setErrors({});
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (isEdit) {
      const jobId = job?.id || job?.job_id;
      if (jobId) {
        router.push(`/dashboard/${userRole}/jobs/view/${jobId}`);
      } else {
        router.push(`/dashboard/${userRole}/jobs`);
      }
    } else {
      router.push(`/dashboard/${userRole}`);
    }
  };

  const handleSubmit = async () => {
    const stepErrors = validateStep(4);
    const errorKeys = Object.keys(stepErrors);

    if (errorKeys.length > 0) {
      toast.warning(stepErrors[errorKeys[0]], {
        style: {
          background: '#FFFAF0',
          color: '#744210',
          border: '1px solid #FBD38D',
          fontWeight: '600',
          fontSize: '13px'
        },
        duration: 3000
      });
      return;
    }

    const jobId = job?.id || job?.job_id;
    setLoading(true);
    // Filter out incomplete questions where the text is empty
    const filteredQuestions = questions.filter(q => q.question.trim().length > 0);

    const data = {
      ...formData,
      category_id: formData.category_id ? Number(formData.category_id) : null,
      experience_required: formData.experience_required ? Number(formData.experience_required.toString().replace(/[^0-9.]/g, '')) : 0,
      vacancies: formData.vacancies ? Number(formData.vacancies) : 1,
      school_name: job?.school_name || profile?.company_name || profile?.name || "",
      institution_name: job?.institution_name || profile?.company_name || profile?.name || "",
      institution_type: job?.institution_type || profile?.institution_type || "",
      description: description || "",
      salary_min: (salaryUndisclosed || !formData.salary_min) ? null : Number(formData.salary_min),
      salary_max: (salaryUndisclosed || !formData.salary_max) ? null : Number(formData.salary_max),
      application_deadline: deadline ? format(deadline, "yyyy-MM-dd") : "",
      questions: filteredQuestions,
      screening_questions: filteredQuestions,
    };

    console.log(`[PostJobClient] Submitting to ${userRole} for job ${jobId}. Full Data:`, data);

    try {
      const endpoint = isEdit
        ? (userRole === "recruiter" ? `recruiter/jobs/${jobId}` : `employer/jobs/update/${jobId}`)
        : (userRole === "recruiter" ? `recruiter/jobs` : `${userRole}/jobs/create`);

      const method = isEdit ? "PUT" : "POST";
      console.log(`[PostJobClient] ${method} request to: ${endpoint}`);

      const result = await dashboardServerFetch(endpoint, { method, data });


      if (result.status) {
        // Check institute verification flag
        if (result.institution_verified === false) {
          toast.warning("Institute is not verified. Job saved as draft.", {
            style: {
              background: '#FFFAF0',
              color: '#744210',
              border: '1px solid #FBD38D',
              fontWeight: '600',
              fontSize: '13px'
            }
          });
          // No redirect, stay on page (job is saved as draft by backend)
        } else {
          toast.success(result.message || (isEdit ? "Job updated!" : "Job posted!"), {
            style: {
              background: '#F0FFF4',
              color: '#22543D',
              border: '1px solid #9AE6B4',
              fontWeight: '600',
              fontSize: '13px'
            }
          });
          // Keeping user on page after posting; no redirect
        }
      } else {
        toast.error(result.message || "Failed.", {
          style: {
            background: '#FFF5F5',
            color: '#C53030',
            border: '1px solid #FEB2B2',
            fontWeight: '600',
            fontSize: '13px'
          }
        });
      }
    } catch (e: any) {
      console.error("[PostJobClient] Submission error:", e);
      toast.error("Error occurred during submission.", {
        style: {
          background: '#FFF5F5',
          color: '#C53030',
          border: '1px solid #FEB2B2',
          fontWeight: '600',
          fontSize: '13px'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = (type: "boolean" | "numeric" | "text") => setQuestions([...questions, { question: "", question_type: type, recruiter_answer: "" }]);
  const removeQuestion = (idx: number) => setQuestions(questions.filter((_, i) => i !== idx));
  const updateQuestion = (idx: number, field: keyof Question, val: string) => {
    const n = [...questions]; n[idx] = { ...n[idx], [field]: val }; setQuestions(n);
  };



  return (
    <div className="max-w-3xl mx-auto px-4 py-4 font-sans text-slate-900 pb-20" suppressHydrationWarning>
      
      {/* Top Back Breadcrumb */}
      <button
        onClick={handleBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 active:scale-95 mb-4"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Back
      </button>

      <div className="space-y-0.5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[#1E1B4B]">{isEdit ? "Edit Job" : "Post a New Job"}</h1>
          {(session?.raw?.user_type || session?.raw?.role) && (
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase border border-indigo-100 tracking-wider shadow-sm">
              {session.raw.user_type || session.raw.role}
            </span>
          )}
        </div>
        <p className="text-slate-400 text-xs">{isEdit ? "Update your job listing requirements" : "Create a job listing in 5 simple steps"}</p>
      </div>

      {/* Stepper Indicator - Desktop Compact Side-by-Side Style */}
      <div className={cn("w-full py-2 md:py-4")}>
        <div className="flex items-center justify-center flex-wrap gap-y-1 max-w-4xl mx-auto">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  if (step.id > currentStep) {
                    const currentError = validateStep(currentStep);
                    if (Object.keys(currentError).length > 0) {
                      toast.warning(Object.values(currentError)[0] as string, {
                        style: {
                          background: '#FFFAF0',
                          color: '#744210',
                          border: '1px solid #FBD38D',
                          fontWeight: '600',
                          fontSize: '13px'
                        }
                      });
                      return;
                    }
                  }
                  setErrors({});
                  setCurrentStep(step.id);
                }}
                className={cn(
                  "flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                )}
              >
                <div className={cn(
                  "w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all bg-[#F8FAFC] border border-slate-50",
                  currentStep >= step.id ? "bg-[#312E81] text-white shadow-sm" : "text-slate-400"
                )}>
                  <step.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>
                <span className={cn(
                  "text-[10px] md:text-[11px] font-bold whitespace-nowrap transition-colors hidden lg:block",
                  currentStep === step.id ? "text-[#1E1B4B]" : "text-slate-400"
                )}>
                  {step.name}
                </span>
              </button>
              {idx < steps.length - 1 && (
                <div className={cn(
                  "w-2 md:w-4 h-[1px] mx-1 rounded-full",
                  currentStep > step.id ? "bg-[#312E81]" : "bg-slate-100"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 md:p-6 min-h-[350px]">
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <h2 className="text-sm font-bold text-[#1E1B4B]">Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
              <div className="md:col-span-2 space-y-1.5">
                <Label className={cn("text-[11px] font-bold px-1 capitalize transition-colors", errors.title ? "text-red-500" : "text-slate-700")}>
                  Job Title <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Input
                  value={formData.title}
                  suppressHydrationWarning
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.length > 50) {
                      setLimitReachedField("title");
                      toast.error("Character limit reached: Maximum 50 characters allowed", { id: "limit-toast" });
                      updateField("title", val.slice(0, 50));
                      setTimeout(() => setLimitReachedField(null), 2000);
                    } else {
                      updateField("title", val);
                      if (errors.title) setErrors(prev => {
                        const n = { ...prev };
                        delete n.title;
                        return n;
                      });
                    }
                  }}
                  placeholder="e.g. Mathematics Teacher"
                  className={cn(
                    "h-10 rounded-xl text-xs transition-all",
                    (errors.title || limitReachedField === "title") ? "border-red-500 bg-red-50/50 focus:border-red-600 ring-2 ring-red-500/20 shadow-[0_0_0_1px_rgba(239,68,68,0.4)]" : "bg-slate-50 border-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  )}
                />
                {errors.title && <p className="text-[10px] font-bold text-red-500 px-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.title}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className={cn("text-[11px] font-bold px-1 capitalize transition-colors", errors.category_id ? "text-red-500" : "text-slate-700")}>
                  Subject / Category <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <select
                  value={formData.category_id}
                  suppressHydrationWarning
                  onChange={(e) => {
                    updateField("category_id", e.target.value);
                    if (errors.category_id) setErrors(prev => {
                      const n = { ...prev };
                      delete n.category_id;
                      return n;
                    });
                  }}
                  className={cn(
                    "w-full h-10 rounded-xl px-4 text-xs outline-none transition-all",
                    errors.category_id ? "border border-red-500 bg-red-50/50 focus:border-red-600" : "bg-slate-50 border-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  )}
                >
                  <option value="">Select subject</option>
                  {metadata.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.category_id && <p className="text-[10px] font-bold text-red-500 px-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.category_id}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className={cn("text-[11px] font-bold px-1 capitalize transition-colors", errors.job_type ? "text-red-500" : "text-slate-700")}>
                  Job Type <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <select
                  value={formData.job_type}
                  suppressHydrationWarning
                  onChange={(e) => {
                    updateField("job_type", e.target.value);
                    if (errors.job_type) setErrors(prev => {
                      const n = { ...prev };
                      delete n.job_type;
                      return n;
                    });
                  }}
                  className={cn(
                    "w-full h-10 rounded-xl px-4 text-xs outline-none transition-all",
                    errors.job_type ? "border border-red-500 bg-red-50/50 focus:border-red-600" : "bg-slate-50 border-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  )}
                >
                  <option value="">Select type</option>
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                </select>
                {errors.job_type && <p className="text-[10px] font-bold text-red-500 px-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.job_type}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className={cn("text-[11px] font-bold px-1 capitalize transition-colors", errors.location ? "text-red-500" : "text-slate-700")}>
                  City <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <select
                  value={formData.location}
                  suppressHydrationWarning
                  onChange={(e) => {
                    updateField("location", e.target.value);
                    if (errors.location) setErrors(prev => {
                      const n = { ...prev };
                      delete n.location;
                      return n;
                    });
                  }}
                  className={cn(
                    "w-full h-10 rounded-xl px-4 text-xs outline-none transition-all",
                    errors.location ? "border border-red-500 bg-red-50/50 focus:border-red-600" : "bg-slate-50 border-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  )}
                >
                  <option value="">Select city</option>
                  {metadata.locations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                </select>
                {errors.location && <p className="text-[10px] font-bold text-red-500 px-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.location}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className={cn("text-[11px] font-bold px-1 capitalize transition-colors", errors.experience_required ? "text-red-500" : "text-slate-700")}>
                  Experience Required <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Input
                  value={formData.experience_required}
                  suppressHydrationWarning
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.length > 50) {
                      setLimitReachedField("experience_required");
                      toast.error("Character limit reached: Maximum 50 characters allowed", { id: "limit-toast" });
                      updateField("experience_required", val.slice(0, 50));
                      setTimeout(() => setLimitReachedField(null), 2000);
                    } else {
                      updateField("experience_required", val);
                      if (errors.experience_required) setErrors(prev => {
                        const n = { ...prev };
                        delete n.experience_required;
                        return n;
                      });
                    }
                  }}
                  placeholder="e.g. 5 years"
                  className={cn(
                    "h-10 rounded-xl text-xs transition-all",
                    (errors.experience_required || limitReachedField === "experience_required") ? "border-red-500 bg-red-50/50 focus:border-red-600 ring-2 ring-red-500/20 shadow-[0_0_0_1px_rgba(239,68,68,0.4)]" : "bg-slate-50 border-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  )}
                />
                {errors.experience_required && <p className="text-[10px] font-bold text-red-500 px-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.experience_required}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className={cn("text-[11px] font-bold px-1 capitalize transition-colors", errors.experience_type ? "text-red-500" : "text-slate-700")}>
                  Experience Type <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <select
                  value={formData.experience_type}
                  suppressHydrationWarning
                  onChange={(e) => {
                    updateField("experience_type", e.target.value);
                    if (errors.experience_type) setErrors(prev => {
                      const n = { ...prev };
                      delete n.experience_type;
                      return n;
                    });
                  }}
                  className={cn(
                    "w-full h-10 rounded-xl px-4 text-xs outline-none transition-all",
                    errors.experience_type ? "border border-red-500 bg-red-50/50 focus:border-red-600" : "bg-slate-50 border-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  )}
                >
                  <option value="">Select experience type</option>
                  <option value="fresher">Fresher</option>
                  <option value="experienced">Experienced</option>
                </select>
                {errors.experience_type && <p className="text-[10px] font-bold text-red-500 px-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.experience_type}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className={cn("text-[11px] font-bold px-1 capitalize transition-colors", errors.gender ? "text-red-500" : "text-slate-700")}>
                  Gender Preference <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <select
                  value={formData.gender}
                  suppressHydrationWarning
                  onChange={(e) => {
                    updateField("gender", e.target.value);
                    if (errors.gender) setErrors(prev => {
                      const n = { ...prev };
                      delete n.gender;
                      return n;
                    });
                  }}
                  className={cn(
                    "w-full h-10 rounded-xl px-4 text-xs outline-none transition-all",
                    errors.gender ? "border border-red-500 bg-red-50/50 focus:border-red-600" : "bg-slate-50 border-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  )}
                >
                  <option value="">Select gender</option>
                  <option value="both">Any / Both</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {errors.gender && <p className="text-[10px] font-bold text-red-500 px-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.gender}</p>}
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label className="text-[11px] font-bold px-1 text-slate-700">
                  Keywords <span className="text-slate-400 font-normal ml-1">(comma separated)</span>
                </Label>
                <Input
                  value={formData.keywords}
                  suppressHydrationWarning
                  onChange={(e) => updateField("keywords", e.target.value)}
                  placeholder="e.g. physics, optics, laser"
                  className="h-10 rounded-xl text-xs bg-slate-50 border-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                {/* <p className="text-[9px] text-slate-400 px-1">Helps candidates find your job through specific technical terms.</p> */}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-300 overflow-hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1E1B4B]">Job Description</h2>
              <Button
                type="button"
                suppressHydrationWarning
                onClick={handleRewriteJD}
                disabled={isRewriting}
                className="h-8 px-5 rounded-lg text-[10px] font-bold bg-[#312E81] hover:bg-[#1E1B4B] text-white transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isRewriting && <Loader2 className="w-3 h-3 animate-spin" />}
                {isRewriting ? "AI is rewriting..." : "Rewrite JD with AI"}
              </Button>
            </div>
            <div className="min-h-[250px] border border-slate-100 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-indigo-100 transition-all">
              <TipTapEditor key={editorKey} value={description} onChange={setDescription} minimal={true} />
            </div>
            <div className="flex justify-between items-center">
              {errors.description && <p className="text-[10px] font-bold text-red-500 px-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.description}</p>}
              <p className={cn(
                "text-[10px] font-bold ml-auto",
                description.replace(/<[^>]*>/g, '').trim().length > 3000 ? "text-red-500" : "text-slate-400"
              )}>
                {description.replace(/<[^>]*>/g, '').trim().length} / 3000 characters
              </p>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="space-y-4">
              <div className="pt-0 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <h2 className="text-sm font-bold text-[#1E1B4B]">Candidate Questions (Optional)</h2>
                  <Button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => addQuestion("boolean")}
                    variant="outline"
                    className="h-8 px-3 rounded-lg text-[10px] font-bold border-slate-100 hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    <Plus className="w-3 h-3" />
                    Add Question
                  </Button>
                </div>
                <div className="space-y-3">
                  {questions.length === 0 && (
                    <div className="py-10 text-center space-y-3 bg-slate-50/20 rounded-2xl border border-dashed border-slate-100">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
                        <HelpCircle className="w-5 h-5 text-slate-300" />
                      </div>
                      <p className="text-[11px] font-medium text-slate-400">Add screening questions to filter better candidates.</p>
                    </div>
                  )}
                  {questions.map((q, i) => (
                    <div key={i} className="bg-slate-50/40 p-3.5 rounded-xl border border-slate-50 space-y-3 relative group">
                      <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Question {i + 1}</label>
                          <Input
                            value={q.question}
                            suppressHydrationWarning
                            onChange={(e) => updateQuestion(i, "question", e.target.value)}
                            placeholder="e.g. Do you have a valid teaching license?"
                            className="h-9 bg-white border-slate-100 text-xs focus:ring-1 focus:ring-indigo-100"
                          />
                        </div>
                        <div className="w-full md:w-32 shrink-0 space-y-1.5">
                          <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Type</label>
                          <select
                            value={q.question_type}
                            suppressHydrationWarning
                            onChange={(e) => updateQuestion(i, "question_type", e.target.value as any)}
                            className="w-full h-9 rounded-xl bg-white border-slate-100 px-3 text-[10px] outline-none font-semibold focus:ring-1 focus:ring-indigo-100"
                          >
                            <option value="boolean">Yes / No</option>
                            <option value="numeric">Number</option>
                            <option value="text">Text Response</option>
                          </select>
                        </div>
                        <div className="w-full md:w-32 shrink-0 space-y-1.5">
                          <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Expected Answer</label>
                          {q.question_type === 'boolean' ? (
                            <select
                              value={q.recruiter_answer}
                              suppressHydrationWarning
                              onChange={(e) => updateQuestion(i, "recruiter_answer", e.target.value)}
                              className="w-full h-9 rounded-xl bg-white border-slate-100 px-3 text-[10px] outline-none font-semibold focus:ring-1 focus:ring-indigo-100"
                            >
                              <option value="">Select Answer</option>
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </select>
                          ) : (
                            <Input
                              value={q.recruiter_answer}
                              suppressHydrationWarning
                              onChange={(e) => updateQuestion(i, "recruiter_answer", e.target.value)}
                              placeholder={q.question_type === 'numeric' ? "e.g. 5" : "Expected keywords..."}
                              className="h-9 bg-white border-slate-100 text-[10px] font-semibold"
                            />
                          )}
                        </div>
                        <div className="flex items-end pb-0.5">
                          <button
                            onClick={() => removeQuestion(i)}
                            suppressHydrationWarning
                            className="p-2 text-red-500 hover:text-red-700 transition-colors bg-white md:bg-transparent rounded-lg border border-slate-50 md:border-none shadow-sm md:shadow-none"
                            title="Remove Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <h2 className="text-sm font-bold text-[#1E1B4B]">Salary Details</h2>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className={cn("text-[11px] font-bold px-1 capitalize transition-colors", errors.salary_min ? "text-red-500" : "text-slate-700")}>
                    Min Salary (Monthly) <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    value={formData.salary_min}
                    suppressHydrationWarning
                    onChange={(e) => {
                      updateField("salary_min", e.target.value);
                      if (errors.salary_min) setErrors(prev => {
                        const n = { ...prev };
                        delete n.salary_min;
                        return n;
                      });
                    }}
                    placeholder="Min ₹"
                    disabled={salaryUndisclosed}
                    className={cn(
                      "h-10 text-xs transition-all",
                      errors.salary_min ? "border-red-500 bg-red-50/50" : "bg-slate-50 border-slate-100 focus:bg-white",
                      salaryUndisclosed && "opacity-50 cursor-not-allowed"
                    )}
                  />
                  {errors.salary_min && <p className="text-[10px] font-bold text-red-500 px-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.salary_min}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold px-1 capitalize text-slate-700 transition-colors">
                    Max Salary (Monthly) <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    value={formData.salary_max}
                    suppressHydrationWarning
                    onChange={(e) => {
                      updateField("salary_max", e.target.value);
                      if (errors.salary_max || errors.salary_range) setErrors(prev => {
                        const n = { ...prev };
                        delete n.salary_max;
                        delete n.salary_range;
                        return n;
                      });
                    }}
                    placeholder="Max ₹"
                    disabled={salaryUndisclosed}
                    className={cn(
                      "h-10 text-xs transition-all",
                      (errors.salary_max || errors.salary_range) ? "border-red-500 bg-red-50/50" : "bg-slate-50 border-slate-100 focus:bg-white",
                      salaryUndisclosed && "opacity-50 cursor-not-allowed"
                    )}
                  />
                  {(errors.salary_max || errors.salary_range) && <p className="text-[10px] font-bold text-red-500 px-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.salary_max || errors.salary_range}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 px-1">
                <input
                  type="checkbox"
                  id="salary_undisclosed"
                  checked={salaryUndisclosed}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSalaryUndisclosed(checked);
                    if (checked) {
                      updateField("salary_min", "");
                      updateField("salary_max", "");
                    }
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="salary_undisclosed" className="text-[11px] font-semibold text-slate-600 cursor-pointer select-none">
                  Salary Undisclosed
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div className="space-y-1.5">
                  <Label className={cn("text-[11px] font-bold px-1 capitalize transition-colors", errors.deadline ? "text-red-500" : "text-slate-700")}>
                    Apply Before <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <div className={cn(
                    "rounded-xl transition-all",
                    errors.deadline && "border border-red-500 bg-red-50/50"
                  )}>
                    <DatePicker
                      date={deadline}
                      setDate={(date) => {
                        setDeadline(date);
                        if (errors.deadline) setErrors(prev => {
                          const n = { ...prev };
                          delete n.deadline;
                          return n;
                        });
                      }}
                      className="h-10 bg-transparent border-none text-xs"
                      placeholder="Select date"
                      calendarDisabled={{ before: new Date() }}
                    />
                  </div>
                  {errors.deadline && <p className="text-[10px] font-bold text-red-500 px-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.deadline}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className={cn("text-[11px] font-bold px-1 capitalize transition-colors", errors.vacancies ? "text-red-500" : "text-slate-700")}>
                    Open Vacancies <span className="text-red-500 ml-0.5">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={formData.vacancies}
                    suppressHydrationWarning
                    onChange={(e) => {
                      updateField("vacancies", e.target.value);
                      if (errors.vacancies) setErrors(prev => {
                        const n = { ...prev };
                        delete n.vacancies;
                        return n;
                      });
                    }}
                    className={cn(
                      "h-10 text-xs transition-all",
                      errors.vacancies ? "border-red-500 bg-red-50/50 focus:border-red-600 focus:ring-red-200" : "bg-slate-50 border-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    )}
                    placeholder="e.g. 2"
                  />
                  {errors.vacancies && <p className="text-[10px] font-bold text-red-500 px-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.vacancies}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">Preview Your Job Listing</h2>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">Draft Preview</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Header */}
              <div className="p-5 md:p-6 border-b border-slate-100">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight capitalize tracking-tight">
                        {formData.title || <span className="text-slate-300">Job Title</span>}
                      </h3>
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[11px] font-semibold capitalize tracking-wide shrink-0">
                        {formData.job_type.replace('_', ' ') || "Type"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[13px] font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                        {formData.location || <span className="text-slate-400">Location</span>}
                      </div>
                      {deadline && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-rose-500" />
                          Apply by <span className="text-rose-600 font-semibold">{deadline.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Details Grid */}
              <div className="p-5 md:p-6 border-b border-slate-100">
                <h4 className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                  Job Highlights
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-6">
                  {/* Salary */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Salary</span>
                    </div>
                    <p className={cn("text-[13px] font-semibold", formData.salary_min ? "text-slate-800" : "text-slate-400")}>
                      {formData.salary_min && formData.salary_max
                        ? `₹${Number(formData.salary_min).toLocaleString()} – ₹${Number(formData.salary_max).toLocaleString()}`
                        : "Not Disclosed"}
                    </p>
                  </div>

                  {/* Experience */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Experience</span>
                    </div>
                    <p className={cn("text-[13px] font-semibold", formData.experience_required ? "text-slate-800" : "text-slate-400")}>
                      {formData.experience_required ? `${formData.experience_required} yrs (${formData.experience_type})` : `Not Specified (${formData.experience_type})`}
                    </p>
                  </div>

                  {/* Category */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-purple-600">
                      <Folder className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Category</span>
                    </div>
                    <p className="text-[13px] font-semibold text-slate-800">
                      {metadata.categories.find(c => c.id === Number(formData.category_id))?.name || <span className="text-slate-400">Not Selected</span>}
                    </p>
                  </div>

                  {/* Vacancies */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-orange-600">
                      <Users className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Vacancies</span>
                    </div>
                    <p className="text-[13px] font-semibold text-slate-800">
                      {formData.vacancies} Position(s)
                    </p>
                  </div>

                  {/* Gender Pref */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-pink-600">
                      <User className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Gender Pref.</span>
                    </div>
                    <p className="text-[13px] font-semibold text-slate-800 capitalize">
                      {formData.gender}
                    </p>
                  </div>

                  {/* Keywords */}
                  <div className="col-span-2 md:col-span-3 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-indigo-600">
                      <Tag className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Keywords</span>
                    </div>
                    <p className={cn("text-[13px] font-medium leading-relaxed", formData.keywords ? "text-slate-800" : "text-slate-400")}>
                      {formData.keywords || "None"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-5 md:p-6 border-b border-slate-100">
                <h4 className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Job Description
                </h4>
                <div className="prose prose-sm md:prose-base prose-slate max-w-none text-slate-600 leading-relaxed">
                  {description ? (
                    <div dangerouslySetInnerHTML={{ __html: description }} />
                  ) : (
                    <span className="text-slate-400 italic">Description will appear here...</span>
                  )}
                </div>
              </div>

              {/* Questions */}
              {questions.filter(q => q.question.trim()).length > 0 && (
                <div className="p-5 md:p-6 bg-slate-50/50">
                  <h4 className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-purple-500" />
                    Screening Questions ({questions.filter(q => q.question.trim()).length})
                  </h4>
                  <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                    {questions.filter(q => q.question.trim()).map((q, idx) => (
                      <div key={idx} className="p-3.5 border-b border-slate-100 last:border-b-0 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-2.5">
                          <span className="text-[11px] font-semibold text-slate-400 mt-0.5 w-4 shrink-0">
                            {String(idx + 1).padStart(2, '0')}.
                          </span>
                          <p className="text-[13px] font-medium text-slate-800 leading-tight">{q.question}</p>
                        </div>
                        <div className="flex items-center gap-3 pl-6 md:pl-0 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-medium text-slate-400">Type:</span>
                            <span className="text-[11px] font-medium text-slate-600 capitalize">
                              {q.question_type === 'boolean' ? 'Yes/No' : q.question_type}
                            </span>
                          </div>
                          <div className="w-px h-3 bg-slate-200 hidden md:block"></div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-medium text-slate-400">Expected:</span>
                            <span className="text-[11px] font-semibold text-indigo-600 uppercase">
                              {q.recruiter_answer || "Any"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-50 gap-4">
        {currentStep > 1 || isEdit ? (
          <Button
            variant="outline"
            suppressHydrationWarning
            onClick={handleBack}
            disabled={loading}
            className="h-10 px-8 rounded-xl text-xs font-bold border-2 border-[#312E81] text-[#312E81] bg-white transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md"
          >
            Back
          </Button>
        ) : (
          <div />
        )}

        <div className="flex-1 md:flex-none flex justify-end gap-3">
          {currentStep < 5 ? (
            <Button
              onClick={handleNext}
              suppressHydrationWarning
              className="h-10 w-full md:w-auto px-10 rounded-xl bg-[#312E81] hover:bg-[#1E1B4B] text-white text-[12.5px] font-bold transition-all shadow-sm"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              suppressHydrationWarning
              className="h-10 w-full md:w-auto px-10 rounded-xl bg-[#312E81] hover:bg-[#1E1B4B] text-white text-[12.5px] font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {isEdit ? "Save Changes" : "Post Job Now"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
