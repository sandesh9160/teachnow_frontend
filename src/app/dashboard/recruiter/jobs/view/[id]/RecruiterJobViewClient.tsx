"use client";

import { useState } from "react";
import { 
  ArrowLeft, 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Mail, 
  Phone,
  ChevronDown,
  UserCheck,
  UserMinus,
  MessageSquare,
  Trash2,
  Share2,
  PhoneCall,
  UserPlus,
  Globe,
  Calendar as CalendarIcon,
  GraduationCap,
  Users,
  Activity
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { cn } from "@/lib/utils";

interface Skill {
  id: number;
  name: string;
}

interface Education {
  id: number;
  degree: string;
  institution: string;
  field_of_study: string;
  start_year: string;
  end_year: string;
  grade: string | null;
}

interface Experience {
  id: number;
  job_title: string;
  company_name: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_current: number;
  description: string;
}

interface Answer {
  id: number;
  candidate_answer: string;
  question: {
    question: string;
    recruiter_answer: string;
    question_type: string;
  } | string; // Handle both direct string and object format
}

interface JobSeeker {
  id: number;
  title: string;
  phone: string;
  location: string;
  experience_years: number;
  availability: string;
  dob: string;
  portfolio_website: string;
  bio: string;
  profile_photo: string;
  name?: string; // Fallback
  user?: {
    name: string;
    email: string;
  };
  skills?: Skill[];
  educations?: Education[];
  experiences?: Experience[];
}

interface Application {
  id: number;
  job_id: number;
  status: string;
  answers: Answer[];
  job_seeker: JobSeeker;
}

interface Job {
  id: number;
  title: string;
  status: string;
  description: string;
  location: string;
  vacancies: number;
  experience_required: number;
  salary_min: string;
  salary_max: string;
}

export default function RecruiterJobViewClient({ 
  job, 
  applications = [],
  totalApplications = 0
}: { 
  job: Job;
  applications: Application[];
  totalApplications: number;
}) {
  const [activeTab, setActiveTab] = useState('all');
  
  if (!job) return null;
  
  // Safe-guarding against null/undefined applications
  const safeApps = applications || [];

  const tabs = [
    { id: 'all', label: 'All Candidates', count: totalApplications },
    { id: 'shortlisted', label: 'Shortlisted', count: safeApps.filter(a => a.status === 'shortlisted').length },
    { id: 'pending', label: 'Action Pending', count: safeApps.filter(a => a.status === 'pending').length },
    { id: 'rejected', label: 'Rejected', count: safeApps.filter(a => a.status === 'rejected').length },
  ];

  const filteredApplications = activeTab === 'all' 
    ? safeApps 
    : safeApps.filter(a => a.status === activeTab);

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 font-sans text-gray-800 pb-10">
      {/* Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/recruiter/jobs" className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">
               Pipeline for <span className="text-blue-600 underline underline-offset-4 decoration-blue-100">{job.title}</span>
            </h1>
            <p className="text-sm text-gray-400 font-medium mt-1 ml-0.5 italic">Detailed Applicant Review • ID {job.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100 shadow-sm">
           <Link href={`/dashboard/recruiter/jobs/edit/${job.id}`}>
              <button className="h-9 px-5 rounded-xl text-xs font-semibold border border-gray-200 hover:bg-gray-100 text-gray-500 transition-all bg-white">
                Manage Posting
              </button>
           </Link>
        </div>
      </div>

      {/* Job Details Snapshot */}
      <div className="bg-white border-2 border-slate-50 rounded-[2rem] p-8 shadow-xl shadow-indigo-900/5 space-y-6">
         <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-gray-50">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                  <Briefcase className="w-6 h-6" />
               </div>
               <div>
                  <h2 className="text-xl font-bold text-slate-800">{job.title}</h2>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
                     <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-400/50" /> {job.location || "N/A"}</span>
                     <span className="text-gray-100">•</span>
                     <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-indigo-400/50" /> {job.vacancies || 0} Vacancies</span>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-6 text-right">
               <div>
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-tight">Experience</p>
                  <p className="text-sm font-bold text-slate-700">{job.experience_required || 0}+ Years</p>
               </div>
               <div className="h-8 w-px bg-gray-100" />
               <div>
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-tight">Annual CTC</p>
                  <p className="text-sm font-bold text-emerald-600">₹{(parseInt(job.salary_min || '0')/100000).toFixed(1)}L - ₹{(parseInt(job.salary_max || '0')/100000).toFixed(1)}L</p>
               </div>
            </div>
         </div>

         <div>
            <h4 className="text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-3 flex items-center gap-2">
               <Activity className="w-4 h-4" /> Position Overview
            </h4>
            <p className="text-xs text-gray-500 font-medium leading-relaxed italic line-clamp-3 hover:line-clamp-none transition-all cursor-help">
               "{job.description || "No description provided."}"
            </p>
         </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3 mt-8">
         {(tabs || []).map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-semibold transition-all border",
                activeTab === tab.id 
                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10" 
                : "bg-white text-gray-400 border-gray-100 hover:border-gray-300 hover:text-gray-600"
              )}
            >
              {tab.label} <span className={cn("ml-1 font-bold", activeTab === tab.id ? "text-blue-100" : "text-gray-300")}>{tab.count}</span>
            </button>
         ))}
      </div>

      {/* Sorting & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-2 px-1 text-sm">
         <p className="text-gray-500 font-medium italic">Displaying {filteredApplications.length} candidate file{filteredApplications.length !== 1 ? 's' : ''}</p>
         
         <div className="flex items-center gap-4 text-gray-500 font-semibold">
            <div className="flex items-center gap-2">Order by: <span className="text-gray-900 cursor-pointer flex items-center gap-1">Newest First <ChevronDown className="w-4 h-4" /></span></div>
         </div>
      </div>

      {/* Candidate List */}
      <div className="space-y-8">
         {filteredApplications.map((app) => (
           <CandidateCard key={app.id} application={app} />
         ))}
         {filteredApplications.length === 0 && (
           <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-gray-900 font-bold">Pipeline Empty</h3>
              <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">No applicants found for this status</p>
           </div>
         )}
      </div>
    </div>
  );
}

