"use client";

import { useState } from "react";
import { 
  Briefcase, 
  Tag, 
  MapPin, 
  DollarSign, 
  ChevronRight, 
  PlusCircle, 
  Loader2,
  FileText,
  Clock,
  Layers,
  Sparkles,
  Save,
  Trash2,
  ListTodo,
  HelpCircle,
  ToggleLeft,
  Hash
} from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { Label } from "@/shared/ui/Label/Label";
import { TipTapEditor } from "@/shared/ui/TipTapEditor/TipTapEditor";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";

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
}

export default function PostJobClient({ metadata }: PostJobClientProps) {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);

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
      questions: questions,
    };

    try {
      const result = await dashboardServerFetch("employer/jobs/create", {
        method: "PUT",
        data,
      });

      if (result.status === true) {
        alert("Job posted successfully!");
        window.location.href = "/dashboard/employer/jobs";
      } else {
        alert(result.message || "Failed to post job. Please check all fields.");
      }
    } catch (error) {
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Launch new posting</h1>
            <p className="text-xs text-gray-500 font-medium">Create a new opportunity for teaching professionals.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border font-bold">
           <button type="button" className="px-4 py-1.5 rounded-lg text-xs text-primary bg-white shadow-sm border border-gray-200 flex items-center gap-2">
             <Layers className="w-3.5 h-3.5" />
             Core details
           </button>
           <button type="button" disabled className="px-4 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-2">
             <Sparkles className="w-3.5 h-3.5" />
             AI Filter
           </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-500 ml-0.5">Job Opportunity Title</Label>
                <div className="relative group">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <Input 
                    name="title" 
                    placeholder="e.g. Senior Physics Teacher" 
                    className="h-11 pl-10 rounded-lg text-sm font-medium" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-0.5">
                  <Label className="text-[10px] font-bold text-gray-500">Detailed job description</Label>
                  <span className="text-[8px] font-bold text-blue-500 tracking-tighter">Rich text editor enabled</span>
                </div>
                <TipTapEditor value={description} onChange={setDescription} />
              </div>
            </div>

            {/* Recruiter Questions Section */}
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6 flex flex-col">
              <div className="flex items-center justify-between border-b pb-4">
                 <div className="flex items-center gap-2 border-l-2 border-primary pl-3">
                    <ListTodo className="w-4 h-4 text-primary" />
                    <h2 className="text-xs font-bold text-gray-900">Mandatory recruiter questions</h2>
                 </div>
                 <div className="flex items-center gap-2 font-bold">
                    <Button type="button" size="sm" variant="outline" onClick={() => addQuestion("boolean")} className="h-7 px-3 text-[9px] rounded-lg border-gray-200">
                      <ToggleLeft className="w-3 h-3 mr-1" /> Add Yes/No
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => addQuestion("numeric")} className="h-7 px-3 text-[9px] rounded-lg border-gray-200">
                      <Hash className="w-3 h-3 mr-1" /> Add Numeric
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => addQuestion("text")} className="h-7 px-3 text-[9px] rounded-lg border-gray-200">
                      <FileText className="w-3 h-3 mr-1" /> Add Text
                    </Button>
                 </div>
              </div>

              <div className="space-y-4">
                {questions.length === 0 ? (
                  <div className="py-10 text-center border-2 border-dashed rounded-xl border-gray-100 flex flex-col items-center gap-3">
                     <HelpCircle className="w-8 h-8 text-gray-200" />
                     <p className="text-xs text-gray-400 font-medium">Add questions to pre-filter candidates effectively.</p>
                  </div>
                ) : (
                  questions.map((q, i) => (
                    <div key={i} className="group bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3 relative">
                       <button onClick={() => removeQuestion(i)} type="button" className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                       </button>
                       <div className="space-y-1.5">
                          <Label className="text-[9px] font-bold text-gray-400">Question {i + 1} ({q.question_type})</Label>
                          <Input 
                            value={q.question} 
                            onChange={(e) => updateQuestion(i, "question", e.target.value)}
                            placeholder="e.g. Do you have experience with JEE coaching?" 
                            className="h-9 rounded-lg text-xs" 
                          />
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="space-y-1.5 flex-1">
                             <Label className="text-[9px] font-bold text-gray-400">Target answer</Label>
                             {q.question_type === "boolean" ? (
                               <select 
                                 value={q.recruiter_answer}
                                 onChange={(e) => updateQuestion(i, "recruiter_answer", e.target.value)}
                                 className="h-9 w-full rounded-lg border bg-white px-3 text-xs outline-none"
                               >
                                  <option value="yes">Yes</option>
                                  <option value="no">No</option>
                               </select>
                             ) : q.question_type === "numeric" ? (
                               <Input 
                                 type="number"
                                 value={q.recruiter_answer}
                                 onChange={(e) => updateQuestion(i, "recruiter_answer", e.target.value)}
                                 placeholder="e.g. 5"
                                 className="h-9 rounded-lg text-xs"
                               />
                             ) : (
                               <Input 
                                 value={q.recruiter_answer}
                                 onChange={(e) => updateQuestion(i, "recruiter_answer", e.target.value)}
                                 placeholder="e.g. Hyderabad"
                                 className="h-9 rounded-lg text-xs"
                               />
                             )}
                          </div>
                          <div className="flex-1" />
                       </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border shadow-sm p-5 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                 <Tag className="w-4 h-4 text-primary" />
                 <h2 className="text-xs font-bold text-gray-900">Basic information</h2>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-500 ml-0.5">Primary Category</Label>
                <select name="category_id" className="h-10 w-full rounded-lg border bg-white px-3 text-xs font-medium focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                  {metadata.categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-500 ml-0.5">Employment Style</Label>
                <select name="job_type" className="h-10 w-full rounded-lg border bg-white px-3 text-xs font-medium focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="contract">Contractual</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-gray-500 ml-0.5">Experience Type</Label>
                  <select name="experience_type" className="h-10 w-full rounded-lg border bg-white px-3 text-xs font-medium focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                    <option value="fresher">Fresher</option>
                    <option value="experienced">Experienced</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-gray-500 ml-0.5">Required (Years)</Label>
                  <Input name="experience_required" type="number" placeholder="5" className="h-10 rounded-lg text-sm" />
                </div>
              </div>
            </div>

            {/* Location dropdown from API */}
            <div className="bg-white rounded-xl border shadow-sm p-5 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                 <MapPin className="w-4 h-4 text-primary" />
                 <h2 className="text-xs font-bold text-gray-900">Workforce location</h2>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-500 ml-0.5">Primary Location</Label>
                <select name="location" className="h-10 w-full rounded-lg border bg-white px-3 text-xs font-medium focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                  {metadata.locations.map((loc, idx) => (
                    <option key={idx} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-5 space-y-5 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                 <DollarSign className="w-4 h-4 text-primary" />
                 <h2 className="text-xs font-bold text-gray-900">Logistics</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-gray-500 ml-0.5">Min (LPA)</Label>
                  <Input name="salary_min" type="number" placeholder="400000" className="h-10 rounded-lg text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-gray-500 ml-0.5">Max (LPA)</Label>
                  <Input name="salary_max" type="number" placeholder="1200000" className="h-10 rounded-lg text-sm" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-500 ml-0.5">Vacancies</Label>
                <Input name="vacancies" type="number" defaultValue="1" className="h-10 rounded-lg text-sm" required />
              </div>
            </div>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 font-bold">
           <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-medium tracking-wider">Posts instantly to candidate pool</span>
           </div>
           
           <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                type="button" 
                className="h-11 px-6 rounded-lg text-xs text-gray-400 border-gray-200 flex-1 sm:flex-initial"
                onClick={() => window.history.back()}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Discard
              </Button>
              <Button 
                size="sm" 
                type="submit" 
                disabled={loading} 
                className="h-11 px-10 rounded-lg text-xs shadow-lg shadow-primary/20 flex-1 sm:flex-initial min-w-[200px]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Publish Opportunity
                <ChevronRight className="w-4 h-4 ml-1 opacity-50" />
              </Button>
           </div>
        </div>
      </form>
    </div>
  );
}
