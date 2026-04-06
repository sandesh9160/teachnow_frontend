"use client";

import { 
  MapPin, 
  DollarSign, 
  Layout, 
  Edit3, 
  ChevronLeft,
  Users,
  FileText,
  Briefcase,
  Clock,
  Layers,
  Sparkles,
  Loader2,
  Trash2,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { cn } from "@/lib/utils";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";

interface JobPreviewClientProps {
  data: {
    job: any;
    questions?: any[];
  };
}

export default function JobPreviewClient({ data }: JobPreviewClientProps) {
  const { job, questions = [] } = data;
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (type: 'filled' | 'delete') => {
    if (!confirm(`Are you sure you want to ${type === 'filled' ? 'mark this job as filled' : 'permanently delete this job'}?`)) {
      return;
    }

    setLoadingAction(type);
    try {
      const endpoint = type === 'filled' 
        ? `employer/jobs/${job.id}/filled` 
        : `employer/jobs/delete/${job.id}`;
      
      const res = await dashboardServerFetch(endpoint, { 
        method: type === 'filled' ? "PUT" : "POST",
        data: {} // Ensure payload for PUT/POST
      });
      
      if (res.status === true) {
        alert(res.message || `Success: Job ${type === 'filled' ? 'closed' : 'deleted'}.`);
        window.location.href = "/dashboard/employer/jobs";
      } else {
        alert(res.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      alert("An unexpected error occurred.");
    } finally {
      setLoadingAction(null);
    }
  };

  const DetailItem = ({ label, value, icon: Icon, colorClass = "bg-primary/5 text-primary border-primary/10" }: any) => (
    <div className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:border-primary/20">
       <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border", colorClass)}>
          <Icon className="w-4.5 h-4.5" />
       </div>
       <div className="space-y-0.5">
          <p className="text-[10px] font-semibold text-gray-400 tracking-wide">{label}</p>
          <p className="text-sm font-semibold text-gray-900 leading-snug">{value}</p>
       </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 pb-20 font-sans">
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
         
         <div className="space-y-3 relative">
            <button 
              onClick={() => window.history.back()} 
              className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-primary transition-colors mb-1 uppercase tracking-widest"
            >
               <ChevronLeft className="w-3 h-3" /> Back to My Jobs
            </button>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500">
               <span className="flex items-center gap-1.5 text-primary/80 bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">
                 <MapPin className="w-3 h-3" /> {job.location}
               </span>
               <span className="text-gray-300">•</span>
               <span className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100 capitalize">
                 {job.job_type.replace('_', ' ')}
               </span>
               <span className="text-gray-300">•</span>
               <span className={cn(
                  "px-2 py-0.5 rounded-md font-bold text-[10px] border capitalize",
                  job.status === 'approved' ? "bg-green-50 text-green-600 border-green-100" : "bg-amber-50 text-amber-600 border-amber-100"
               )}>
                  {job.status}
               </span>
            </div>
         </div>

         <div className="flex items-center gap-2 relative">
            {job.job_status !== 'filled' && (
              <Link href={`/dashboard/employer/jobs/edit/${job.id}`}>
                 <Button variant="outline" size="sm" className="h-9 px-5 rounded-lg text-xs font-bold border-gray-200 hover:border-primary/30 hover:bg-primary/5 shadow-sm transition-all">
                    <Edit3 className="w-3.5 h-3.5 mr-2" /> Edit Job
                 </Button>
              </Link>
            )}
            <Link href={`/jobs/${job.slug}`} target="_blank">
               <Button size="sm" className="h-9 px-6 rounded-lg text-xs font-bold shadow-md shadow-primary/10">
                  Preview Job <ChevronLeft className="w-3.5 h-3.5 ml-2 rotate-180" />
               </Button>
            </Link>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Insight Section */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                          <FileText className="w-4 h-4" />
                       </div>
                       <h2 className="text-sm font-bold text-gray-900 tracking-tight">Job Summary</h2>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded uppercase tracking-wider">Public View</span>
                  </div>
                  
                  <div 
                    className="prose prose-sm max-w-none text-gray-600 leading-relaxed font-medium tiptap-preview px-1"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
               </div>

               {questions && questions.length > 0 && (
                 <div className="bg-gray-50/30 p-6 space-y-5 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                          <Sparkles className="w-4 h-4" />
                       </div>
                       <h2 className="text-sm font-bold text-gray-900 tracking-tight">Interview Questions</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                       {questions.map((q, idx) => (
                         <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 group transition-all hover:border-primary/20">
                            <div className="space-y-1">
                               <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded flex items-center justify-center bg-gray-100 text-[10px] font-bold text-gray-500">{idx + 1}</span>
                                  <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">{q.question}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-4 border-l border-gray-100 pl-4 shrink-0 bg-gray-50/50 p-2 rounded-lg">
                               <div className="space-y-0.5">
                                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Correct Answer</p>
                                  <span className="text-xs font-bold text-primary capitalize">{q.recruiter_answer}</span>
                               </div>
                               <div className="px-2 py-1 rounded bg-white border border-gray-100 text-[8px] font-bold uppercase tracking-wider text-gray-400">
                                  {q.question_type}
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               )}
            </div>
         </div>

         {/* Strategic Sidebar */}
         <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 space-y-1.5">
               <DetailItem 
                  label="Category" 
                  value={job.category?.name || "General Teaching"} 
                  icon={Layers} 
               />
               <DetailItem 
                  label="Who Can Apply" 
                  value={`${job.vacancies} Openings | ${job.gender}`} 
                  icon={Users} 
                  colorClass="bg-indigo-50 text-indigo-600 border-indigo-100"
               />
               <DetailItem 
                  label="Salary (LPA)" 
                  value={`₹${job.salary_min?.split('.')[0]} - ₹${job.salary_max?.split('.')[0]}`} 
                  icon={DollarSign} 
                  colorClass="bg-emerald-50 text-emerald-600 border-emerald-100"
               />
               <DetailItem 
                  label="Experience Needed" 
                  value={`${job.experience_required} Years (${job.experience_type})`} 
                  icon={Briefcase} 
                  colorClass="bg-blue-50 text-blue-600 border-blue-100"
               />
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 relative overflow-hidden">
               <div className="absolute bottom-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mb-12 -mr-12 opacity-50" />
               <div className="flex items-center gap-2 mb-1 relative">
                  <Clock className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold text-gray-900 tracking-tight">Dates & Status</h3>
               </div>
               
               <div className="space-y-4 relative">
                  <div className="flex items-center justify-between">
                     <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Posted On</p>
                     <p className="text-xs font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center justify-between">
                     <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Apply Before</p>
                     <p className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                       {job.expires_at ? new Date(job.expires_at).toLocaleDateString() : "No Deadline"}
                     </p>
                  </div>
                  <div className="flex items-center justify-between">
                     <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Current Status</p>
                     <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                       <p className="text-xs font-bold text-green-600 capitalize">{job.job_status}</p>
                     </div>
                  </div>
               </div>

               <div className="pt-4 border-t border-gray-50 mt-2 space-y-2">
                  {job.job_status !== 'filled' && (
                    <Button 
                      onClick={() => handleAction('filled')}
                      disabled={!!loadingAction}
                      variant="outline" 
                      className="w-full h-10 rounded-xl text-xs font-bold text-emerald-600 border-emerald-50 bg-emerald-50/10 hover:bg-emerald-50 transition-all"
                    >
                      {loadingAction === 'filled' ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-2" />}
                      Mark as Filled
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => handleAction('delete')}
                    disabled={!!loadingAction}
                    variant="outline" 
                    className="w-full h-10 rounded-xl text-xs font-bold text-gray-400 border-gray-100 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all"
                  >
                    {loadingAction === 'delete' ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Trash2 className="w-3.5 h-3.5 mr-2" />}
                    Delete This Job
                  </Button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