function CandidateCard({ application }: { application: Application }) {
  const { job_seeker: candidate, status } = application;
  const answers = application.answers || [];
  const name = candidate?.user?.name || candidate?.name || "Anonymous Candidate";
  const email = candidate?.user?.email || "No email provided";
  
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const profilePhoto = candidate?.profile_photo 
    ? (candidate.profile_photo.startsWith('http') ? candidate.profile_photo : `${apiBaseUrl}/${candidate.profile_photo}`)
    : `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff&bold=true`;

  return (
    <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-900/5 group relative overflow-hidden transition-all hover:bg-slate-50/20">
       <div className={cn(
         "absolute top-0 right-0 w-2 h-full transition-all",
         status === 'shortlisted' ? "bg-emerald-500 opacity-20" : "bg-blue-500 opacity-0 group-hover:opacity-10"
       )} />
       
       <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-8">
             {/* Header */}
             <div className="flex items-start gap-6">
                <div className="w-6 h-6 border-2 border-gray-200 bg-gray-50 rounded-lg mt-1.5 cursor-pointer hover:border-blue-400 transition-all shadow-inner shrink-0" />
                <div className="space-y-2 flex-1 min-w-0">
                   <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-none truncate">{name}</h2>
                      {status === 'shortlisted' && (
                         <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-100 shadow-sm">Shortlisted</span>
                      )}
                      <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-100 uppercase">{candidate?.availability}</span>
                   </div>
                   <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-gray-400 italic">
                      <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-gray-300" /> {candidate?.title}</span>
                      <span className="flex items-center gap-1.5 text-blue-600/60 font-bold"><Clock className="w-4 h-4" /> {candidate?.experience_years}y Exp</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-300" /> {candidate?.location}</span>
                   </div>
                </div>
             </div>

             {/* Bio Summary Section */}
             <div className="border-t border-gray-50 pt-6">
                <p className="text-xs text-gray-500 leading-relaxed font-medium">"{candidate?.bio || "No summary provided."}"</p>
             </div>

             {/* Skills Cluster */}
             {(candidate?.skills || []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                   {candidate?.skills?.slice(0, 10).map((skill) => (
                      <span key={skill.id} className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-lg border border-gray-100">
                         {skill.name}
                      </span>
                   ))}
                   {(candidate?.skills || []).length > 10 && <span className="text-[10px] text-gray-300 font-bold ml-1">+{(candidate?.skills?.length || 0) - 10} more</span>}
                </div>
             )}

             {/* Experience & Education Micro-Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-50 pt-8">
                {/* Experiences */}
                <div className="space-y-4">
                   <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> Recent Experience
                   </h4>
                   <div className="space-y-3">
                      {(candidate?.experiences || []).length > 0 ? (candidate.experiences || []).slice(0, 2).map((exp) => (
                         <div key={exp.id} className="space-y-0.5">
                            <p className="text-xs font-bold text-gray-700">{exp.job_title}</p>
                            <p className="text-[10px] font-semibold text-blue-600/50">{exp.company_name}</p>
                            <p className="text-[10px] text-gray-400">{exp.start_date} - {exp.end_date || 'Present'}</p>
                         </div>
                      )) : (
                        <p className="text-[10px] text-gray-300 italic">No experience listed</p>
                      )}
                   </div>
                </div>

                {/* Education */}
                <div className="space-y-4">
                   <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5" /> Education
                   </h4>
                   <div className="space-y-3">
                      {(candidate?.educations || []).length > 0 ? (candidate.educations || []).slice(0, 2).map((edu) => (
                         <div key={edu.id} className="space-y-0.5">
                            <p className="text-xs font-bold text-gray-700">{edu.degree}</p>
                            <p className="text-[10px] font-semibold text-gray-400">{edu.institution}</p>
                            <p className="text-[10px] text-gray-400">{edu.end_year} • Grade: {edu.grade || 'N/A'}</p>
                         </div>
                      )) : (
                        <p className="text-[10px] text-gray-300 italic">No education listed</p>
                      )}
                   </div>
                </div>
             </div>

             {/* Custom Questionnaire Answers */}
             <div className="grid grid-cols-1 gap-4 border-t border-gray-50 pt-8">
                <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Questionnaire Answers</h4>
                {answers.map((ans) => {
                  const qText = typeof ans.question === 'string' ? ans.question : ans.question?.question;
                  const qType = typeof ans.question === 'string' ? 'boolean' : ans.question?.question_type;
                  const targetAns = typeof ans.question === 'string' ? 'yes' : ans.question?.recruiter_answer;

                  if (!qText || !targetAns) return null;

                  const isMatch = qType === 'boolean' 
                    ? ans.candidate_answer.toLowerCase() === targetAns.toLowerCase()
                    : parseInt(ans.candidate_answer) <= parseInt(targetAns);

                  return (
                    <div key={ans.id} className="flex gap-10 items-start">
                       <span className="w-28 shrink-0 text-[10px] font-bold text-gray-400 leading-tight">{qText}</span>
                       <div className={cn(
                         "px-3 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-2",
                         isMatch ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                       )}>
                          {qType === 'numeric' ? `₹${(parseInt(ans.candidate_answer)/100000).toFixed(1)}L` : ans.candidate_answer.toUpperCase()}
                          <span className="text-[9px] opacity-60 font-semibold italic">
                             (Target: {qType === 'numeric' ? `₹${(parseInt(targetAns)/100000).toFixed(1)}L` : targetAns.toUpperCase()})
                          </span>
                       </div>
                    </div>
                  );
                })}
             </div>

             {/* Footer Actions */}
             <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-gray-50">
                <div className="flex items-center gap-8">
                  <a href={`mailto:${email}`} className="flex items-center gap-2 text-gray-400 text-[11px] font-bold hover:text-blue-600 transition-colors">
                     <Mail className="w-4 h-4" /> {email}
                  </a>
                  <a href={`tel:${candidate?.phone}`} className="flex items-center gap-2 text-gray-400 text-[11px] font-bold hover:text-blue-600 transition-colors">
                     <Phone className="w-4 h-4" /> {candidate?.phone}
                  </a>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                   <button className="px-6 py-2.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all shadow-sm flex items-center gap-2">
                       Shortlist
                   </button>
                   <button className="px-6 py-2.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-all shadow-sm">
                      Schedule Interview
                   </button>
                   <button className="px-6 py-2.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100 hover:bg-rose-100 transition-all shadow-sm">
                       Reject
                   </button>
                   <button className="p-3 text-gray-300 hover:bg-gray-100 rounded-full transition-all">
                      <Trash2 className="w-4.5 h-4.5" />
                   </button>
                </div>
             </div>
          </div>

          {/* Sidebar Area */}
          <div className="w-full lg:w-72 shrink-0 space-y-8 flex flex-col items-center border-l border-slate-50 pl-0 lg:pl-12">
             <div className="w-28 h-28 rounded-3xl bg-indigo-50/50 border border-indigo-100 relative group/avatar overflow-hidden shadow-inner">
                <div className="absolute inset-0 flex items-center justify-center">
                   <img src={profilePhoto} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="absolute inset-0 bg-blue-600/0 group-hover/avatar:bg-blue-600/10 transition-all cursor-pointer" />
                <button className="absolute bottom-2 right-2 p-1.5 bg-white rounded-lg shadow-md opacity-0 group-hover/avatar:opacity-100 transition-all">
                   <Share2 className="w-3.5 h-3.5 text-gray-400" />
                </button>
             </div>

             <div className="text-center space-y-6 w-full">
                <div className="space-y-1">
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Job Seeker DOB</p>
                   <p className="text-xs font-bold text-gray-700 italic">{candidate?.dob || "N/A"}</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                   <button className="w-full h-12 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 shadow-sm hover:border-blue-300 transition-all flex items-center justify-center gap-2">
                      <PhoneCall className="w-4 h-4 text-blue-500" /> Send WhatsApp
                   </button>
                   
                   {candidate?.portfolio_website && (
                     <Link href={candidate.portfolio_website} target="_blank">
                       <button className="w-full h-12 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 shadow-sm hover:border-blue-300 transition-all flex items-center justify-center gap-2">
                          <Globe className="w-4 h-4 text-indigo-500" /> Portfolio Site
                       </button>
                     </Link>
                   )}

                   <button className="w-full h-12 bg-indigo-600 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-900/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" /> Start App Call
                   </button>
                </div>

                <p className="text-[10px] text-gray-300 font-bold uppercase italic mt-4">File Generated on {new Date().toLocaleDateString()}</p>
             </div>
          </div>
       </div>

       <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none select-none text-center">
          <h2 className="text-6xl font-black text-gray-100 tracking-tighter uppercase leading-none">Teacher Profile</h2>
       </div>
    </div>
  );
}
