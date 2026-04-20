"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  Briefcase, 
  Loader2,
  Save,
  Trash2,
  ToggleLeft,
  Hash,
  DollarSign,
  FileText,
  GraduationCap,
  Eye,
  X,
  Plus
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
}

export default function PostJobClient({ 
  metadata, 
  initialData, 
  isEdit = false,
  userRole = "employer"
}: PostJobClientProps & { userRole?: string }) {
  const basePath = `/dashboard/${userRole}`;
  const job = isEdit ? initialData?.job : initialData;
  const initialQuestions = isEdit ? (initialData?.questions || job?.questions || []) : [];

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: job?.title || "",
    category_id: job?.category_id || "",
    job_type: job?.job_type || "",
    location: job?.location || "",
    experience_type: job?.experience_type || "experienced",
    experience_required: job?.experience_required || "",
    school_name: job?.school_name || "",
    vacancies: job?.vacancies || 1,
    gender: job?.gender || "both",
    salary_min: job?.salary_min?.split('.')[0] || "",
    salary_max: job?.salary_max?.split('.')[0] || "",
    education_qualification: job?.education_qualification || "",
    skills: Array.isArray(job?.skills) ? job.skills : [],
    benefits: Array.isArray(job?.benefits) ? job.benefits : [],
  });

  const [description, setDescription] = useState(job?.description || "");
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [deadline, setDeadline] = useState<Date | undefined>(
    job?.deadline || job?.application_deadline ? new Date(job.deadline || job.application_deadline) : undefined
  );
  const featured = job?.featured === 1;
  const [newSkill, setNewSkill] = useState("");

  const updateField = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const steps = [
    { id: 1, name: "Job Details", icon: Briefcase },
    { id: 2, name: "Job Description", icon: FileText },
    { id: 3, name: "Requirements", icon: GraduationCap },
    { id: 4, name: "Salary & Benefits", icon: DollarSign },
    { id: 5, name: "Preview & Publish", icon: Eye },
  ];

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) return { title: "Missing Title", desc: "Please provide a catchy title for your job listing." };
        if (!formData.category_id) return { title: "Subject Required", desc: "Select a subject category to help candidates find your job." };
        if (!formData.job_type) return { title: "Job Type", desc: "Is this a full-time or part-time position? Please select one." };
        if (!formData.school_name.trim()) return { title: "Institution Name", desc: "Please enter the name of your school or institute." };
        if (!formData.location) return { title: "Location Missing", desc: "Tell candidates where this job is located." };
        break;
      case 2:
        if (!description || description.replace(/<[^>]*>/g, '').trim().length < 20) 
          return { title: "Details Needed", desc: "A brief description (min 20 chars) helps candidates understand the role better." };
        break;
      case 3:
        if (!formData.education_qualification.trim()) return { title: "Qualification", desc: "Please specify the required education for this role." };
        break;
      case 4:
        if (!deadline) return { title: "Deadline Missing", desc: "When should applications close? Please pick a date." };
        if (!formData.salary_min) return { title: "Min Salary", desc: "Please provide a minimum monthly salary range." };
        if (!formData.salary_max) return { title: "Max Salary", desc: "Please provide a maximum monthly salary range." };
        if (Number(formData.salary_min) > Number(formData.salary_max)) 
          return { title: "Salary Order", desc: "The minimum salary shouldn't be higher than the maximum." };
        break;
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep(currentStep);
    if (error) {
      toast.error(error.title, { description: error.desc });
      return;
    }
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const addSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      updateField("skills", [...formData.skills, newSkill]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    updateField("skills", formData.skills.filter((s: string) => s !== skill));
  };

  const toggleBenefit = (benefit: string) => {
    const newBenefits = formData.benefits.includes(benefit)
      ? formData.benefits.filter((b: string) => b !== benefit)
      : [...formData.benefits, benefit];
    updateField("benefits", newBenefits);
  };

  const handleSubmit = async () => {
    const error = validateStep(4); // Re-validate step 4 before submitting
    if (error) {
      toast.error(error.title, { description: error.desc });
      setCurrentStep(4);
      return;
    }

    setLoading(true);
    const data = { ...formData, description, deadline: deadline ? format(deadline, "yyyy-MM-dd") : "", featured: featured ? 1 : 0, questions };
    try {
      const endpoint = isEdit ? `${userRole}/jobs/update/${job?.id}` : `${userRole}/jobs/create`;
      const result = await dashboardServerFetch(endpoint, { method: isEdit ? "PUT" : "POST", data });
      if (result.status) {
        toast.success(result.message || (isEdit ? "Job updated!" : "Job posted!"));
        setTimeout(() => { window.location.href = `${basePath}/jobs`; }, 1200);
      } else {
        toast.error(result.message || "Failed.");
      }
    } catch (e: any) {
      toast.error("Error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = (type: "boolean" | "numeric" | "text") => setQuestions([...questions, { question: "", question_type: type, recruiter_answer: type === 'boolean' ? 'yes' : '' }]);
  const removeQuestion = (idx: number) => setQuestions(questions.filter((_, i) => i !== idx));
  const updateQuestion = (idx: number, field: keyof Question, val: string) => {
    const n = [...questions]; n[idx] = { ...n[idx], [field]: val }; setQuestions(n);
  };

  const benefitOptions = ["Health Insurance", "Accommodation", "Transport Allowance", "Flexible Schedule", "Annual Bonus", "Paid Leaves"];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-sans text-slate-900 pb-32">
      <div className="space-y-1">
        <h1 className="text-xl md:text-2xl font-semibold text-[#1E1B4B]">Post a New Job</h1>
        <p className="text-slate-400 text-xs md:text-sm">Create a job listing in 5 simple steps</p>
      </div>

      {/* Stepper Indicator - Desktop Compact Side-by-Side Style */}
      <div className="w-full py-4 md:py-8 overflow-hidden">
        <div className="flex items-center justify-center flex-wrap gap-y-2 md:gap-x-0 max-w-4xl mx-auto px-1">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center group">
              <button 
                onClick={() => setCurrentStep(step.id)}
                className="flex items-center gap-1.5 md:gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <div className={cn(
                  "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all bg-[#F8FAFC] border border-slate-50",
                  currentStep >= step.id ? "bg-[#312E81] border-[#312E81] text-white shadow-sm" : "text-slate-400"
                )}>
                  <step.icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                {/* Text Label - Hidden on Mobile */}
                <span className={cn(
                  "text-[11px] md:text-xs font-semibold whitespace-nowrap transition-colors hidden md:block", 
                  currentStep === step.id ? "text-[#1E1B4B]" : "text-slate-400 group-hover:text-slate-600"
                )}>
                  {step.name}
                </span>
              </button>
              {idx < steps.length - 1 && (
                <div className={cn(
                  "w-3 md:w-8 h-[1.5px] mx-1 md:mx-2 rounded-full transition-colors",
                  currentStep > step.id ? "bg-[#312E81]" : "bg-slate-100"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-8 min-h-[400px]">
        {currentStep === 1 && (
          <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
            <h2 className="text-base md:text-lg font-semibold text-[#1E1B4B]">Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-4 md:pb-6">
              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs md:text-sm font-medium text-slate-700">Job Title *</Label>
                <Input value={formData.title} onChange={(e) => updateField("title", e.target.value)} placeholder="e.g. Mathematics Teacher" className="h-11 rounded-xl bg-slate-50 border-slate-50 focus:bg-white text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-medium text-slate-700">Subject / Category *</Label>
                <select value={formData.category_id} onChange={(e) => updateField("category_id", e.target.value)} className="w-full h-11 rounded-xl bg-slate-50 border-slate-50 px-4 text-sm focus:ring-1 focus:ring-slate-200 outline-none">
                  <option value="">Select subject</option>
                  {metadata.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-medium text-slate-700">Job Type *</Label>
                <select value={formData.job_type} onChange={(e) => updateField("job_type", e.target.value)} className="w-full h-11 rounded-xl bg-slate-50 border-slate-50 px-4 text-sm focus:ring-1 focus:ring-slate-200 outline-none">
                  <option value="">Select type</option>
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs md:text-sm font-medium text-slate-700">School / Institute Name *</Label>
                <Input value={formData.school_name} onChange={(e) => updateField("school_name", e.target.value)} placeholder="e.g. Delhi Public School" className="h-11 rounded-xl bg-slate-50 border-slate-50 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-medium text-slate-700">City *</Label>
                <select value={formData.location} onChange={(e) => updateField("location", e.target.value)} className="w-full h-11 rounded-xl bg-slate-50 border-slate-50 px-4 text-sm outline-none">
                  <option value="">Select city</option>
                  {metadata.locations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-medium text-slate-700">Experience Required</Label>
                <Input value={formData.experience_required} onChange={(e) => updateField("experience_required", e.target.value)} placeholder="e.g. 3–5 years" className="h-11 rounded-xl bg-slate-50 border-slate-50 text-sm" />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300 overflow-hidden">
            <h2 className="text-base md:text-lg font-semibold text-[#1E1B4B]">Job Description</h2>
            <div className="min-h-[300px] md:min-h-[350px] border border-slate-100 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-slate-200 transition-all">
               <TipTapEditor value={description} onChange={setDescription} minimal={true} />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
            <h2 className="text-base md:text-lg font-semibold text-[#1E1B4B]">Requirements</h2>
            <div className="space-y-6">
               <div className="space-y-2">
                 <Label className="text-xs md:text-sm font-medium text-slate-700">Education Qualification *</Label>
                 <Input value={formData.education_qualification} onChange={(e) => updateField("education_qualification", e.target.value)} placeholder="e.g. B.Ed / M.Sc Mathematics" className="h-11 rounded-xl bg-slate-50 border-slate-50 text-sm" />
               </div>
               <div className="space-y-4 text-sm">
                 <Label className="font-medium text-slate-700">Skills Required</Label>
                 <div className="flex gap-2">
                    <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Skills..." className="h-11 bg-slate-50 border-slate-50" />
                    <Button onClick={addSkill} variant="outline" className="h-11 px-4 md:px-6 rounded-xl text-slate-600">Add</Button>
                 </div>
                 <div className="flex flex-wrap gap-2 py-1">
                    {formData.skills.map((s: string) => (
                       <span key={s} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[11px] font-medium text-[#1E1B4B] flex items-center gap-2">
                          {s} <X className="w-3 h-3 cursor-pointer opacity-40" onClick={() => removeSkill(s)} />
                       </span>
                    ))}
                 </div>
                 <div className="flex items-center flex-wrap gap-2 pt-1 text-[10px]">
                    <span className="text-slate-400">Tips:</span>
                    {["Team Leader", "Public Speaking"].map(s => (
                       <button key={s} onClick={() => !formData.skills.includes(s) && updateField("skills", [...formData.skills, s])} className="text-slate-500 underline decoration-dotted">+ {s}</button>
                    ))}
                 </div>
               </div>
               <div className="pt-6 space-y-4 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                     <h3 className="text-sm md:text-base font-semibold text-[#1E1B4B]">Screening Questions</h3>
                     <div className="flex gap-1 text-slate-400">
                        <button type="button" onClick={() => addQuestion("boolean")} className="p-1.5"><ToggleLeft className="w-4 h-4" /></button>
                        <button type="button" onClick={() => addQuestion("numeric")} className="p-1.5"><Hash className="w-4 h-4" /></button>
                        <button type="button" onClick={() => addQuestion("text")} className="p-1.5"><Plus className="w-4 h-4" /></button>
                     </div>
                  </div>
                  <div className="space-y-3">
                     {questions.map((q, i) => (
                        <div key={i} className="bg-slate-50/40 p-3 md:p-4 rounded-xl border border-slate-50 flex flex-col md:flex-row items-end gap-3 md:gap-5">
                           <div className="w-full md:flex-1 space-y-1.5 min-w-0 text-left">
                              <label className="text-[10px] text-slate-400 font-medium uppercase block">Question {i+1}</label>
                              <Input value={q.question} onChange={(e) => updateQuestion(i, "question", e.target.value)} className="h-10 bg-white border-slate-100 text-sm" />
                           </div>
                           <div className="w-full md:w-32 shrink-0 space-y-1.5 text-left">
                              <label className="text-[10px] text-slate-400 font-medium uppercase block">Value</label>
                              <select value={q.recruiter_answer} onChange={(e) => updateQuestion(i, "recruiter_answer", e.target.value)} className="w-full h-10 rounded-xl bg-white border-slate-100 px-3 text-xs outline-none">
                                 {q.question_type === 'boolean' ? <><option value="yes">Yes</option><option value="no">No</option></> : <option value="">...</option>}
                              </select>
                           </div>
                           <button onClick={() => removeQuestion(i)} className="p-2 text-rose-300"><Trash2 className="w-4 h-4" /></button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
            <h2 className="text-base md:text-lg font-semibold text-[#1E1B4B]">Salary & Benefits</h2>
            <div className="space-y-6 md:space-y-8">
               <div className="space-y-3">
                 <Label className="text-sm font-medium text-slate-700">Salary Range (Monthly)</Label>
                 <div className="grid grid-cols-2 gap-3 md:gap-4 items-center">
                    <Input value={formData.salary_min} onChange={(e) => updateField("salary_min", e.target.value)} placeholder="Min ₹" className="h-11 bg-slate-50 border-slate-100 text-xs md:text-sm" />
                    <Input value={formData.salary_max} onChange={(e) => updateField("salary_max", e.target.value)} placeholder="Max ₹" className="h-11 bg-slate-50 border-slate-100 text-xs md:text-sm" />
                 </div>
               </div>
               <div className="space-y-4">
                 <Label className="text-sm font-medium text-slate-700">Benefits</Label>
                 <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                    {benefitOptions.map(b => (
                       <label key={b} className="flex items-center gap-2 md:gap-2.5 p-3 md:p-3.5 rounded-xl border border-slate-50 bg-slate-50/30 text-left">
                          <input type="checkbox" checked={formData.benefits.includes(b)} onChange={() => toggleBenefit(b)} className="w-3.5 h-3.5 md:w-4 md:h-4 rounded" />
                          <span className="text-[10px] md:text-xs font-medium text-slate-600 line-clamp-1">{b}</span>
                       </label>
                    ))}
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-6 border-t border-slate-50">
                  <div className="space-y-2">
                     <Label className="text-xs md:text-sm font-medium text-slate-700">Application Deadline *</Label>
                     <DatePicker 
                        date={deadline} 
                        setDate={setDeadline} 
                        className="h-12 bg-slate-50 border-slate-50 focus:bg-white" 
                        placeholder="Select deadline date"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-xs md:text-sm font-medium text-slate-700">Number of Openings</Label>
                     <Input 
                        type="number" 
                        value={formData.vacancies} 
                        onChange={(e) => updateField("vacancies", e.target.value)} 
                        className="h-12 bg-slate-50 border-slate-50 text-sm" 
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
                        {formData.school_name || <span className="text-slate-200">Institution</span>} • {formData.location || <span className="text-slate-200">Location</span>}
                     </p>
                  </div>
                  <div className="px-4 py-1.5 bg-[#ECFDF5] text-[#059669] rounded-full text-[11px] md:text-xs font-bold uppercase tracking-wider shrink-0">
                     {formData.job_type.replace('_', ' ') || "Type"}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                  <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:border-slate-200">
                     <p className="text-[10px] md:text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">Salary</p>
                     <p className={cn("text-sm md:text-base font-bold", formData.salary_min ? "text-[#1E1B4B]" : "text-slate-300")}>
                        {formData.salary_min && formData.salary_max 
                          ? `₹${Number(formData.salary_min).toLocaleString()} – ₹${Number(formData.salary_max).toLocaleString()}` 
                          : "Not Disclosed"}
                     </p>
                  </div>
                  <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:border-slate-200">
                     <p className="text-[10px] md:text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">Experience</p>
                     <p className={cn("text-sm md:text-base font-bold", formData.experience_required ? "text-[#1E1B4B]" : "text-slate-300")}>
                        {formData.experience_required ? `${formData.experience_required} years` : "Not Specified"}
                     </p>
                  </div>
                  <div className="p-5 md:p-6 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:border-slate-200">
                     <p className="text-[10px] md:text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">Qualification</p>
                     <p className={cn("text-sm md:text-base font-bold truncate", formData.education_qualification ? "text-[#1E1B4B]" : "text-slate-300")}>
                        {formData.education_qualification || "Not Specified"}
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

               <div className="space-y-8 pt-4">
                  {formData.skills.length > 0 && (
                     <div className="space-y-4 animate-in slide-in-from-bottom-1">
                        <h4 className="text-sm md:text-base font-bold text-[#1E1B4B] tracking-tight">Skills</h4>
                        <div className="flex flex-wrap gap-2.5 md:gap-3">
                           {formData.skills.map((s: string) => (
                              <span key={s} className="px-4 py-2 bg-[#EEF2FF] text-[#4F46E5] rounded-full text-[11px] md:text-xs font-bold transition-all hover:bg-indigo-100">
                                 {s}
                              </span>
                           ))}
                        </div>
                     </div>
                  )}
                  {formData.benefits.length > 0 && (
                     <div className="space-y-4 animate-in slide-in-from-bottom-1">
                        <h4 className="text-sm md:text-base font-bold text-[#1E1B4B] tracking-tight">Benefits</h4>
                        <div className="flex flex-wrap gap-2.5 md:gap-3">
                           {formData.benefits.map((b: string) => (
                              <span key={b} className="px-4 py-2 bg-[#F0FDF4] text-[#059669] rounded-full text-[11px] md:text-xs font-bold transition-all hover:bg-emerald-100">
                                 {b}
                              </span>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>
        )}
      </div>

      {/* Navigation Footer - Responsive Buttons */}
      <div className="flex items-center justify-between pt-8 border-t border-slate-50 gap-4">
        <Button 
          variant="outline" 
          onClick={handleBack}
          disabled={currentStep === 1 || loading}
          className={cn(
            "h-11 px-6 md:px-8 rounded-xl text-sm font-medium border-slate-200 text-slate-500 bg-white hover:bg-slate-50 transition-all",
            currentStep === 1 && "invisible"
          )}
        >
          Back
        </Button>

        <div className="flex-1 md:flex-none flex justify-end gap-3">
          {currentStep < 5 ? (
            <Button 
              onClick={handleNext} 
              className="h-11 w-full md:w-auto px-10 rounded-xl bg-[#1E3A8A] hover:bg-[#1E1B4B] text-white text-sm font-medium transition-all shadow-sm"
            >
              Continue
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="h-11 w-full md:w-auto px-12 rounded-xl bg-[#1E3A8A] hover:bg-[#1E1B4B] text-white text-sm font-medium shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEdit ? "Update" : "Publish"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
