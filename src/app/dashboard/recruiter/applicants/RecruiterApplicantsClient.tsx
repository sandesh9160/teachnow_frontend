"use client";

import { useState } from "react";
import { 
  Users, 
  MapPin, 
  Calendar, 
  Search, 
  FileText,
  Briefcase,
  X,
  Eye,
  Download,
  CheckCircle2,
  Clock,
  Loader2,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { toast } from "sonner";

const STORAGE_BASE_URL = "https://teachnowbackend.jobsvedika.in/";

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
  };
  resume?: {
    id: number;
    file_name: string;
    file_url: string;
  };
}

interface RecruiterApplicantsClientProps {
  initialData?: {
    status: boolean;
    data: {
      data: Application[];
    } | Application[];
  };
}

const StatusBadge = ({ status }: { status: string }) => {
  const s = status?.toLowerCase() || "";
  
  const styles: Record<string, string> = {
    shortlisted: "bg-indigo-50 text-indigo-600 border-indigo-100",
    interview: "bg-purple-50 text-purple-600 border-purple-100",
    rejected: "bg-rose-50 text-rose-600 border-rose-100",
    contacted: "bg-emerald-50 text-emerald-600 border-emerald-100",
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    default: "bg-slate-50 text-slate-400 border-slate-100"
  };

  const currentStyle = styles[s] || styles.default;
  
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-xs font-semibold tracking-normal  border shadow-sm",
      currentStyle
    )}>
      {status}
    </span>
  );
};

