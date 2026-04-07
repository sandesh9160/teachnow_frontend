"use client";

import { useState } from "react";
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
  FileText,
  DollarSign,
  Edit3,
  Users
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
        alert(isEdit ? "Job updated successfully!" : "Job posted successfully!");
        window.location.href = `${basePath}/jobs`;
      } else {
        alert(result.message || "Something went wrong. Please check your inputs.");
      }
    } catch (error) {
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-4 font-sans">
      {/* Professional Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className={cn(
             "w-10 h-10 rounded-lg flex items-center justify-center border transition-all",
             isEdit ? "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-600/5 shadow-inner" : "bg-primary/5 text-primary border-primary/10"
          )}>
            {isEdit ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">
              {isEdit ? "Edit Your Job" : "Create a Job Post"}
            </h1>
            <p className="text-[11px] font-semibold text-gray-400 capitalize">
              {isEdit ? `Updating: ${job?.title}` : "Fill in the details to find the best teachers."}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 bg-gray-50/50 p-1 rounded-xl border border-gray-100 font-bold text-gray-300">
           <button type="button" className="px-4 py-1.5 rounded-lg text-[10px] text-primary bg-white shadow-sm border border-gray-200 flex items-center gap-2">
             <Layers className="w-3.5 h-3.5" /> Job Details
           </button>
           <button type="button" disabled className="px-4 py-1.5 rounded-lg text-[10px] flex items-center gap-2 cursor-not-allowed">
             <Sparkles className="w-3.5 h-3.5" /> AI Assistant
           </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Detailed Content Hub */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-400 ml-0.5 uppercase tracking-wider">Job Title</Label>
                <div className="relative group">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary transition-colors" />
                  <input type="hidden" name="id" value={job?.id} />
                  <Input 
                    name="title" 
                    defaultValue={job?.title}
                    placeholder="e.g. Senior Physics Teacher" 
                    className="h-10 pl-10 rounded-lg text-sm border-gray-100 focus:bg-gray-50/20" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-0.5">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Job Description</Label>
                  <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">Bold text supported</span>
                </div>
                <TipTapEditor value={description} onChange={setDescription} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b border-gray-50 p-5 bg-gray-50/30">
                 <div className="flex items-center gap-2 border-l-3 border-primary pl-3">
                    <ListTodo className="w-4 h-4 text-primary" />
                    <h2 className="text-xs font-bold text-gray-900 tracking-tight">Interview Questions</h2>
                 </div>
                 <div className="flex items-center gap-1.5 font-bold">
                    <Button type="button" size="sm" variant="outline" onClick={() => addQuestion("boolean")} className="h-7 px-2.5 text-[9px] rounded-lg border-gray-200 hover:bg-white transition-all bg-white/50">
                      <ToggleLeft className="w-3 h-3 mr-1" /> Add Yes/No
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => addQuestion("numeric")} className="h-7 px-2.5 text-[9px] rounded-lg border-gray-200 hover:bg-white transition-all bg-white/50">
                      <Hash className="w-3 h-3 mr-1" /> Add Number
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => addQuestion("text")} className="h-7 px-2.5 text-[9px] rounded-lg border-gray-200 hover:bg-white transition-all bg-white/50">
                      <PlusCircle className="w-3 h-3 mr-1" /> Add Text
                    </Button>
                 </div>
              </div>

              <div className="p-5 space-y-3">
                {questions.length === 0 ? (
                  <div className="py-8 text-center border border-dashed rounded-xl border-gray-100 flex flex-col items-center gap-2 bg-gray-50/20">
                     <HelpCircle className="w-6 h-6 text-gray-200" />
                     <p className="text-[10px] font-bold text-gray-400">Add some questions to filter out applicants faster.</p>
                  </div>
                ) : (
                  questions.map((q, i) => (
                    <div key={i} className="group bg-gray-50/20 p-3.5 rounded-xl border border-gray-100 space-y-3 relative hover:border-primary/20 transition-all">
                       <button onClick={() => removeQuestion(i)} type="button" className="absolute top-4 right-4 text-gray-200 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                       </button>
                       <div className="space-y-1.5">
                          <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Question {i + 1} ({q.question_type})</Label>
                          <Input 
                            value={q.question} 
                            onChange={(e) => updateQuestion(i, "question", e.target.value)}
                            placeholder="e.g. Do you have experience with JEE coaching?" 
                            className="h-8.5 rounded-lg text-xs" 
                          />
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="space-y-1.5 flex-1 max-w-[200px]">
                             <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Correct Answer</Label>
                             {q.question_type === "boolean" ? (
                               <select 
                                 value={q.recruiter_answer}
                                 onChange={(e) => updateQuestion(i, "recruiter_answer", e.target.value)}
                                 className="h-8.5 w-full rounded-lg border border-gray-100 bg-white px-3 text-[11px] font-bold outline-none cursor-pointer"
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
                                 className="h-8.5 rounded-lg text-xs"
                               />
                             ) : (
                               <Input 
                                 value={q.recruiter_answer}
                                 onChange={(e) => updateQuestion(i, "recruiter_answer", e.target.value)}
                                 placeholder="Expected criteria"
                                 className="h-8.5 rounded-lg text-xs"
                               />
                             )}
                          </div>
                       </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Logistics Tracking Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-5">
              <div className="flex items-center gap-2 border-l-3 border-indigo-500 pl-3">
                 <Tag className="w-4 h-4 text-indigo-500" />
                 <h2 className="text-xs font-bold text-gray-900 tracking-tight">Basic Info</h2>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</Label>
                <select 
                  name="category_id" 
                  defaultValue={job?.category_id}
                  className="h-9 w-full rounded-lg border border-gray-100 bg-white px-3 text-[11px] font-bold focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                >
                  {metadata.categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Job Type</Label>
                <select 
                  name="job_type" 
                  defaultValue={job?.job_type}
                  className="h-9 w-full rounded-lg border border-gray-100 bg-white px-3 text-[11px] font-bold focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                >
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="contract">Project</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Experience</Label>
                  <select 
                    name="experience_type" 
                    defaultValue={job?.experience_type}
                    className="h-9 w-full rounded-lg border border-gray-100 bg-white px-3 text-[11px] font-bold focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                  >
                    <option value="fresher">Fresher</option>
                    <option value="experienced">Experienced</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Years Req.</Label>
                  <Input 
                    name="experience_required" 
                    type="number" 
                    defaultValue={job?.experience_required}
                    placeholder="5" 
                    className="h-9 rounded-lg text-xs" 
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1 border-t border-gray-50 mt-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50/50 border border-gray-100">
                   <div className="flex items-center gap-2">
                      <Sparkles className={cn("w-3.5 h-3.5", featured ? "text-amber-500" : "text-gray-200")} />
                      <Label className="text-[10px] font-bold text-gray-700 cursor-pointer" htmlFor="featured-toggle">Feature on Home Page</Label>
                   </div>
                   <input 
                     id="featured-toggle"
                     type="checkbox" 
                     checked={featured}
                     onChange={(e) => setFeatured(e.target.checked)}
                     className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                   />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2 border-l-3 border-emerald-500 pl-3">
                 <MapPin className="w-4 h-4 text-emerald-500" />
                 <h2 className="text-xs font-bold text-gray-900 tracking-tight">Location</h2>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Work Location</Label>
                <select 
                  name="location" 
                  defaultValue={job?.location}
                  className="h-9 w-full rounded-lg border border-gray-100 bg-white px-3 text-[11px] font-bold focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                >
                  {metadata.locations.map((loc, idx) => (
                    <option key={idx} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4 flex flex-col">
              <div className="flex items-center gap-2 border-l-3 border-amber-500 pl-3">
                 <DollarSign className="w-4 h-4 text-amber-500" />
                 <h2 className="text-xs font-bold text-gray-900 tracking-tight">Salary & Openings</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-xs tracking-tighter">Min Salary</Label>
                  <Input 
                    name="salary_min" 
                    type="number" 
                    defaultValue={job?.salary_min?.split('.')[0]}
                    placeholder="400000" 
                    className="h-9 rounded-lg text-xs font-bold" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-xs tracking-tighter">Max Salary</Label>
                  <Input 
                    name="salary_max" 
                    type="number" 
                    defaultValue={job?.salary_max?.split('.')[0]}
                    placeholder="1200000" 
                    className="h-9 rounded-lg text-xs font-bold" 
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Number of Openings</Label>
                <div className="relative">
                   <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-200" />
                   <Input 
                     name="vacancies" 
                     type="number" 
                     defaultValue={job?.vacancies || 1} 
                     className="h-9 pl-10 rounded-lg text-xs font-bold bg-gray-50/30" 
                     required 
                   />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Center Footer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-bold pb-20">
           <div className="flex items-center gap-3 text-gray-200">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Job goes live instantly</span>
           </div>
           
           <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                type="button" 
                className="h-10 px-6 rounded-lg text-[10px] font-bold text-gray-400 border-gray-100 hover:bg-gray-50 transition-all flex-1 sm:flex-initial"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                type="submit" 
                disabled={loading} 
                className={cn(
                  "h-10 px-10 rounded-lg text-[10px] font-bold tracking-wider shadow-lg flex-1 sm:flex-initial min-w-[200px] transition-all",
                  isEdit ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/10" : "shadow-primary/10"
                )}
              >
                {loading ? <Loader2 className="w-3 w-3 animate-spin mr-2" /> : <Save className="w-3.5 h-3.5 mr-2" />}
                {isEdit ? "Save Changes" : "Post This Job"}
                <ChevronRight className="w-3.5 h-3.5 ml-2 opacity-30" />
              </Button>
           </div>
        </div>
      </form>
    </div>
  );
}
