"use client";

import { useState } from "react";
import { MapPin, Briefcase, ArrowUpRight } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { useRouter } from "next/navigation";
import { useClientSession } from "@/hooks/useClientSession";
import { toast } from "sonner";
import JobSeekerAuthModal from "@/components/auth/JobSeekerAuthModal";
import JobSeekerRegisterModal from "@/components/auth/JobSeekerRegisterModal";

export interface JobData {
  id: string | number;
  slug?: string | number | null;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  experience: string;
  logo?: string;
}

const JobListingCard = ({
  id,
  title,
  company,
  location,
  type,
  salary,
  experience,
  logo,
  slug,
}: JobData) => {
  const router = useRouter();
  const { isLoggedIn, user } = useClientSession();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  const jobPath = slug || `job-${id}`;
  const jobHref = `/${jobPath}`;

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    if (user?.role === "employer") {
      toast.error("Employers cannot apply for jobs.");
      return;
    }
    router.push(`/apply/${jobPath}`);
  };

  const handleAuthSuccess = () => {
    router.push(`/apply/${jobPath}`);
  };

  return (
    <>
      <div
        className="group relative bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] hover:border-primary/20 cursor-pointer"
        onClick={() => router.push(jobHref)}
      >
        {/* Header Section: Logo & Badges */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 shrink-0 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm flex items-center justify-center overflow-hidden">
              {logo ? (
                <img src={logo} alt={company} className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary font-bold text-2xl uppercase">
                  {company[0]}
                </div>
              )}
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                {company}
              </h4>
              <p className="text-sm font-medium text-slate-400">
                {location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Openings:</span>
                <span className="bg-primary/10 text-primary h-6 px-2 flex items-center justify-center rounded-md text-xs font-bold">
                  1
                </span>
             </div>
             <div className="bg-[#E9F1FF] text-[#2D6ADF] px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap">
               {type.replaceAll("_", " ")}
             </div>
          </div>
        </div>

        {/* Job Title */}
        <div className="mb-8">
          <h3 className="text-3xl font-black text-slate-900 leading-tight group-hover:translate-x-1 transition-transform">
            {title}
          </h3>
        </div>

        {/* Footer Section: Meta & Apply */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-6 border-t border-slate-50">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-slate-500">{experience}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                <MapPin className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-slate-500">{location}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-tight">₹ {salary.replace("₹", "")}</span>
            </div>
          </div>

          <Button 
            onClick={handleApply}
            variant="outline"
            className="rounded-full h-12 px-8 flex items-center gap-3 border-2 border-slate-100 hover:border-primary hover:bg-primary hover:text-white transition-all font-bold group"
          >
            Apply Now
            <div className="bg-slate-100 rounded-full p-1 group-hover:bg-white/20 transition-colors">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </Button>
        </div>
      </div>

      <JobSeekerAuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        onSwitchToRegister={() => { setShowAuthModal(false); setTimeout(() => setShowRegisterModal(true), 200); }}
      />
      <JobSeekerRegisterModal
        open={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={handleAuthSuccess}
        onSwitchToLogin={() => { setShowRegisterModal(false); setTimeout(() => setShowAuthModal(true), 200); }}
      />
    </>
  );
};

export default JobListingCard;
