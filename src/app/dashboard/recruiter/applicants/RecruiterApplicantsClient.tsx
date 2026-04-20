"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Users, 
  MapPin, 
  Search, 
  FileText,
  Briefcase,
  X,
  Eye,
  Download,
  CheckCircle2,
  Clock,
  Loader2,
  ChevronLeft,
  Phone,
  Mail,
  User,
  GraduationCap,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { toast } from "sonner";
import Link from "next/link";

const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || "https://teachnowbackend.jobsvedika.in/";

const safeFormatDistanceToNow = (dateString?: string) => {
  if (!dateString) return "just now";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "just now";
  return formatDistanceToNow(date);
};

interface Application {
  id: number;
  job_id: number;
  job_seeker_id: number;
  resume_id: number;
  status: string;
  contact_status?: string | null;
  created_at: string;
  job: {
    id: number;
    title: string;
    job_status: string;
    slug?: string;
  };
  job_seeker: {
    id: number;
    user_id: number;
    title: string;
    phone: string;
    location: string;
    experience_years: number;
    bio: string;
    profile_photo: string;
    name?: string;
    email?: string;
    user?: {
      id: number;
      name: string;
      email: string;
    }
    role?: string;
  };
  resume?: {
    id: number;
    file_name: string;
    file_url: string;
  };
  application_answers?: Array<{
    id: number;
    job_application_id: number;
    question_id: number;
    candidate_answer: string;
    question?: {
      id: number;
      question: string;
      recruiter_answer: string;
    }
  }>;
}

interface RecruiterApplicantsClientProps {
  initialData?: {
    status: boolean;
    data: {
      data: Application[];
    } | Application[];
  };
}

const StatusBadge = ({ status, type = 'status' }: { status: string, type?: 'status' | 'contact' }) => {
  const s = status?.toLowerCase() || "";
  
  if (type === 'contact') {
     const styles: Record<string, string> = {
        called: "bg-blue-50 text-blue-600 border-blue-100",
        messaged: "bg-sky-50 text-sky-600 border-sky-100",
        not_picked: "bg-orange-50 text-orange-600 border-orange-100",
        not_reached: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100",
        default: "bg-slate-50 text-black/40 border-slate-100"
     };
     return (
        <span className={cn(
           "px-2.5 py-0.5 rounded-lg text-[10px] font-medium border whitespace-nowrap capitalize",
           styles[s] || styles.default
        )}>
           {status.replace(/_/g, ' ').toLowerCase()}
        </span>
     );
  }

  const styles: Record<string, string> = {
    shortlisted: "bg-indigo-50 text-indigo-600 border-indigo-100",
    interview: "bg-purple-50 text-purple-600 border-purple-100",
    rejected: "bg-rose-50 text-rose-600 border-rose-100",
    contacted: "bg-emerald-50 text-emerald-600 border-emerald-100",
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    default: "bg-slate-50 text-black/40 border-slate-100"
  };
  
  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-lg text-[10px] font-medium border whitespace-nowrap capitalize",
      styles[s] || styles.default
    )}>
      {status.toLowerCase()}
    </span>
  );
};

