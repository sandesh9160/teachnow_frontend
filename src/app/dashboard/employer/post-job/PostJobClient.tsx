"use client";

import { useState } from "react";
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
  HelpCircle
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
  profile?: any;
}

export default function PostJobClient({
  metadata,
  initialData,
  isEdit = false,
  userRole = "employer",
  profile
}: PostJobClientProps & { userRole?: string }) {
  const basePath = `/dashboard/${userRole}`;
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: job?.title || "",
    category_id: job?.category_id || "",
    job_type: job?.job_type || "",
    location: job?.location || "",
    experience_type: job?.experience_type || "experienced",
    experience_required: job?.experience_required || "",
    vacancies: job?.vacancies || 1,
    gender: job?.gender || "both",
    salary_min: job?.salary_min != null ? job.salary_min.toString().split('.')[0] : "",
    salary_max: job?.salary_max != null ? job.salary_max.toString().split('.')[0] : "",
    education_qualification: job?.education_qualification || "",
    skills: Array.isArray(job?.skills) ? job.skills : [],
    benefits: Array.isArray(job?.benefits) ? job.benefits : [],
    meta_title: job?.meta_title || "",
    meta_description: job?.meta_description || "",
    meta_keywords: job?.meta_keywords || "",
    keywords: job?.keywords || "",
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
        if (!formData.title?.toString().trim()) newErrors.title = "Job Title is required";
        if (!formData.category_id) newErrors.category_id = "Subject / Category is required";
        if (!formData.job_type) newErrors.job_type = "Job Type is required";
        if (!formData.location) newErrors.location = "City is required";
        if (!formData.experience_required?.toString().trim()) newErrors.experience_required = "Experience Required is required";
        break;
      case 2:
        if (!description || description.replace(/<[^>]*>/g, '').trim().length < 50)
          newErrors.description = "Detailed Description (min 50 chars) is required";
        break;
      case 4:
        if (!salaryUndisclosed) {
          if (!formData.salary_min) newErrors.salary_min = "Minimum Salary is required";
          if (!formData.salary_max) newErrors.salary_max = "Maximum Salary is required";
          if (formData.salary_min && formData.salary_max && Number(formData.salary_min) > Number(formData.salary_max))
            newErrors.salary_range = "Max salary should be more than min salary";
        }
        if (!deadline) newErrors.deadline = "Application Deadline is required";
        if (!formData.vacancies || Number(formData.vacancies) <= 0) newErrors.vacancies = "Open Vacancies is required";
        break;
    }
    
    const firstKey = Object.keys(newErrors)[0];
    setErrors(firstKey ? { [firstKey]: newErrors[firstKey] } : {});
    return newErrors;
  };

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    const errorKeys = Object.keys(stepErrors);
    
    if (errorKeys.length > 0) {
      toast.error(stepErrors[errorKeys[0]], {
        style: { borderLeft: '4px solid #ef4444' },
        duration: 3000
      });
      return;
    }
    
    setErrors({});
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleSubmit = async () => {
    const stepErrors = validateStep(4);
    const errorKeys = Object.keys(stepErrors);
    
    if (errorKeys.length > 0) {
      toast.error(stepErrors[errorKeys[0]], {
        style: { borderLeft: '4px solid #ef4444' },
        duration: 3000
      });
      return;
    }

    const jobId = job?.id || job?.job_id;
    setLoading(true);
    const data = { 
      ...formData, 
      school_name: job?.school_name || profile?.company_name || profile?.name || "",
      description, 
      salary_min: salaryUndisclosed ? null : formData.salary_min,
      salary_max: salaryUndisclosed ? null : formData.salary_max,
      application_deadline: deadline ? format(deadline, "yyyy-MM-dd") : "", 
      questions,
      screening_questions: questions,
      screening_questions_json: JSON.stringify(questions),
      ...(userRole === 'recruiter' && isEdit ? { _method: 'PUT' } : {})
    };
    
    console.log(`[PostJobClient] Submitting to ${userRole} for job ${jobId}. Full Data:`, data);
    
    try {
      const endpoint = userRole === "recruiter"
        ? (isEdit ? `recruiter/jobs/${jobId}` : `recruiter/jobs`)
        : (isEdit ? `${userRole}/jobs/update/${jobId}` : `${userRole}/jobs/create`);
      
      const method = (userRole === 'recruiter' && isEdit) ? "POST" : (isEdit ? "PUT" : "POST");
      console.log(`[PostJobClient] ${method} request to: ${endpoint} (with _method override if recruiter edit)`);
      
      const result = await dashboardServerFetch(endpoint, { method, data });
      console.log("[PostJobClient] Submission Result:", result);
      
      if (result.status) {
        toast.success(result.message || (isEdit ? "Job updated!" : "Job posted!"));
        setTimeout(() => { window.location.href = `${basePath}/jobs`; }, 1200);
      } else {
        toast.error(result.message || "Failed.");
      }
    } catch (e: any) {
      console.error("[PostJobClient] Submission error:", e);
      toast.error("Error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = (type: "boolean" | "numeric" | "text") => setQuestions([...questions, { question: "", question_type: type, recruiter_answer: type === 'boolean' ? 'yes' : '' }]);
  const removeQuestion = (idx: number) => setQuestions(questions.filter((_, i) => i !== idx));
  const updateQuestion = (idx: number, field: keyof Question, val: string) => {
    const n = [...questions]; n[idx] = { ...n[idx], [field]: val }; setQuestions(n);
  };



  return (
    <div className="max-w-3xl mx-auto px-4 py-4 font-sans text-slate-900 pb-20">
      <div className="space-y-0.5">
        <h1 className="text-xl font-bold text-[#1E1B4B]">{isEdit ? "Edit Job" : "Post a New Job"}</h1>
        <p className="text-slate-400 text-xs">{isEdit ? "Update your job listing requirements" : "Create a job listing in 5 simple steps"}</p>
      </div>

      {/* Stepper Indicator - Desktop Compact Side-by-Side Style */}
      <div className="w-full py-2 md:py-4">
        <div className="flex items-center justify-center flex-wrap gap-y-1 max-w-4xl mx-auto">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => {
                  if (step.id > currentStep) {
                    const currentError = validateStep(currentStep);
                    if (Object.keys(currentError).length > 0) {
                      toast.error(Object.values(currentError)[0] as string, { style: { borderLeft: "4px solid #ef4444" } });
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
                  onChange={(e) => updateField("title", e.target.value)} 
                  placeholder="e.g. Mathematics Teacher" 
                  className={cn(
                    "h-10 rounded-xl text-xs transition-all",
                    errors.title ? "border-red-500 bg-red-50/50 focus:border-red-600 focus:ring-red-200" : "bg-slate-50 border-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  )} 
                />
              </div>
              <div className="space-y-1.5">
                <Label className={cn("text-[11px] font-bold px-1 capitalize transition-colors", errors.category_id ? "text-red-500" : "text-slate-700")}>
                  Subject / Category <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <select 
                  value={formData.category_id} 
                  onChange={(e) => updateField("category_id", e.target.value)} 
                  className={cn(
                    "w-full h-10 rounded-xl px-4 text-xs outline-none transition-all",
                    errors.category_id ? "border border-red-500 bg-red-50/50 focus:border-red-600" : "bg-slate-50 border-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  )}
                >
                  <option value="">Select subject</option>
                  {metadata.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className={cn("text-[11px] font-bold px-1 capitalize transition-colors", errors.job_type ? "text-red-500" : "text-slate-700")}>
                  Job Type <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <select 
                  value={formData.job_type} 
                  onChange={(e) => updateField("job_type", e.target.value)} 
                  className={cn(
                    "w-full h-10 rounded-xl px-4 text-xs outline-none transition-all",
                    errors.job_type ? "border border-red-500 bg-red-50/50 focus:border-red-600" : "bg-slate-50 border-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  )}
                >
                  <option value="">Select type</option>
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className={cn("text-[11px] font-bold px-1 capitalize transition-colors", errors.location ? "text-red-500" : "text-slate-700")}>
                  City <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <select 
                  value={formData.location} 
                  onChange={(e) => updateField("location", e.target.value)} 
                  className={cn(
                    "w-full h-10 rounded-xl px-4 text-xs outline-none transition-all",
                    errors.location ? "border border-red-500 bg-red-50/50 focus:border-red-600" : "bg-slate-50 border-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  )}
                >
                  <option value="">Select city</option>
                  {metadata.locations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className={cn("text-[11px] font-bold px-1 capitalize transition-colors", errors.experience_required ? "text-red-500" : "text-slate-700")}>
                  Experience Required <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Input 
                  value={formData.experience_required} 
                  onChange={(e) => updateField("experience_required", e.target.value)} 
                  placeholder="e.g. 3–5 years" 
                  className={cn(
                    "h-10 rounded-xl text-xs transition-all",
                    errors.experience_required ? "border-red-500 bg-red-50/50 focus:border-red-600 focus:ring-red-200" : "bg-slate-50 border-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  )} 
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-300 overflow-hidden">
            <h2 className="text-sm font-bold text-[#1E1B4B]">Job Description</h2>
            <div className="min-h-[250px] border border-slate-100 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-indigo-100 transition-all">
              <TipTapEditor value={description} onChange={setDescription} minimal={true} />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="space-y-4">
              <div className="pt-0 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <h2 className="text-sm font-bold text-[#1E1B4B]">Candidate Questions</h2>
                  <Button 
                    type="button" 
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
                            onChange={(e) => updateQuestion(i, "question", e.target.value)} 
                            placeholder="e.g. Do you have a valid teaching license?"
                            className="h-9 bg-white border-slate-100 text-xs focus:ring-1 focus:ring-indigo-100" 
                          />
                        </div>
                        <div className="w-full md:w-32 shrink-0 space-y-1.5">
                          <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Type</label>
                          <select 
                            value={q.question_type} 
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
                              onChange={(e) => updateQuestion(i, "recruiter_answer", e.target.value)}
                              className="w-full h-9 rounded-xl bg-white border-slate-100 px-3 text-[10px] outline-none font-semibold focus:ring-1 focus:ring-indigo-100"
                            >
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </select>
                          ) : (
                            <Input 
                              value={q.recruiter_answer} 
                              onChange={(e) => updateQuestion(i, "recruiter_answer", e.target.value)}
                              placeholder={q.question_type === 'numeric' ? "e.g. 5" : "Expected keywords..."}
                              className="h-9 bg-white border-slate-100 text-[10px] font-semibold"
                            />
                          )}
                        </div>
                        <div className="flex items-end pb-0.5">
                          <button 
                            onClick={() => removeQuestion(i)} 
                            className="p-2 text-slate-300 hover:text-rose-400 transition-colors bg-white md:bg-transparent rounded-lg border border-slate-50 md:border-none shadow-sm md:shadow-none"
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
                      onChange={(e) => updateField("salary_min", e.target.value)} 
                      placeholder="Min ₹" 
                      disabled={salaryUndisclosed}
                      className={cn(
                        "h-10 text-xs transition-all",
                        errors.salary_min ? "border-red-500 bg-red-50/50" : "bg-slate-50 border-slate-100 focus:bg-white",
                        salaryUndisclosed && "opacity-50 cursor-not-allowed"
                      )} 
                    />
                  </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold px-1 capitalize text-slate-700 transition-colors">
                        Max Salary (Monthly) <span className="text-red-500 ml-0.5">*</span>
                      </Label>
                    <Input 
                      value={formData.salary_max} 
                      onChange={(e) => updateField("salary_max", e.target.value)} 
                      placeholder="Max ₹" 
                      disabled={salaryUndisclosed}
                      className={cn(
                        "h-10 text-xs transition-all",
                        (errors.salary_max || errors.salary_range) ? "border-red-500 bg-red-50/50" : "bg-slate-50 border-slate-100 focus:bg-white",
                        salaryUndisclosed && "opacity-50 cursor-not-allowed"
                      )} 
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 px-1">
                  <input 
                    type="checkbox" 
                    id="salary_undisclosed"
                    checked={salaryUndisclosed}
                    onChange={(e) => setSalaryUndisclosed(e.target.checked)}
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
                        setDate={setDeadline}
                        className="h-10 bg-transparent border-none text-xs"
                        placeholder="Select date"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className={cn("text-[11px] font-bold px-1 capitalize transition-colors", errors.vacancies ? "text-red-500" : "text-slate-700")}>
                      Open Vacancies <span className="text-red-500 ml-0.5">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={formData.vacancies}
                      onChange={(e) => updateField("vacancies", e.target.value)}
                      className={cn(
                        "h-10 text-xs transition-all",
                        errors.vacancies ? "border-red-500 bg-red-50/50 focus:border-red-600 focus:ring-red-200" : "bg-slate-50 border-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                      )}
                      placeholder="e.g. 2"
                    />
                  </div>
                </div>
              </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
            <h2 className="text-base md:text-xl font-bold text-[#1E1B4B]">Preview Your Job Listing</h2>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-10 space-y-8 md:space-y-10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-1.5">
                  <h3 className="text-2xl md:text-3xl font-bold text-[#1E1B4B] leading-tight capitalize tracking-tight">
                    {formData.title || <span className="text-slate-200">Job Title</span>}
                  </h3>
                  <p className="text-slate-400 text-sm md:text-base font-medium">
                    {formData.location || <span className="text-slate-200">Location</span>}
                  </p>
                </div>
                <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[11px] md:text-xs font-semibold capitalize tracking-wide shrink-0">
                  {formData.job_type.replace('_', ' ') || "Type"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:border-slate-200">
                  <p className="text-[10px] md:text-[11px] text-slate-400 font-medium tracking-wide mb-2">Salary Estimate</p>
                  <p className={cn("text-sm md:text-base font-bold", formData.salary_min ? "text-[#1E1B4B]" : "text-slate-300")}>
                    {formData.salary_min && formData.salary_max
                      ? `₹${Number(formData.salary_min).toLocaleString()} – ₹${Number(formData.salary_max).toLocaleString()}`
                      : "Not Disclosed"}
                  </p>
                </div>
                <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:border-slate-200">
                  <p className="text-[10px] md:text-[11px] text-slate-400 font-medium tracking-wide mb-2">Experience Required</p>
                  <p className={cn("text-sm md:text-base font-bold", formData.experience_required ? "text-[#1E1B4B]" : "text-slate-300")}>
                    {formData.experience_required ? `${formData.experience_required} years` : "Not Specified"}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <h4 className="text-sm md:text-base font-bold text-[#1E1B4B] tracking-tight">Description</h4>
                <div className="prose prose-sm md:prose-base prose-slate max-w-none text-slate-500 leading-relaxed min-h-[50px]">
                  {description ? (
                    <div dangerouslySetInnerHTML={{ __html: description }} />
                  ) : (
                    <span className="text-slate-200 italic font-medium">Description will appear here...</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-50 gap-4">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || loading}
          className={cn(
            "h-10 px-6 rounded-xl text-xs font-bold border-slate-100 text-slate-500 bg-white hover:bg-slate-50 transition-all",
            currentStep === 1 && "invisible"
          )}
        >
          Back
        </Button>

        <div className="flex-1 md:flex-none flex justify-end gap-3">
          {currentStep < 5 ? (
            <Button
              onClick={handleNext}
              className="h-10 w-full md:w-auto px-10 rounded-xl bg-[#312E81] hover:bg-[#1E1B4B] text-white text-[12.5px] font-bold transition-all shadow-sm"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
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
