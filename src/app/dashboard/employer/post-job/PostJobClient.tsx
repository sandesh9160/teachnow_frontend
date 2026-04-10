"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  Briefcase, 
  Tag, 
  MapPin, 
  ChevronRight, 
  PlusCircle, 
  Loader2,
  Clock,
  Layers,
  Sparkles,
  Save,
  Trash2,
  ListTodo,
  HelpCircle,
  ToggleLeft,
  Hash,
  DollarSign,
  Edit3,
  Users,
  ChevronLeft,
  RefreshCw,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import { TipTapEditor } from "@/shared/ui/TipTapEditor/TipTapEditor";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { cn } from "@/lib/utils";

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
  // Resolve core job metadata and screening questions
  const job = isEdit ? initialData?.job : initialData;
  const initialQuestions = isEdit ? (initialData?.questions || job?.questions || []) : [];

  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState(job?.description || "");
  const [featured, setFeatured] = useState(job?.featured === 1);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  const addQuestion = (type: "boolean" | "numeric" | "text") => {
    setQuestions([
      ...questions,
      { 
        question: "", 
        question_type: type, 
        recruiter_answer: type === "boolean" ? "yes" : "" 
      }
    ]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, field: keyof Question, val: string) => {
    const newQuestions = [...questions];
    newQuestions[idx] = { ...newQuestions[idx], [field]: val };
    setQuestions(newQuestions);
  };

  const moveQuestion = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === questions.length - 1) return;
    const newQuestions = [...questions];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newQuestions[idx], newQuestions[targetIdx]] = [newQuestions[targetIdx], newQuestions[idx]];
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
      const data = {
      title: formData.get("title"),
      description: description,
      category_id: formData.get("category_id"),
      salary_min: formData.get("salary_min"),
      salary_max: formData.get("salary_max"),
      vacancies: formData.get("vacancies"),
      location: formData.get("location"),
      experience_type: formData.get("experience_type"),
      experience_required: formData.get("experience_required"),
      job_type: formData.get("job_type"),
      gender: formData.get("gender"),
      deadline: formData.get("deadline"),
      featured: featured ? 1 : 0,
      questions: questions,
    };

    try {
      const endpoint = isEdit 
        ? `employer/jobs/update/${job?.id}` 
        : "employer/jobs/create";

      const result = await dashboardServerFetch(endpoint, {
        method: isEdit ? "PUT" : "POST",
        data,
      });

      if (result.status === true) {
        toast.success(result.message || (isEdit ? "Job updated successfully!" : "Job posted successfully!"));
        setTimeout(() => {
          window.location.href = `${basePath}/jobs`;
        }, 1200);
      } else {
        toast.error(result.message || "Something went wrong. Please check your inputs.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleRepublish = async () => {
    if (!confirm("Are you sure you want to republish this job? It will be active for another 30 days.")) return;
    
    setLoading(true);
    try {
      const result = await dashboardServerFetch(`employer/jobs/${job?.id}/republish`, {
        method: "PUT",
      });

      if (result.status === true) {
        toast.success("Job republished successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        toast.error(result.message || "Failed to republish job.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while republishing.");
    } finally {
      setLoading(false);
    }
  };

  const isExpired = isEdit && (
    job?.status?.toLowerCase() === 'expired' || 
    job?.job_status?.toLowerCase() === 'expired' ||
    (job?.expires_at && new Date(job.expires_at) < new Date())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-4 font-sans text-slate-700 pb-20">
      {/* Back Button */}
      <button 
        onClick={() => window.history.back()} 
        className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-primary transition-colors mb-2 group w-fit active:scale-95"
      >
        <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Overview
      </button>

      {/* Professional Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className={cn(
             "w-12 h-12 rounded-xl flex items-center justify-center border transition-all shadow-inner shrink-0",
             isEdit ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-primary/5 text-primary border-primary/10"
          )}>
            {isEdit ? <Edit3 className="w-6 h-6" /> : <PlusCircle className="w-6 h-6" />}
          </div>
          <div className="space-y-0.5 min-w-0">
            <h1 className="text-lg font-semibold text-slate-900 truncate">
              {isEdit ? "Edit your job" : "Create a job post"}
            </h1>
            <p className="text-xs text-slate-400 truncate">
              {isEdit ? `Updating: ${job?.title}` : "Fill in the details to find the best teachers."}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 bg-slate-50/50 p-1 rounded-xl border border-slate-100 w-full sm:w-auto">
           <button type="button" className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-medium text-primary bg-white shadow-sm border border-slate-200 flex items-center justify-center gap-2">
             <Layers className="w-4 h-4" /> <span className="sm:inline">Details</span>
           </button>
           <button type="button" disabled className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 cursor-not-allowed opacity-50">
             <Sparkles className="w-4 h-4" /> <span className="sm:inline">AI assistant</span>
           </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Detailed Content Hub */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-400 ml-0.5">Job title</Label>
                <div className="relative group">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <input type="hidden" name="id" value={job?.id} />
                  <Input 
                    name="title" 
                    defaultValue={job?.title}
                    placeholder="e.g. Senior Physics Teacher" 
                    className="h-12 pl-11 rounded-xl border-gray-100 text-sm font-medium focus:ring-1 focus:ring-primary/10" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-0.5">
                  <Label className="text-xs font-medium text-slate-400">Job description</Label>
                  <span className="text-[10px] font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Editor active</span>
                </div>
                <div className="min-h-[300px] border border-slate-100 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary/10 transition-all">
                  <TipTapEditor value={description} onChange={setDescription} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-50 p-4 sm:p-5 bg-slate-50/30 gap-4">
                 <div className="flex items-center gap-2 border-l-2 border-primary pl-3">
                    <ListTodo className="w-4.5 h-4.5 text-primary" />
                    <h2 className="text-sm font-semibold text-slate-900">Screening questions</h2>
                 </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                    <Button type="button" size="sm" variant="outline" onClick={() => addQuestion("boolean")} className="h-8 px-3 text-[11px] rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50 transition-all bg-white shrink-0">
                      <ToggleLeft className="w-3.5 h-3.5 mr-1.5" /> Yes/No
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => addQuestion("numeric")} className="h-8 px-3 text-[11px] rounded-xl border-blue-100 text-blue-600 hover:bg-blue-50 transition-all bg-white shrink-0">
                      <Hash className="w-3.5 h-3.5 mr-1.5" /> Number
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => addQuestion("text")} className="h-8 px-3 text-[11px] rounded-xl border-emerald-100 text-emerald-600 hover:bg-emerald-50 transition-all bg-white shrink-0">
                      <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Text
                    </Button>
                  </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                {questions.length === 0 ? (
                  <div className="py-12 text-center border border-dashed rounded-2xl border-slate-100 flex flex-col items-center gap-3 bg-slate-50/30">
                     <HelpCircle className="w-8 h-8 text-slate-100" />
                     <div className="space-y-1">
                       <p className="text-sm font-semibold text-slate-400">No questions added</p>
                       <p className="text-xs text-slate-300">Add filters to sort through applicants faster.</p>
                     </div>
                  </div>
                ) : (
                  questions.map((q, i) => (
                     <div key={i} className="group bg-slate-50/50 rounded-xl border border-slate-100 overflow-hidden hover:border-primary/20 transition-all shadow-sm">
                        {/* Question Header Actions */}
                        <div className="px-4 py-2.5 bg-slate-100/30 border-b border-slate-50 flex items-center justify-between gap-4">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Question {i + 1} — {q.question_type}</span>
                           
                           <div className="flex items-center gap-1.5">
                              {/* Move Controls */}
                              <div className="flex items-center bg-white border border-slate-100 rounded-lg overflow-hidden shadow-sm shrink-0">
                                 <button 
                                   onClick={() => moveQuestion(i, 'up')} 
                                   disabled={i === 0}
                                   type="button" 
                                   className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-primary disabled:opacity-30 transition-colors border-r border-slate-50"
                                 >
                                    <ArrowUp className="w-3 h-3" />
                                 </button>
                                 <button 
                                   onClick={() => moveQuestion(i, 'down')} 
                                   disabled={i === questions.length - 1}
                                   type="button" 
                                   className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-primary disabled:opacity-30 transition-colors"
                                 >
                                    <ArrowDown className="w-3 h-3" />
                                 </button>
                              </div>

                              <button 
                                onClick={() => addQuestion(q.question_type)} 
                                title={`Add another ${q.question_type} question`}
                                type="button" 
                                className="w-7 h-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-indigo-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-sm transition-all active:scale-90 shadow-sm"
                              >
                                 <PlusCircle className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => removeQuestion(i)} 
                                title="Remove question"
                                type="button" 
                                className="w-7 h-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-rose-300 hover:text-rose-500 hover:border-rose-100 hover:shadow-sm transition-all active:scale-90 shadow-sm"
                              >
                                 <Trash2 className="w-3.5 h-3.5" />
                              </button>
                           </div>
                        </div>

                        <div className="p-4 space-y-4">
                           <div className="space-y-2">
                              <Label className="text-[10px] font-medium text-slate-400">Statement</Label>
                              <Input 
                                value={q.question} 
                                onChange={(e) => updateQuestion(i, "question", e.target.value)}
                                placeholder="e.g. Do you have experience with JEE coaching?" 
                                className="h-10 rounded-xl text-sm font-medium border-slate-50 bg-white" 
                              />
                           </div>
                       <div className="flex items-center gap-4">
                          <div className="space-y-2 flex-1 max-w-[240px]">
                             <Label className="text-[10px] font-medium text-slate-400">Correct criteria</Label>
                             {q.question_type === "boolean" ? (
                               <select 
                                 value={q.recruiter_answer}
                                 onChange={(e) => updateQuestion(i, "recruiter_answer", e.target.value)}
                                 className="h-10 w-full rounded-xl border border-slate-100 bg-white px-3 text-xs font-semibold outline-none cursor-pointer focus:ring-1 focus:ring-primary/10 transition-all"
                               >
                                  <option value="yes">Must be Yes</option>
                                  <option value="no">Must be No</option>
                               </select>
                             ) : q.question_type === "numeric" ? (
                               <Input 
                                 type="number"
                                 value={q.recruiter_answer}
                                 onChange={(e) => updateQuestion(i, "recruiter_answer", e.target.value)}
                                 placeholder="Threshold"
                                 className="h-10 rounded-xl text-sm font-medium"
                               />
                             ) : (
                               <Input 
                                 value={q.recruiter_answer}
                                 onChange={(e) => updateQuestion(i, "recruiter_answer", e.target.value)}
                                 placeholder="Expected answer"
                                 className="h-10 rounded-xl text-sm font-medium"
                               />
                             )}
                          </div>
                        </div>
                     </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Logistics Tracking Sidebar */}
          <div className="space-y-5">
            {/* Featured Job Promotion */}
            <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-4 sm:p-5 overflow-hidden relative group transition-all hover:shadow-md">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner transition-colors",
                    featured ? "bg-amber-500 text-white border-amber-600" : "bg-slate-50 text-slate-300 border-slate-100"
                  )}>
                    <Sparkles className={cn("w-5 h-5", featured && "fill-white/20")} />
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs font-bold text-slate-900 cursor-pointer" htmlFor="featured-toggle">Featured Job</Label>
                    <p className="text-[10px] text-amber-600 font-medium">Appear on top of search</p>
                  </div>
                </div>
                <input 
                  id="featured-toggle"
                  type="checkbox" 
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-amber-300 text-amber-500 focus:ring-amber-500 cursor-pointer transition-all active:scale-90"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-6 space-y-6">
              <div className="flex items-center gap-2 border-l-2 border-indigo-500 pl-3">
                 <Tag className="w-4.5 h-4.5 text-indigo-500" />
                 <h2 className="text-sm font-semibold text-slate-900">Basic information</h2>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-400">Category</Label>
                <select 
                  name="category_id" 
                  defaultValue={job?.category_id || ""}
                  className="h-11 w-full rounded-xl border border-slate-100 bg-white px-3 text-xs font-semibold focus:ring-1 focus:ring-primary outline-none cursor-pointer group-hover:bg-slate-50 transition-all"
                  required
                >
                  <option value="" disabled>Select category</option>
                  {metadata.categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-400">Job type</Label>
                <select 
                  name="job_type" 
                  defaultValue={job?.job_type || ""}
                  className="h-11 w-full rounded-xl border border-slate-100 bg-white px-3 text-xs font-semibold focus:ring-1 focus:ring-primary outline-none cursor-pointer transition-all"
                  required
                >
                  <option value="" disabled>Select job type</option>
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-400">Requirement</Label>
                   <select 
                    name="experience_type" 
                    defaultValue={job?.experience_type || ""}
                    className="h-11 w-full rounded-xl border border-slate-100 bg-white px-3 text-xs font-semibold focus:ring-1 focus:ring-primary outline-none cursor-pointer transition-all"
                    required
                  >
                    <option value="" disabled>Select</option>
                    <option value="fresher">Fresher</option>
                    <option value="experienced">Experienced</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-400">Years req.</Label>
                  <Input 
                    name="experience_required" 
                    type="number" 
                    defaultValue={job?.experience_required}
                    placeholder="5" 
                    className="h-11 rounded-xl text-sm font-medium" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-400">Gender</Label>
                  <select 
                    name="gender" 
                    defaultValue={job?.gender || "both"}
                    className="h-11 w-full rounded-xl border border-slate-100 bg-white px-3 text-xs font-semibold focus:ring-1 focus:ring-primary outline-none cursor-pointer transition-all"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-400">Deadline</Label>
                  <Input 
                    name="deadline" 
                    type="date" 
                    defaultValue={job?.deadline || job?.application_deadline}
                    className="h-11 rounded-xl text-xs font-medium" 
                    required
                  />
                </div>
              </div>

            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-6 space-y-6">
              <div className="flex items-center gap-2 border-l-2 border-emerald-500 pl-3">
                 <MapPin className="w-4.5 h-4.5 text-emerald-500" />
                 <h2 className="text-sm font-semibold text-slate-900">Location</h2>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-400">Work location</Label>
                <select 
                  name="location" 
                  defaultValue={job?.location || ""}
                  className="h-11 w-full rounded-xl border border-slate-100 bg-white px-3 text-xs font-semibold focus:ring-1 focus:ring-primary outline-none cursor-pointer transition-all"
                  required
                >
                  <option value="" disabled>Select location</option>
                  {metadata.locations.map((loc, idx) => (
                    <option key={idx} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-6 space-y-6">
              <div className="flex items-center gap-2 border-l-2 border-amber-500 pl-3">
                 <DollarSign className="w-4.5 h-4.5 text-amber-500" />
                 <h2 className="text-sm font-semibold text-slate-900">Salary & openings</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-400">Min salary</Label>
                  <Input 
                    name="salary_min" 
                    type="number" 
                    defaultValue={job?.salary_min?.split('.')[0]}
                    placeholder="400,000" 
                    className="h-11 rounded-xl text-sm font-semibold" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-400">Max salary</Label>
                  <Input 
                    name="salary_max" 
                    type="number" 
                    defaultValue={job?.salary_max?.split('.')[0]}
                    placeholder="1,200,000" 
                    className="h-11 rounded-xl text-sm font-semibold" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-400">Number of openings</Label>
                <div className="relative">
                   <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-200" />
                   <Input 
                     name="vacancies" 
                     type="number" 
                     defaultValue={job?.vacancies || 1} 
                     className="h-11 pl-11 rounded-xl text-sm font-semibold bg-slate-50/30" 
                     required 
                   />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Center Footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-5 font-medium pb-24">
           <div className="flex items-center gap-3 text-slate-400 bg-slate-50/50 px-4 py-2 rounded-full border border-slate-100">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span className="text-[11px] font-semibold leading-none tracking-tight">Your job goes live instantly</span>
           </div>
           
           <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                type="button" 
                className="h-12 w-full sm:w-auto px-8 rounded-xl text-xs font-semibold text-slate-500 border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>

              {isExpired && (
                <Button 
                  size="sm" 
                  type="button" 
                  disabled={loading} 
                  onClick={handleRepublish}
                  className="h-12 w-full sm:w-auto px-10 rounded-xl text-xs font-bold shadow-lg bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10 transition-all active:scale-95 text-white"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  Republish job
                </Button>
              )}

              <Button 
                size="sm" 
                type="submit" 
                disabled={loading} 
                className={cn(
                  "h-12 w-full sm:w-auto px-12 rounded-xl text-xs font-bold shadow-xl transition-all active:scale-95 text-white",
                  isEdit ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/10" : "bg-primary hover:bg-primary/90 shadow-primary/20"
                )}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {isEdit ? "Update job details" : "Post this job now"}
                <ChevronRight className="w-4.5 h-4.5 ml-2 opacity-30" />
              </Button>
           </div>
        </div>
      </form>
    </div>
  );
}