export default function RecruiterApplicantsClient({ initialData }: RecruiterApplicantsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'shortlisted' | 'called' | 'messaged' | 'not_picked' | 'not_reached' | 'rejected'>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [showPhone, setShowPhone] = useState(false);

  const getInitialApps = () => {
    if (!initialData) return [];
    if ((initialData as any).status && Array.isArray((initialData as any).data)) return (initialData as any).data;
    if ((initialData as any).status && (initialData as any).data?.data && Array.isArray((initialData as any).data.data)) return (initialData as any).data.data;
    if (Array.isArray(initialData)) return initialData;
    if ((initialData as any).data && Array.isArray((initialData as any).data)) return (initialData as any).data;
    return [];
  };

  const initialApps = getInitialApps();
  const [apps, setApps] = useState<Application[]>(initialApps);
  const [loading, setLoading] = useState<number | null>(null);
  const [selectedApplicantFullData, setSelectedApplicantFullData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    setApps(getInitialApps());
  }, [initialData]);

  const getCandidateName = (app: Application) => app.job_seeker?.user?.name || app.job_seeker?.name || "Applicant";
  const getCandidateInitial = (app: Application) => {
    const name = getCandidateName(app);
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0]?.toUpperCase() || "A";
  };
  
  const getFullUrl = (path: string | undefined) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${STORAGE_BASE_URL}${cleanPath}`;
  };

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const fullName = getCandidateName(app).toLowerCase();
      const jobTitle = (app.job?.title || "").toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || jobTitle.includes(searchTerm.toLowerCase());
      if (activeTab === 'all') return matchesSearch;
      if (['called', 'messaged', 'not_picked', 'not_reached'].includes(activeTab)) {
         return matchesSearch && app.contact_status === activeTab;
      }
      return matchesSearch && app.status?.toLowerCase() === activeTab;
    });
  }, [apps, searchTerm, activeTab]);

  const shortlistApplicant = async (appId: number) => {
    setLoading(appId);
    try {
      const res = await dashboardServerFetch(`recruiter/applications/${appId}/shortlist`, { method: "POST" });
      if (res.status) {
        setApps(prev => prev.map(app => app.id === appId ? { ...app, status: 'shortlisted' } : app));
        toast.success(`Applicant shortlisted successfully!`);
      } else {
        toast.error(res.message || "Failed to shortlist");
      }
    } catch (error) { toast.error("An error occurred"); } finally { setLoading(null); }
  };

  const updateContactStatus = async (appId: number, contactStatus: string) => {
    if (!contactStatus) return;
    setLoading(appId);
    try {
      const res = await dashboardServerFetch(`recruiter/applications/contact-status/${appId}`, {
        method: "PATCH",
        data: { contact_status: contactStatus }
      });
      if (res.status) {
        setApps(prev => prev.map(app => app.id === appId ? { ...app, contact_status: contactStatus } : app));
        toast.success(`Contact status updated`);
      } else { toast.error("Failed to update contact status"); }
    } catch (error) { toast.error("An error occurred"); } finally { setLoading(null); }
  };

  const rejectApplication = async (appId: number) => {
    setLoading(appId);
    try {
      const res = await dashboardServerFetch(`recruiter/reject/${appId}`, { method: "PATCH" });
      if (res.status) {
        setApps(prev => prev.map(app => app.id === appId ? { ...app, status: 'rejected' } : app));
        toast.success(`Application rejected`);
      } else { toast.error("Failed to reject application"); }
    } catch (error) { toast.error("An error occurred"); } finally { setLoading(null); }
  };

  const stats = [
    { label: "Total Apps", value: apps.length, icon: Users, bg: "bg-blue-50", text: "text-blue-600" },
    { label: "Shortlisted", value: apps.filter(a => a.status?.toLowerCase() === 'shortlisted').length, icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
    { label: "Interviews", value: apps.filter(a => a.status?.toLowerCase() === 'interview').length, icon: ShieldCheck, bg: "bg-indigo-50", text: "text-indigo-600" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6 font-sans text-black pb-20">
      
      {/* Header Pipeline */}
      <div className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all hover:border-indigo-100/10">
        <div className="space-y-3">
           <button 
             onClick={() => window.history.back()} 
             className="flex items-center gap-1.5 text-[11px] font-medium text-black opacity-40 hover:opacity-100 transition-all group mb-0.5"
           >
             <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to job view
           </button>
           <div className="space-y-1">
             <h1 className="text-xl font-medium text-black">Applicants Pipeline</h1>
             <p className="text-[13px] font-medium text-black opacity-40">Manage your candidate pool for <span className="text-indigo-600">{apps[0]?.job?.title || "Requirement"}</span></p>
           </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
           <Link href={`/dashboard/recruiter/jobs`}>
             <Button variant="outline" className="h-10 px-5 rounded-xl text-[12px] font-medium text-black/70 border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center gap-2">
               <Briefcase className="w-4 h-4 text-indigo-400" /> Manage All Jobs
             </Button>
           </Link>
        </div>
      </div>

      {/* Pipeline Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:border-slate-200">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-current/10", s.bg, s.text)}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-medium text-black leading-none mb-1">{s.value}</h3>
              <p className="text-[11px] font-medium text-black opacity-40">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-[18px] border border-slate-100 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All', count: apps.length },
            { id: 'shortlisted', label: 'Shortlisted' },
            { id: 'called', label: 'Called' },
            { id: 'messaged', label: 'Messaged' },
            { id: 'not_picked', label: 'Not Picked' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-5 py-1.5 rounded-[14px] text-[12.5px] font-medium transition-all whitespace-nowrap",
                activeTab === tab.id 
                ? "bg-[#312E81] text-white shadow-md shadow-indigo-100" 
                : "text-black opacity-40 hover:opacity-100 hover:bg-white"
              )}
            >
              {tab.label} {tab.id === 'all' && `(${tab.count})`}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate name..." 
            className="h-10 pl-10 bg-white border-slate-100 rounded-xl text-[12.5px] font-medium focus:ring-2 focus:ring-indigo-100 shadow-sm placeholder:text-black/30" 
          />
        </div>
      </div>

      {/* Applicant High-Density Cards */}
      <div className="space-y-4">
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => (
            <div key={app.id} className="bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden p-5 group transition-all hover:border-indigo-100/30">
               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                 
                 <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                      {app.job_seeker?.profile_photo ? (
                        <img 
                          src={getFullUrl(app.job_seeker.profile_photo)} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as any).parentNode.innerHTML = `<div class="flex items-center justify-center h-full w-full bg-indigo-50 text-indigo-600 font-medium">${getCandidateInitial(app)}</div>`; }}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-indigo-50 text-indigo-600 font-medium">{getCandidateInitial(app)}</div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[15px] font-medium text-black truncate">{getCandidateName(app)}</h3>
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={app.status} />
                          {app.contact_status && <StatusBadge status={app.contact_status} type="contact" />}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-black/50">
                           <MapPin className="w-3 h-3 text-indigo-400" /> {app.job_seeker?.location || "India"}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-black/50">
                           <Briefcase className="w-3 h-3 text-indigo-400" /> {app.job_seeker?.experience_years || "0"}y Exp
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-indigo-600">
                           <Clock className="w-3 h-3" /> {safeFormatDistanceToNow(app.created_at)}
                        </span>
                      </div>
                    </div>
                 </div>

                 {/* Grouped Actions */}
                 <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0 pt-4 lg:pt-0 border-t lg:border-none border-slate-50">
                    <Button 
                       variant="outline" 
                       className="h-9 px-4 rounded-xl text-[11px] font-medium text-black/70 border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1.5"
                       onClick={() => window.open(getFullUrl(app.resume?.file_url), '_blank')}
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-400" /> Resume
                    </Button>
                    
                    <Button 
                       onClick={() => {
                          setSelectedApplicant(app);
                          setLoadingProfile(true);
                          dashboardServerFetch(`recruiter/applications/${app.id}`).then(res => {
                             if (res.status) setSelectedApplicantFullData(res.data);
                             setLoadingProfile(false);
                          });
                       }}
                       className="h-9 px-5 rounded-xl text-[11px] font-medium bg-slate-50 text-black border border-slate-100 hover:bg-slate-100 transition-all flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Full Detail
                    </Button>

                    <div className="h-6 w-px bg-slate-100 hidden lg:block mx-1" />

                     {app.status?.toLowerCase() !== 'shortlisted' && (
                       <Button 
                         onClick={() => shortlistApplicant(app.id)}
                         disabled={loading === app.id}
                         className="h-9 px-5 rounded-xl text-[11px] font-medium bg-[#312E81] text-white hover:bg-[#1E1B4B] shadow-md shadow-indigo-100 transition-all flex items-center gap-1.5"
                       >
                         {loading === app.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ThumbsUp className="w-3.5 h-3.5" />}
                         Shortlist
                       </Button>
                     )}
                 </div>

               </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[20px] border border-dashed border-slate-200 py-16 flex flex-col items-center justify-center text-center gap-5 shadow-sm">
             <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200">
               <Users className="w-10 h-10" />
             </div>
             <div className="space-y-1.5">
               <p className="text-lg font-medium text-black">No candidates match</p>
               <p className="text-[13px] text-black/40 font-medium px-4">Adjust your filters to see more applicants.</p>
             </div>
          </div>
        )}
      </div>

      {/* Modern Profile Drawer */}
      <AnimatePresence>
        {selectedApplicant && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               onClick={() => { setSelectedApplicant(null); setSelectedApplicantFullData(null); }}
               className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 pointer-events-auto cursor-pointer"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full sm:max-w-xl bg-white shadow-2xl z-50 flex flex-col border-l border-slate-100"
            >
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div>
                   <h2 className="text-xl font-medium text-black leading-none mb-1">Candidate Profile</h2>
                   <p className="text-[11px] font-medium text-black/40">Reviewing application details</p>
                </div>
                <button onClick={() => { setSelectedApplicant(null); setSelectedApplicantFullData(null); }} className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-black/40 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32 no-scrollbar">
                
                {/* Header Profile Section */}
                <div className="flex items-start gap-5">
                   <div className="w-20 h-20 rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden shrink-0 shadow-inner">
                      {selectedApplicant.job_seeker?.profile_photo ? (
                        <img src={getFullUrl(selectedApplicant.job_seeker.profile_photo)} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-indigo-50 text-indigo-600 text-2xl font-bold">{getCandidateInitial(selectedApplicant)}</div>
                      )}
                   </div>
                   <div className="space-y-4 flex-1">
                      <div className="space-y-1">
                         <h1 className="text-2xl font-medium text-black">{getCandidateName(selectedApplicant)}</h1>
                         <p className="text-[13px] font-medium text-indigo-600 bg-indigo-50 w-fit px-3 py-1 rounded-lg border border-indigo-100 capitalize">{selectedApplicant.job_seeker?.title?.toLowerCase() || "qualified candidate"}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                         <StatusBadge status={selectedApplicant.status} />
                         <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-slate-50/50 px-3 py-1 rounded-lg border border-slate-100"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Verified Candidate</span>
                      </div>
                   </div>
                </div>

                {/* Candidate Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                   {[
                      { label: "Contact Phone", value: showPhone ? (selectedApplicantFullData?.job_seeker?.phone || selectedApplicant.job_seeker?.phone) : "••••••••••", icon: Phone, action: () => setShowPhone(true), color: "text-blue-600", bg: "bg-blue-50/50" },
                      { label: "Email Address", value: selectedApplicantFullData?.job_seeker?.email || selectedApplicantFullData?.job_seeker?.user?.email || selectedApplicant.job_seeker?.user?.email || selectedApplicant.job_seeker?.email, icon: Mail, color: "text-purple-600", bg: "bg-purple-50/50" },
                      { label: "Total Experience", value: `${selectedApplicantFullData?.job_seeker?.experience_years ?? selectedApplicant.job_seeker?.experience_years ?? 0} Years`, icon: Briefcase, color: "text-orange-600", bg: "bg-orange-50/50" },
                      { label: "Current Location", value: selectedApplicantFullData?.job_seeker?.location || selectedApplicant.job_seeker?.location || "India", icon: MapPin, color: "text-rose-600", bg: "bg-rose-50/50" },
                   ].map((item, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2.5 transition-all hover:border-indigo-100/30">
                         <div className="flex items-center justify-between">
                            <div className={cn("w-7.5 h-7.5 rounded-lg flex items-center justify-center", item.bg, item.color)}>
                               <item.icon className="w-4 h-4" />
                            </div>
                            <p className="text-[10px] font-medium text-black opacity-40 whitespace-nowrap">{item.label}</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[14px] font-medium text-black break-all">{item.value}</p>
                            {item.action && !showPhone && (
                              <button onClick={item.action} className="text-[10px] font-bold text-indigo-600 hover:underline">REVEAL NUMBER</button>
                            )}
                         </div>
                      </div>
                   ))}
                </div>

                {/* Resume Access Module */}
                <div className="space-y-4">
                   <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100"><FileText className="w-4 h-4" /></div>
                      <h3 className="text-sm font-medium text-black">Candidate Resume</h3>
                   </div>
                   <a 
                     href={getFullUrl(selectedApplicant.resume?.file_url)} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between group hover:border-indigo-100 hover:bg-indigo-50/10 transition-all cursor-pointer"
                   >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                         <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100 shrink-0 shadow-sm transition-transform group-hover:scale-110">
                            <FileText className="w-6 h-6" />
                         </div>
                         <div className="min-w-0">
                            <p className="text-[14px] font-medium text-black truncate group-hover:text-indigo-600 transition-colors">{selectedApplicant.resume?.file_name || "Resume_Document.pdf"}</p>
                            <p className="text-[11px] font-medium text-black/40">PDF Document • {safeFormatDistanceToNow(selectedApplicant.created_at)} ago</p>
                         </div>
                      </div>
                      <div className="h-10 px-4 rounded-xl border border-slate-200 bg-white group-hover:border-indigo-200 group-hover:bg-white text-[12px] font-medium text-indigo-600 flex items-center gap-2 shadow-sm transition-all">
                         <Download className="w-4 h-4" /> 
                         <span className="hidden sm:inline">View Resume</span>
                      </div>
                   </a>
                </div>

                {/* Screening Questions Section */}
                {(() => {
                   const answers = selectedApplicantFullData?.application_answers || selectedApplicant.application_answers || [];
                   if (answers.length === 0) return null;
                   
                   return (
                      <div className="space-y-4">
                         <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100"><ShieldCheck className="w-4 h-4" /></div>
                            <h3 className="text-sm font-medium text-black">Screening Responses</h3>
                         </div>
                         <div className="space-y-4">
                            {answers.map((ans: any, idx: number) => (
                               <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3 group transition-all hover:border-indigo-100/30">
                                  <div className="space-y-1">
                                     <p className="text-[10px] font-medium text-black/30">Question {idx + 1}</p>
                                     <p className="text-[12.5px] font-medium text-black leading-relaxed">{ans.question?.question || "Requirement Question"}</p>
                                  </div>
                                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-50">
                                     <p className="text-[9px] font-medium text-indigo-600 mb-1">Candidate Answer</p>
                                     <p className="text-[12px] font-medium text-black opacity-60 leading-relaxed italic">"{ans.candidate_answer || "No response provided."}"</p>
                                  </div>
                                  {ans.question?.recruiter_answer && (
                                     <div className="flex items-center gap-2 px-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <p className="text-[11px] font-medium text-emerald-600 italic">Expected match: {ans.question.recruiter_answer}</p>
                                     </div>
                                  )}
                               </div>
                            ))}
                         </div>
                      </div>
                   );
                })()}

                {/* Bio / About */}
                <div className="space-y-4">
                   <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100"><User className="w-4 h-4" /></div>
                      <h3 className="text-sm font-medium text-black">Professional Bio</h3>
                   </div>
                   <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                      <p className="text-[13px] font-medium text-black/70 leading-relaxed italic">{selectedApplicant.job_seeker?.bio || "No candidate biography provided."}</p>
                   </div>
                </div>

                {/* Additional Dynamic Data (Experiences/Skills) */}
                {loadingProfile ? (
                   <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
                ) : selectedApplicantFullData && (
                   <div className="space-y-8">
                      {selectedApplicantFullData.job_seeker?.experiences?.length > 0 && (
                         <div className="space-y-5">
                            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                               <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100"><Briefcase className="w-4 h-4" /></div>
                               <h3 className="text-sm font-medium text-black">Work Experience</h3>
                            </div>
                            <div className="relative space-y-6 pl-4 border-l-2 border-slate-50 ml-4">
                               {selectedApplicantFullData.job_seeker.experiences.map((exp: any) => (
                                  <div key={exp.id} className="relative group">
                                     <div className="absolute -left-[25px] top-1 w-4.5 h-4.5 rounded-full bg-white border-2 border-orange-500 shadow-sm z-10 group-hover:scale-125 transition-transform" />
                                     
                                     <div className="space-y-1.5 transition-all group-hover:translate-x-1">
                                        <div className="flex justify-between items-start gap-4">
                                           <h4 className="text-[14px] font-medium text-black leading-tight">{exp.job_title}</h4>
                                           <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 whitespace-nowrap shadow-sm">
                                              {exp.start_date ? new Date(exp.start_date).getFullYear() : 'N/A'} — {exp.is_current ? 'Present' : exp.end_date ? new Date(exp.end_date).getFullYear() : 'Present'}
                                           </span>
                                        </div>
                                        <p className="text-[11px] font-medium text-indigo-600/80 tracking-tight italic flex items-center gap-1.5">
                                           <MapPin className="w-3 h-3" /> {exp.company_name} {exp.location && `• ${exp.location}`}
                                        </p>
                                        <p className="text-[12.5px] font-medium text-black/50 leading-relaxed max-w-[95%]">{exp.description}</p>
                                     </div>
                                  </div>
                               ))}
                            </div>
                         </div>
                      )}

                      {selectedApplicantFullData.job_seeker?.educations?.length > 0 && (
                         <div className="space-y-5">
                            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                               <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100"><GraduationCap className="w-4 h-4" /></div>
                               <h3 className="text-sm font-medium text-black">Education Detail</h3>
                            </div>
                            <div className="relative space-y-6 pl-4 border-l-2 border-slate-50 ml-4">
                               {selectedApplicantFullData.job_seeker.educations.map((edu: any) => (
                                  <div key={edu.id} className="relative group">
                                     <div className="absolute -left-[25px] top-1 w-4.5 h-4.5 rounded-full bg-white border-2 border-emerald-500 shadow-sm z-10 group-hover:scale-125 transition-transform" />
                                     
                                     <div className="space-y-1 transition-all group-hover:translate-x-1">
                                        <div className="flex justify-between items-start gap-4">
                                           <h4 className="text-[14px] font-medium text-black leading-tight">{edu.degree}</h4>
                                           <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 whitespace-nowrap shadow-sm">
                                              {edu.start_year} — {edu.is_current ? 'Present' : edu.end_year}
                                           </span>
                                        </div>
                                        <p className="text-[12px] font-medium text-black/40 flex items-center gap-1.5">
                                           <GraduationCap className="w-3.5 h-3.5" /> {edu.institution} {edu.field_of_study && `• ${edu.field_of_study}`}
                                        </p>
                                     </div>
                                  </div>
                               ))}
                            </div>
                         </div>
                      )}
                   </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 bg-white border-t border-slate-50 flex items-center justify-between gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                  <div className="flex-1">
                     <select 
                       className="h-12 w-full px-5 rounded-[18px] bg-slate-50/80 border border-slate-100 text-[13px] font-medium text-black focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer transition-all"
                       value={selectedApplicant.contact_status || ""}
                       onChange={(e) => updateContactStatus(selectedApplicant.id, e.target.value)}
                       disabled={loading === selectedApplicant.id}
                     >
                        <option value="">Mark Contact Status</option>
                        <option value="called">Called</option>
                        <option value="messaged">Messaged</option>
                        <option value="not_picked">Not Picked</option>
                        <option value="not_reached">Not Reached</option>
                     </select>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedApplicant.status?.toLowerCase() !== 'shortlisted' && (
                       <Button 
                          onClick={() => shortlistApplicant(selectedApplicant.id)}
                          disabled={loading === selectedApplicant.id}
                          className="h-12 px-8 rounded-[18px] bg-[#312E81] text-white hover:bg-[#1E1B4B] shadow-lg shadow-indigo-100 flex items-center gap-2.5 text-[14px] font-medium"
                       >
                          <ThumbsUp className="w-4.5 h-4.5" /> Shortlist
                       </Button>
                    )}
                    <Button 
                       onClick={() => rejectApplication(selectedApplicant.id)}
                       disabled={loading === selectedApplicant.id}
                       variant="outline"
                       className="h-12 w-12 rounded-[18px] border-rose-100 bg-rose-50/10 text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center shadow-inner group"
                    >
                       <ThumbsDown className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                    </Button>
                  </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
