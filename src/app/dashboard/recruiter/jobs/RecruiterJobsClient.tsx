"use client";

import { useState, useMemo } from "react";
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Search, 
  PlusCircle, 
  Clock,
  TrendingUp,
  Layout,
  MoreVertical,
  Edit2,
  RefreshCcw,
  CheckSquare,
  Square,
  AlertCircle,
  Activity,
  DollarSign
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { Input } from "@/shared/ui/Input/Input";
import { cn } from "@/lib/utils";

interface Job {
  id: number;
  employer_id: number;
  created_by: number;
  category_id: number;
  title: string;
  description: string;
  salary_min: string;
  salary_max: string;
  vacancies: number;
  location: string;
  experience_required: number;
  experience_type: string;
  job_type: string;
  job_status: string;
  status: string;
  featured: number;
  admin_featured: number;
  application_deadline: string | null;
  slug: string;
  created_at: string;
  updated_at: string;
  keywords: string;
  gender: string;
  expires_at: string;
  is_active: number;
}

const StatusBadge = ({ status }: { status: string }) => {
  const isApproved = status === 'approved' || status === 'open';
  const isExpired = status.toLowerCase().includes('expired');
  
  return (
    <span className={cn(
      "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight border",
      isApproved 
        ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" 
        : isExpired
        ? "bg-gray-100 text-gray-400 border-gray-200"
        : "bg-amber-50 text-amber-600 border-amber-100/50"
    )}>
      {status}
    </span>
  );
};

export default function RecruiterJobsClient({ 
  jobs, 
  totalJobs 
}: { 
  jobs: Job[]; 
  totalJobs: number;
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('Active');

  const filteredJobs = useMemo(() => {
    const now = new Date();
    
    return jobs.filter((job) => {
      const matchesSearch = job?.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
                          job?.location?.toLowerCase()?.includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      const isExpired = job.expires_at ? new Date(job.expires_at) < now : false;
      const isApproved = job.status === 'approved';
      const isPending = job.status === 'pending';

      switch (activeTab) {
        case 'Active': return isApproved && !isExpired;
        case 'Pending': return isPending;
        case 'Expired': return isExpired;
        case 'Featured': return job.featured === 1;
        default: return true;
      }
    });
  }, [jobs, searchTerm, activeTab]);

  const toggleSelect = (id: number) => {
    setSelectedJobs(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleJobClick = (id: number) => {
    router.push(`/dashboard/recruiter/jobs/view/${id}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans pb-10 px-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Job Inventory</h1>
          <p className="text-sm text-gray-400 font-medium mt-1 italic">Manage your {totalJobs} job listings</p>
        </div>
        <Link href="/dashboard/recruiter/post-job">
          <button className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-tight shadow-md transition-all">
            Create Job Post
          </button>
        </Link>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search jobs..."
            className="pl-10 h-10 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-50 border border-gray-100 overflow-x-auto no-scrollbar max-w-full">
          {['Active', 'Pending', 'Expired', 'Featured'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                activeTab === tab
                  ? "bg-white text-blue-600 shadow-sm border border-gray-100"
                  : "text-gray-400 hover:text-gray-600"
              )}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => {
            const isExpired = job.expires_at ? new Date(job.expires_at) < new Date() : false;
            const hasAlert = isExpired && job.status === 'approved';

            return (
              <div key={job.id} className="relative group">
                <div 
                  onClick={() => handleJobClick(job.id)}
                  className={cn(
                    "bg-white border rounded-2xl transition-all duration-300 flex flex-col sm:flex-row items-center p-5 gap-6 cursor-pointer",
                    selectedJobs.includes(job.id) ? "border-blue-200 bg-blue-50/10 shadow-inner" : "border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200"
                  )}
                >
                  {/* Selection Checkbox */}
                  <div className="shrink-0">
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        toggleSelect(job.id); 
                      }}
                      className={cn(
                        "transition-colors",
                        selectedJobs.includes(job.id) ? "text-blue-500" : "text-gray-200 hover:text-blue-300"
                      )}
                    >
                      {selectedJobs.includes(job.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-5 space-y-1.5">
                       <h3 className="text-lg font-bold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">
                          {job.title}
                       </h3>
                       <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 font-medium">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                          <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {job.job_type.replace('_', ' ')}</span>
                       </div>
                       <div className="flex gap-2 pt-1">
                          <StatusBadge status={job.status} />
                          <StatusBadge status={job.job_status} />
                       </div>
                    </div>

                    {/* Stats */}
                    <div className="md:col-span-4 flex items-center justify-around border-x border-gray-50 px-4">
                       <div className="text-center group-hover:scale-105 transition-transform duration-300">
                          <div className="flex items-center justify-center gap-1">
                             <span className="text-xl font-bold text-blue-600">48</span>
                             <span className="bg-blue-600/10 text-[9px] text-blue-600 px-1.5 py-0.5 rounded-full font-bold">New</span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-semibold mt-1">Applicants</p>
                       </div>
                       <div className="text-center">
                          <span className="text-xl font-bold text-gray-800">12</span>
                          <p className="text-[10px] text-gray-400 font-semibold mt-1">Shortlisted</p>
                       </div>
                    </div>

                    {/* Meta/Budget */}
                    <div className="md:col-span-3 flex flex-col items-end text-right space-y-1">
                       <p className="text-[10px] text-gray-300 font-bold uppercase tracking-tight">Post Data</p>
                       <p className="text-xs font-semibold text-gray-600">₹{(parseInt(job.salary_max) / 100000).toFixed(1)}L Salary</p>
                       <p className="text-[10px] text-gray-400 font-medium">Experience: {job.experience_required}+ yrs</p>
                    </div>
                  </div>
                </div>

                {/* Contextual Action Notice */}
                {hasAlert && (
                  <div className="mt-2 mx-6 bg-white border border-dashed border-amber-200 rounded-xl p-3 flex items-center justify-between shadow-sm animate-in fade-in duration-500">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                      <p className="text-xs text-gray-600 font-medium">Job #{job.id} has expired. Would you like to close it?</p>
                    </div>
                    <div className="flex gap-2">
                       <button 
                         onClick={(e) => e.stopPropagation()}
                         className="text-[10px] font-bold text-amber-600 px-3 py-1 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                        >
                          Yes, Close
                        </button>
                       <button 
                         onClick={(e) => e.stopPropagation()}
                         className="text-[10px] font-bold text-gray-400 px-3 py-1 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Dismiss
                        </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
            <Briefcase className="w-12 h-12 text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No Postings Found</h3>
            <p className="text-sm text-gray-400 mt-1">No jobs match your current search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
