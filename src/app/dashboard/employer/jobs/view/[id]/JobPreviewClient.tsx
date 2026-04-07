"use client";

import { 
  MapPin, 
  DollarSign, 
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
  CheckCircle2,
  ExternalLink,
  Calendar
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
        data: {}
      });
      
      if (res.status === true) {
        alert(res.message || `Success: Job ${type === 'filled' ? 'closed' : 'deleted'}.`);
        window.location.href = "/dashboard/employer/jobs";
      } else {
        alert(res.message || "Something went wrong.");
      }
    } catch (error) {
      alert("An unexpected error occurred.");
    } finally {
      setLoadingAction(null);
    }
  };

  const DetailItem = ({ label, value, icon: Icon, colorClass }: any) => (
    <div className="flex items-start gap-2.5 p-3 rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:bg-gray-50/50 group overflow-hidden relative">
       <div className="absolute top-0 right-0 w-12 h-12 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity -mr-6 -mt-6 rounded-full" />
       <div className={cn(
         "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-inner transition-transform group-hover:scale-110 relative z-10", 
         colorClass || "bg-primary/5 text-primary border-primary/10"
       )}>
          <Icon className="w-5 h-5" />
       </div>
       <div className="min-w-0 space-y-0.5 relative z-10 pt-0.5">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight leading-none">{label}</p>
          <p className="text-[11px] sm:text-xs font-bold text-gray-900 leading-tight truncate uppercase tracking-tight">{value}</p>
       </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4 pb-20 overflow-x-hidden">
      {/* Refined Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/20 transition-all duration-700" />
         
         <div className="space-y-2 relative">
            <button 
              onClick={() => window.history.back()} 
              className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 hover:text-primary transition-colors mb-1 uppercase tracking-tight hover:gap-2"
            >
               <ChevronLeft className="w-3 h-3" /> Back to listings
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-none uppercase">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-bold">
               <span className="flex items-center gap-1 text-gray-500 uppercase tracking-tight bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                 <MapPin className="w-3.5 h-3.5 text-slate-300" /> {job.location}
               </span>
               <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100/50 uppercase tracking-tight text-[9px] font-bold shadow-sm">
                 {job.job_type?.replace('_', ' ')}
               </span>
               <span className={cn(
                  "px-2 py-1 rounded-lg font-bold text-[9px] border uppercase tracking-tight shadow-sm",
                  job.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
               )}>
                  {job.status}
               </span>
            </div>
         </div>

         <div className="flex items-center gap-2 relative">
            {job.job_status !== 'filled' && (
              <Link href={`/dashboard/employer/jobs/edit/${job.id}`}>
                 <Button variant="outline" size="sm" className="h-9 px-5 rounded-xl text-[10px] font-bold uppercase tracking-tight border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
                    <Edit3 className="w-3.5 h-3.5 mr-2" /> Edit Requirement
                 </Button>
              </Link>
            )}
            <Link href={`/jobs/${job.slug}`} target="_blank">
               <Button size="sm" className="h-9 px-6 rounded-xl text-[10px] font-bold uppercase tracking-tight shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
                  Live Preview <ExternalLink className="w-3.5 h-3.5 ml-2" />
               </Button>
            </Link>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
         {/* Main Content Area */}
         <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-inner">
                          <FileText className="w-5 h-5" />
                       </div>
                       <h2 className="text-xs font-bold text-gray-900 uppercase tracking-tight">Full Requirement Brief</h2>
                    </div>
                  </div>
                  
                  <div 
                    className="prose prose-sm max-w-none text-slate-600 leading-relaxed font-bold tiptap-preview px-1 text-[12px] opacity-90 uppercase tracking-tight"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
               </div>

               {questions && questions.length > 0 && (
                 <div className="bg-slate-50/30 p-6 space-y-5 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-inner">
                          <Sparkles className="w-5 h-5" />
                       </div>
                       <h2 className="text-xs font-bold text-gray-900 uppercase tracking-tight">Pre-Screening Questionnaire</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                       {questions.map((q, idx) => (
                         <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 group transition-all hover:border-primary/20 shadow-sm">
                             <div className="flex items-center gap-4">
                                <span className="w-6 h-6 rounded-lg flex items-center justify-center bg-slate-50 text-[10px] font-bold text-slate-400 border border-slate-100 shrink-0 shadow-inner group-hover:bg-primary group-hover:text-white transition-colors">{idx + 1}</span>
                                <p className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors uppercase tracking-tight">{q.question}</p>
                             </div>
                             <div className="flex items-center gap-5 border-l border-slate-100 pl-5 py-0.5 sm:py-0 shrink-0">
                                <div className="space-y-0.5">
                                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight leading-none opacity-60">Ideal Answer</p>
                                   <span className="text-[10px] font-bold text-primary capitalize tracking-tight">{q.recruiter_answer}</span>
                                 </div>
                                 <div className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-[8px] font-bold uppercase tracking-tight text-emerald-600 shadow-sm">
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

         {/* Compact Sidebar */}
         <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
               <DetailItem 
                  label="Category" 
                  value={job.category?.name || "General Teaching"} 
                  icon={Layers} 
                  colorClass="bg-blue-50 text-blue-600 border-blue-100"
               />
               <DetailItem 
                  label="Vancancy Details" 
                  value={`${job.vacancies} Pos | ${job.gender}`} 
                  icon={Users} 
                  colorClass="bg-indigo-50 text-indigo-600 border-indigo-100"
               />
               <DetailItem 
                  label="Estimated LPA" 
                  value={`₹${(job.salary_min || '0').split('.')[0]} - ₹${(job.salary_max || '0').split('.')[0]}`} 
                  icon={DollarSign} 
                  colorClass="bg-emerald-50 text-emerald-600 border-emerald-100"
               />
               <DetailItem 
                  label="Min Experience" 
                  value={`${job.experience_required}y (${job.experience_type})`} 
                  icon={Briefcase} 
                  colorClass="bg-purple-50 text-purple-600 border-purple-100"
               />
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4 relative overflow-hidden">
               <div className="absolute bottom-0 right-0 w-20 h-20 bg-slate-50 opacity-40 rounded-full -mb-10 -mr-10" />
               <div className="flex items-center gap-2 mb-1 relative z-10">
                  <div className="w-2 h-2 rounded-full bg-primary shadow-sm" />
                  <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">Hiring Lifecycle</h3>
               </div>
               
               <div className="space-y-3 relative z-10">
                  {[
                    { label: 'Posted on', value: new Date(job.created_at).toLocaleDateString(), icon: Calendar, color: 'blue' },
                    { label: 'Deadline', value: job.expires_at ? new Date(job.expires_at).toLocaleDateString() : "Rolling", icon: Clock, color: 'amber' },
                    { label: 'Live State', value: job.job_status, icon: CheckCircle2, color: 'emerald' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between group/row">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight group-hover/row:text-slate-600 transition-colors">{item.label}</p>
                       <div className="flex items-center gap-2">
                          <item.icon className={cn(
                            "w-3 h-3",
                            item.color === 'blue' && "text-blue-400",
                            item.color === 'amber' && "text-amber-400",
                            item.color === 'emerald' && "text-emerald-400"
                          )} />
                          <p className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-tight shadow-sm",
                            item.color === 'blue' && "bg-blue-50 text-blue-600 border-blue-100",
                            item.color === 'amber' && "bg-amber-50 text-amber-600 border-amber-100",
                            item.color === 'emerald' && "bg-emerald-50 text-emerald-600 border-emerald-100"
                          )}>
                            {item.value}
                          </p>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="pt-5 border-t border-slate-100 mt-2 space-y-2.5 relative z-10">
                  {job.job_status !== 'filled' && (
                    <Button 
                      onClick={() => handleAction('filled')}
                      disabled={!!loadingAction}
                      variant="outline" 
                      className="w-full h-10 rounded-xl text-[10px] font-bold uppercase tracking-tight text-emerald-600 border-emerald-50 bg-emerald-50/20 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      {loadingAction === 'filled' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>Mark Position Filled</span>
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => handleAction('delete')}
                    disabled={!!loadingAction}
                    variant="outline" 
                    className="w-full h-10 rounded-xl text-[10px] font-bold uppercase tracking-tight text-slate-400 border-slate-100 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    {loadingAction === 'delete' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    <span>Delete Requirement</span>
                  </Button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