export default function RecruiterApplicantsClient({ initialData }: RecruiterApplicantsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'shortlisted' | 'called' | 'messaged' | 'not_picked' | 'not_reached' | 'rejected'>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [showPhone, setShowPhone] = useState(false);

  const initialApps = (initialData as any)?.data?.data || (initialData as any)?.data || [];
  const [apps, setApps] = useState<Application[]>(initialApps);
  const [loading, setLoading] = useState<number | null>(null);
  const [selectedApplicantFullData, setSelectedApplicantFullData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const getCandidateName = (app: Application) => app.job_seeker?.user?.name || app.job_seeker?.name || "Applicant";

  const filteredApps = apps.filter((app) => {
    const fullName = getCandidateName(app).toLowerCase();
    const jobTitle = (app.job?.title || "").toLowerCase();
    const seekerTitle = (app.job_seeker?.title || "").toLowerCase();
    
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                         jobTitle.includes(searchTerm.toLowerCase()) ||
                         seekerTitle.includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    
    const isContactTab = ['called', 'messaged', 'not_picked', 'not_reached'].includes(activeTab);
    if (isContactTab) {
       return matchesSearch && app.contact_status === activeTab;
    }
    
    return matchesSearch && app.status?.toLowerCase() === activeTab;
  });

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

  const updateStatus = async (appId: number, status: string) => {
    setLoading(appId);
    try {
      const res = await dashboardServerFetch("recruiter/applications/update-status", {
        method: "POST",
        data: { application_id: appId, status }
      });

      if (res.status) {
        setApps(prev => prev.map(app => 
          app.id === appId ? { ...app, status } : app
        ));
        if (selectedApplicant?.id === appId) {
          setSelectedApplicant(prev => prev ? { ...prev, status } : null);
        }
        toast.success(`Status updated to ${status}`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
    }
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
        setApps(prev => prev.map(app => 
          app.id === appId ? { ...app, contact_status: contactStatus } : app
        ));
        if (selectedApplicant?.id === appId) {
          setSelectedApplicant(prev => prev ? { ...prev, contact_status: contactStatus } : null);
        }
        toast.success(`Contact status updated`);
      } else {
        toast.error("Failed to update contact status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  const rejectApplication = async (appId: number) => {
    setLoading(appId);
    try {
      const res = await dashboardServerFetch(`recruiter/reject/${appId}`, {
        method: "PATCH"
      });

      if (res.status) {
        setApps(prev => prev.map(app => 
          app.id === appId ? { ...app, status: 'rejected' } : app
        ));
        if (selectedApplicant?.id === appId) {
          setSelectedApplicant(prev => prev ? { ...prev, status: 'rejected' } : null);
        }
        toast.success(`Application rejected`);
      } else {
        toast.error("Failed to reject application");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4 overflow-x-hidden font-sans">
      {/* Back Button */}
      <button 
        onClick={() => window.history.back()} 
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-primary transition-colors mb-2 group w-fit"
      >
        <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Overview
      </button>

      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-gray-100">
        <div>
          <h1 className="text-xl font-semibold text-primary">Applicants Pipeline</h1>
          <p className="text-xs text-gray-400 font-medium">Manage your candidate pool</p>
        </div>
      </div>

      {/* High-Density Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {[
          { label: "Total Apps", value: apps.length, icon: Users, color: "blue" },
          { label: "Shortlisted", value: apps.filter(a => a.status?.toLowerCase() === 'shortlisted').length, icon: CheckCircle2, color: "emerald" },
          { label: "Interviews", value: apps.filter(a => a.status?.toLowerCase() === 'interview').length, icon: Calendar, color: "indigo" },
        ].map((s, i) => (
          <div key={i} className={cn(
             "bg-white p-3 md:p-4 rounded-xl border shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow",
             i === 2 && "col-span-2 md:col-span-1"
          )}>
            <div className={cn(
               "w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border",
               s.color === 'blue' && "bg-blue-50 text-blue-600 border-blue-100",
               s.color === 'emerald' && "bg-emerald-50 text-emerald-600 border-emerald-100",
               s.color === 'indigo' && "bg-indigo-50 text-indigo-600 border-indigo-100",
            )}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 ">{s.label}</p>
              <h3 className="text-lg font-semibold text-slate-900 leading-none">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="bg-white p-2 rounded-xl border shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
         <div className="flex-1 w-full lg:max-w-xs relative scale-[0.98]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by name or job..." 
              className="h-8.5 pl-10 border-transparent bg-gray-50/50 focus:bg-white rounded-lg text-xs font-semibold focus:ring-1 focus:ring-primary/10" 
            />
         </div>

         <div className="flex items-center gap-1 bg-gray-50/50 p-1 rounded-xl border border-gray-100 font-semibold overflow-x-auto no-scrollbar max-w-full">
            {[
              { id: 'all', label: 'All' },
              { id: 'shortlisted', label: 'Shortlisted' },
              { id: 'called', label: 'Called' },
              { id: 'messaged', label: 'Messaged' },
              { id: 'not_picked', label: 'Not Picked' },
              { id: 'not_reached', label: 'Not Reached' },
              { id: 'rejected', label: 'Rejected' },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                  activeTab === tab.id 
                  ? "bg-white text-primary shadow-sm border border-gray-100" 
                  : "text-gray-400 hover:text-gray-600"
                )}
              >
                {tab.label} {tab.id === 'all' && `(${apps.length})`}
              </button>
            ))}
         </div>
      </div>

      {/* Applicants List */}
      <div className="grid grid-cols-1 gap-3 pb-20">
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => (
            <div 
              key={app.id} 
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-3.5 md:p-4 flex flex-col md:flex-row gap-4 relative group overflow-hidden"
            >
              <div className="flex gap-4 items-start flex-1 min-w-0">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm shrink-0 overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                  {app.job_seeker?.profile_photo ? (
                    <img 
                      src={getFullUrl(app.job_seeker.profile_photo)} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as any).parentNode.innerHTML = `<div class="flex items-center justify-center h-full w-full">${getCandidateInitial(app)}</div>`;
                      }}
                    />
                  ) : getCandidateInitial(app)}
                </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm text-gray-900 group-hover:text-primary transition-colors">
                        {getCandidateName(app)}
                        <span className="text-slate-300 font-medium mx-1.5 opacity-50">•</span>
                        <span className="text-xs font-semibold text-slate-600 italic lowercase ">{app.job_seeker?.title || "Teacher"}</span>
                      </h3>
                      {app.status && <StatusBadge status={app.status} />}
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      Applied for <span className="text-primary">{app.job?.title}</span>
                    </p>
                  
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400"><MapPin className="w-3 h-3 text-slate-300" /> {app.job_seeker?.location || "India"}</span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400"><Briefcase className="w-3 h-3 text-slate-300" /> {app.job_seeker?.experience_years || "0"}y Exp</span>
                    <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-400"><Clock className="w-3 h-3 text-slate-300" /> {app.created_at ? formatDistanceToNow(new Date(app.created_at)) : 'Now'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-4">
                <Button 
                   variant="outline" 
                   className="flex-1 md:flex-none h-8.5 px-4 rounded-lg text-xs font-semibold text-slate-500 border-slate-100 hover:bg-slate-50 flex items-center justify-center gap-2 "
                   onClick={() => {
                     const resumeUrl = getFullUrl(app.resume?.file_url);
                     if (resumeUrl) window.open(resumeUrl, '_blank');
                   }}
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" /> Resume
                </Button>
                <Button 
                   className="flex-1 md:flex-none h-8.5 px-4 rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center gap-2 "
                   onClick={async () => {
                     setSelectedApplicant(app);
                     setSelectedApplicantFullData(null);
                     setLoadingProfile(true);
                     try {
                        const res = await dashboardServerFetch(`recruiter/profile/${app.id}`);
                        if (res.status && res.data) {
                           setSelectedApplicantFullData(res.data);
                        }
                     } catch (e) {
                        console.error(e);
                     } finally {
                        setLoadingProfile(false);
                     }
                   }}
                >
                  <Eye className="w-3.5 h-3.5" /> View Detail
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 flex flex-col items-center justify-center text-center gap-4">
             <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-200">
                <Users className="w-8 h-8" />
             </div>
             <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-900">No candidates found</p>
                <p className="text-sm text-gray-400 font-semibold t">Try adjusting your filters to find applicants.</p>
             </div>
          </div>
        )}
      </div>

      {/* Responsive Profile Sidebar */}
      <AnimatePresence>
        {selectedApplicant && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedApplicant(null);
                setSelectedApplicantFullData(null);
              }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:max-w-xl bg-white shadow-2xl z-70 flex flex-col"
            >
              <div className="sticky top-0 bg-white border-b z-30 px-5 py-4 flex items-center justify-between">
                <div className="flex flex-col">
                    <h2 className="text-[15px] font-semibold text-slate-900 leading-none mb-1">{getCandidateName(selectedApplicant)}</h2>
                    <p className="text-xs font-semibold text-slate-400 ">Candidate Profile</p>
                </div>
                <div className="flex items-center">
                   <button 
                      onClick={() => {
                        setSelectedApplicant(null);
                        setSelectedApplicantFullData(null);
                        setShowPhone(false);
                      }} 
                      className="p-1.5 hover:bg-slate-50 rounded-full transition-colors text-slate-300 hover:text-slate-900"
                   >
                    <X className="w-5 h-5" />
                   </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 space-y-6 pb-28">
                  {/* AVATAR SECTION */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl shrink-0 overflow-hidden shadow-inner shadow-indigo-100/50">
                      {selectedApplicant.job_seeker?.profile_photo ? (
                        <img src={getFullUrl(selectedApplicant.job_seeker.profile_photo)} alt="Profile" className="w-full h-full object-cover" />
                      ) : getCandidateInitial(selectedApplicant)}
                    </div>
                    <div className="pt-0.5">
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-xl font-semibold text-slate-900">{selectedApplicantFullData?.job_seeker?.name || selectedApplicantFullData?.job_seeker?.user?.name || getCandidateName(selectedApplicant)}</h1>
                        {selectedApplicant.status && <StatusBadge status={selectedApplicant.status} />}
                      </div>
                      <p className="text-sm font-semibold text-slate-500">{selectedApplicantFullData?.job_seeker?.title || selectedApplicant.job_seeker?.title || "Faculty Member"}</p>
                      <div className="mt-2.5 flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 w-fit">
                         <CheckCircle2 className="w-3.5 h-3.5" />
                         <span className="text-xs font-semibold">Verified Candidate</span>
                      </div>
                    </div>
                  </div>

                  {/* STATS GRID */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { label: 'EMAIL ADDRESS', value: selectedApplicantFullData?.job_seeker?.email || selectedApplicantFullData?.job_seeker?.user?.email || selectedApplicant.job_seeker?.user?.email || selectedApplicant.job_seeker?.email, icon: MailIcon },
                      { label: 'PROFESSIONAL EXP', value: `${selectedApplicantFullData?.job_seeker?.experience_years ?? selectedApplicant.job_seeker?.experience_years ?? 0}y Experience`, icon: Briefcase },
                      { label: 'CONTACT NUMBER', value: selectedApplicantFullData?.job_seeker?.phone || selectedApplicant.job_seeker?.phone || "Not Provided", isPhone: true, icon: PhoneIcon },
                      { label: 'CURRENT LOCATION', value: selectedApplicantFullData?.job_seeker?.location || selectedApplicant.job_seeker?.location || 'India', icon: MapPin }
                    ].map((item, id) => (
                      <div key={id} className="p-3.5 rounded-xl bg-white shadow-sm border border-slate-100 space-y-2 group transition-all hover:shadow-md hover:border-slate-200">
                        <div className="flex items-center justify-between">
                           <p className="text-xs font-semibold text-slate-400 ">{item.label}</p>
                           {/* @ts-ignore */}
                           {item.icon && <item.icon className="w-3 h-3 text-slate-300" />}
                        </div>
                        {item.isPhone ? (
                          <div className="space-y-1.5">
                             <p className="text-sm font-semibold text-slate-900 ">{showPhone ? item.value : '••••••••••'}</p>
                             {!showPhone ? (
                               <button 
                                 onClick={() => setShowPhone(true)}
                                 className="text-xs font-semibold text-primary hover:underline "
                               >
                                 VIEW & CALL
                               </button>
                             ) : (
                               <a 
                                 href={`tel:${item.value}`}
                                 className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1.5 "
                               >
                                 CALL NOW →
                               </a>
                             )}
                          </div>
                        ) : (
                          <p className="text-sm font-semibold text-slate-900 truncate ">{item.value}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* SUMMARY SECTION */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                       <div className="w-1 h-5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]" />
                       <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">Professional Summary</h3>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm min-h-[50px]">
                      <p className="text-sm text-slate-500 font-semibold leading-relaxed  whitespace-pre-wrap">
                        {selectedApplicantFullData?.job_seeker?.bio || selectedApplicant.job_seeker?.bio || "No career summary provided."}
                      </p>
                    </div>
                  </div>

                  {/* EXPERIENCES & EDUCATION CONTENT */}
                  {loadingProfile ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : selectedApplicantFullData && (
                    <div className="space-y-6 pt-2">
                       {/* EXPERIENCES */}
                       {selectedApplicantFullData.job_seeker?.experiences?.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                               <div className="w-1 h-5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
                               <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">Experience</h3>
                            </div>
                            <div className="space-y-2.5">
                               {selectedApplicantFullData.job_seeker.experiences.map((exp: any) => (
                                  <div key={exp.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-slate-200 transition-colors">
                                     <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-[12px] font-bold text-slate-900 uppercase tracking-tight">{exp.job_title}</h4>
                                        <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100  shrink-0 ml-2">
                                           {new Date(exp.start_date).getFullYear()} - {exp.is_current ? 'Present' : exp.end_date ? new Date(exp.end_date).getFullYear() : 'Present'}
                                        </span>
                                     </div>
                                     <p className="text-xs font-semibold text-primary  mb-2">{exp.company_name} <span className="text-slate-300 mx-1">•</span> {exp.location}</p>
                                     <p className="text-xs font-semibold text-slate-500 leading-relaxed ">{exp.description}</p>
                                  </div>
                               ))}
                            </div>
                          </div>
                       )}

                       {/* EDUCATION */}
                       {selectedApplicantFullData.job_seeker.educations?.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                               <div className="w-1 h-5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                               <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">Education</h3>
                            </div>
                            <div className="space-y-2.5">
                               {selectedApplicantFullData.job_seeker.educations.map((edu: any) => (
                                  <div key={edu.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-slate-200 transition-colors">
                                     <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-[12px] font-bold text-slate-900 uppercase tracking-tight">{edu.degree} in {edu.field_of_study}</h4>
                                        <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100  shrink-0 ml-2">
                                           {edu.start_year} - {edu.is_current ? 'Present' : edu.end_year}
                                        </span>
                                     </div>
                                     <p className="text-xs font-semibold text-slate-500 ">{edu.institution}</p>
                                  </div>
                               ))}
                            </div>
                          </div>
                       )}
                       
                       {/* SKILLS */}
                       {selectedApplicantFullData.job_seeker.skills?.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                               <div className="w-1 h-5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                               <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">Skills</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                               {selectedApplicantFullData.job_seeker.skills.map((skill: any, idx: number) => (
                                  <span key={idx} className="px-2.5 py-1 text-xs font-semibold  bg-slate-50 border border-slate-100 rounded-lg text-slate-600">
                                     {typeof skill === 'string' ? skill : skill.name}
                                  </span>
                               ))}
                            </div>
                          </div>
                       )}
                    </div>
                  )}

                  {/* RESUME PREVIEW & DOWNLOAD */}
                  <div className="space-y-4 pt-1">
                    <div className="flex items-center gap-3">
                       <div className="w-1 h-5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
                       <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">Resume</h3>
                    </div>
                    
                    <div className="space-y-3">
                       {selectedApplicant.resume?.file_url ? (
                         <>
                           <div className="rounded-2xl border border-slate-100 bg-white p-2 overflow-hidden aspect-4/3 group relative shadow-inner">
                              <iframe 
                                src={`${getFullUrl(selectedApplicant.resume.file_url)}#toolbar=0&view=FitH`} 
                                className="w-full h-full border-none rounded-xl bg-slate-50"
                                title="Resume"
                              />
                           </div>
                           <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                 <div className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center border border-red-100 shrink-0">
                                    <FileText className="w-5 h-5" />
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-xs font-semibold text-slate-900 truncate ">{selectedApplicant.resume?.file_name || "Resume_FileName.pdf"}</p>
                                    <p className="text-xs font-semibold text-slate-400  opacity-60">Verified Document • PDF</p>
                                 </div>
                              </div>
                              <Button 
                                onClick={() => {
                                  const url = getFullUrl(selectedApplicant.resume?.file_url);
                                  if (url) window.open(url, "_blank");
                                }}
                                variant="outline" 
                                className="h-8 px-3 rounded-lg text-xs font-semibold border-slate-200 hover:bg-slate-50 flex items-center gap-2 "
                              >
                                 <Download className="w-3.5 h-3.5" /> Download
                              </Button>
                           </div>
                         </>
                       ) : (
                         <div className="h-32 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center bg-slate-50/20">
                            <p className="text-xs font-semibold text-slate-300">No document provided</p>
                         </div>
                       )}
                    </div>
                  </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t flex items-center gap-2 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                    <select 
                      className={cn(
                        "h-8 px-3 w-32 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 focus:ring-1 focus:ring-primary outline-none cursor-pointer hover:bg-slate-100 transition-colors",
                        loading === selectedApplicant.id && "opacity-50 pointer-events-none"
                      )}
                      value={selectedApplicant.contact_status || ""}
                      onChange={(e) => updateContactStatus(selectedApplicant.id, e.target.value)}
                      disabled={loading === selectedApplicant.id}
                    >
                       <option value="">Mark As</option>
                       <option value="called">Called</option>
                       <option value="messaged">Messaged</option>
                       <option value="not_picked">Not Picked</option>
                       <option value="not_reached">Not Reached</option>
                    </select>

                    <div className="flex flex-1 justify-end items-center gap-2">
                      <Button 
                        className="h-8 px-4 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm border border-rose-100"
                        onClick={() => rejectApplication(selectedApplicant.id)}
                        disabled={loading === selectedApplicant.id}
                      >
                         {loading === selectedApplicant.id && selectedApplicant.status === 'rejected' ? (
                           <Loader2 className="w-3 h-3 animate-spin" />
                         ) : (
                           <X className="w-3 h-3" />
                         )}
                         {selectedApplicant.status?.toLowerCase() === 'rejected' ? 'Rejected' : 'Reject'}
                      </Button>

                      {selectedApplicant.status?.toLowerCase() !== 'rejected' && (
                        <Button 
                          className="h-8 px-5 rounded-lg bg-emerald-600 text-white font-semibold text-xs shadow-md shadow-emerald-200/50 hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5"
                          onClick={() => updateStatus(selectedApplicant.id, "shortlisted")}
                          disabled={loading === selectedApplicant.id}
                        >
                           {loading === selectedApplicant.id && selectedApplicant.status === 'shortlisted' && (
                             <Loader2 className="w-3 h-3 animate-spin" />
                           )}
                           {selectedApplicant.status?.toLowerCase() === 'shortlisted' ? 'Shortlisted' : 'Shortlist'}
                        </Button>
                      )}
                    </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Icons
// @ts-ignore
const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);
// @ts-ignore
const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);
