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

    const endpoint = type === 'filled' 
      ? `employer/jobs/${job.id}/filled` 
      : `employer/jobs/delete/${job.id}`;

    setLoadingAction(type);
    try {
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
    <div className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:bg-slate-50/50 group overflow-hidden relative">
       <div className="absolute top-0 right-0 w-12 h-12 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity -mr-6 -mt-6 rounded-full" />
       <div className={cn(
         "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-inner transition-transform group-hover:scale-105 relative z-10", 
         colorClass || "bg-primary/5 text-primary border-primary/10"
       )}>
          <Icon className="w-5 h-5" />
       </div>
       <div className="min-w-0 space-y-0.5 relative z-10 pt-0.5">
          <p className="text-[10px] font-medium text-slate-400 leading-none">{label}</p>
          <p className="text-sm font-semibold text-slate-900 leading-tight truncate">{value}</p>
       </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4 pb-20 font-sans text-slate-700 overflow-x-hidden">
      {/* Refined Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/20 transition-all duration-700" />
         
         <div className="space-y-2 relative">
            <button 
              onClick={() => window.history.back()} 
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary transition-all mb-1 active:scale-95"
            >
               <ChevronLeft className="w-3.5 h-3.5 text-primary" /> Back to listings
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 leading-tight">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
               <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                 <MapPin className="w-3.5 h-3.5 text-emerald-500" /> {job.location}
               </span>
               <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100/50">
                 {job.job_type?.replace('_', ' ')}
               </span>
               <span className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium border shadow-sm",
                  job.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
               )}>
                  {job.status}
               </span>
            </div>
         </div>

         <div className="flex items-center gap-2 relative">
            <Link href={`/dashboard/employer/jobs/view/${job.id}/applicants`}>
               <Button variant="outline" size="sm" className="h-10 px-5 rounded-xl text-xs font-semibold text-indigo-600 border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition-all shadow-sm">
                  <Users className="w-3.5 h-3.5 mr-2" /> Applicants
               </Button>
            </Link>
            {job.job_status !== 'filled' && (
              <Link href={`/dashboard/employer/jobs/edit/${job.id}`}>
                 <Button variant="outline" size="sm" className="h-10 px-5 rounded-xl text-xs font-semibold border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
                    <Edit3 className="w-3.5 h-3.5 mr-2" /> Edit
                 </Button>
              </Link>
            )}
            <Link href={`/jobs/${job.slug}`} target="_blank">
               <Button size="sm" className="h-10 px-6 rounded-xl text-xs font-semibold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] text-white">
                  Live preview <ExternalLink className="w-3.5 h-3.5 ml-2" />
               </Button>
            </Link>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
         {/* Main Content Area */}
         <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
               <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                          <FileText className="w-5 h-5" />
                       </div>
                       <h2 className="text-sm font-semibold text-slate-900">Requirement brief</h2>
                    </div>
                  </div>
                  
                  <div 
                    className="prose prose-sm max-w-none text-slate-600 leading-relaxed font-medium tiptap-preview px-1"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
               </div>

               {questions && questions.length > 0 && (
                 <div className="bg-slate-50/20 p-6 space-y-5 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-inner">
                          <Sparkles className="w-5 h-5" />
                       </div>
                       <h2 className="text-sm font-semibold text-slate-900">Screening questionnaire</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                       {questions.map((q, idx) => (
                         <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 group transition-all hover:border-primary/20 shadow-sm">
                             <div className="flex items-center gap-4">
                                <span className="w-6 h-6 rounded-lg flex items-center justify-center bg-slate-50 text-[11px] font-semibold text-slate-400 border border-slate-100 shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                  {idx + 1}
                                </span>
                                <p className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors">
                                  {q.question}
                                </p>
                             </div>
                             <div className="flex items-center gap-5 border-l border-slate-100 pl-5 py-0.5 sm:py-0 shrink-0">
                                <div className="space-y-0.5">
                                   <p className="text-[10px] font-medium text-slate-400 leading-none">Ideal answer</p>
                                   <span className="text-xs font-semibold text-primary capitalize">{q.recruiter_answer}</span>
                                 </div>
                                 <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-[10px] font-semibold text-emerald-600">
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

         {/* Sidebar Stats */}
         <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
               <DetailItem 
                  label="Category" 
                  value={job.category?.name || "General Teaching"} 
                  icon={Layers} 
                  colorClass="bg-blue-50 text-blue-600 border-blue-100"
               />
               <DetailItem 
                  label="Vacancies" 
                  value={`${job.vacancies} Positions`} 
                  icon={Users} 
                  colorClass="bg-indigo-50 text-indigo-600 border-indigo-100"
               />
               <DetailItem 
                  label="Annual salary" 
                  value={`₹${(job.salary_min || '0').split('.')[0]} - ₹${(job.salary_max || '0').split('.')[0]}`} 
                  icon={DollarSign} 
                  colorClass="bg-emerald-50 text-emerald-600 border-emerald-100"
               />
               <DetailItem 
                  label="Experience req." 
                  value={`${job.experience_required}y (${job.experience_type})`} 
                  icon={Briefcase} 
                  colorClass="bg-purple-50 text-purple-600 border-purple-100"
               />
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5 relative overflow-hidden">
               <div className="absolute bottom-0 right-0 w-24 h-24 bg-slate-50 opacity-40 rounded-full -mb-12 -mr-12" />
               <div className="flex items-center gap-2 mb-1 relative z-10 border-l-2 border-primary pl-3">
                  <h3 className="text-xs font-semibold text-slate-900">Job milestones</h3>
               </div>
               
               <div className="space-y-4 relative z-10">
                  {[
                    { label: 'Posted on', value: new Date(job.created_at).toLocaleDateString(), icon: Calendar, color: 'blue' },
                    { label: 'Expires on', value: job.expires_at ? new Date(job.expires_at).toLocaleDateString() : "Rolling", icon: Clock, color: 'amber' },
                    { label: 'Job status', value: job.job_status, icon: CheckCircle2, color: 'emerald' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between group/row">
                       <p className="text-[11px] font-medium text-slate-400 group-hover/row:text-slate-600 transition-colors">{item.label}</p>
                       <div className="flex items-center gap-2">
                          <item.icon className={cn(
                            "w-3.5 h-3.5",
                            item.color === 'blue' && "text-blue-400",
                            item.color === 'amber' && "text-amber-400",
                            item.color === 'emerald' && "text-emerald-400"
                          )} />
                          <p className={cn(
                            "text-xs font-semibold px-2.5 py-1 rounded-lg border shadow-sm",
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

               <div className="pt-6 border-t border-slate-50 mt-2 space-y-3 relative z-10">
                  {job.job_status !== 'filled' && (
                    <Button 
                      onClick={() => handleAction('filled')}
                      disabled={!!loadingAction}
                      variant="outline" 
                      className="w-full h-11 rounded-xl text-xs font-semibold text-emerald-600 border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                    >
                      {loadingAction === 'filled' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      Close position
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => handleAction('delete')}
                    disabled={!!loadingAction}
                    variant="outline" 
                    className="w-full h-11 rounded-xl text-xs font-semibold text-red-500 border-red-50 bg-red-50/10 hover:bg-red-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    {loadingAction === 'delete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-red-500" />}
                    Delete job listing
                  </Button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
