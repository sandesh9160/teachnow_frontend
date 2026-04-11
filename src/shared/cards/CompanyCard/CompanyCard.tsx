"use client";

import { MapPin, Users } from "lucide-react";
import Link from "next/link";


import { CompanyCardProps } from "@/types/components";

const CompanyCard = ({ name, type = "", location, city, openJobs = 0, slug = "institution", logo }: CompanyCardProps & { city?: string }) => {
  const cleanSlug = (slug || "").replace(/^[:/]+/, "");
  
  return (
    <Link
      href={`/institutions/${cleanSlug}`}
      className="group relative flex flex-col items-center text-center h-full rounded-xl border-2 border-blue-500 bg-white p-5 shadow-none transition-all duration-300 overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-36 h-36 bg-blue-50 rounded-full -mr-16 -mt-16 animate-pulse pointer-events-none" />

      {/* Logo Section */}
      <div className="h-14 w-14 mb-4 rounded-lg border border-slate-100 bg-white p-2.5 shadow-sm transition-all duration-500 group-hover:scale-110 flex items-center justify-center relative z-10">
        {logo ? (
          <img src={logo} alt={name} className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-indigo-50 text-indigo-600 font-medium text-xl">
            {name[0]}
          </div>
        )}
      </div>
      
      {/* Info Section */}
      <div className="space-y-1 mb-4 relative z-10">
        <h3 className="font-display text-[17px] font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[46px] leading-tight tracking-tight">
          {name}
        </h3>
        {type && (
          <p className="text-[11px] font-medium text-indigo-700 opacity-90 mx-auto max-w-[180px]">
            {type}
          </p>
        )}
      </div>

      {/* Metadata Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-5 relative z-10">
        <span className="bg-slate-100 text-slate-900 px-3 py-1 rounded-lg text-[11px] font-medium border border-slate-200 flex items-center gap-1.5 tracking-tight">
           <MapPin className="w-3.5 h-3.5 text-indigo-500" />
           <span className="truncate max-w-[100px]">{city || location || "Remote"}</span>
        </span>
        <span className="bg-emerald-50 text-emerald-900 px-3 py-1 rounded-lg text-[11px] font-medium border border-emerald-100 flex items-center gap-1.5 tracking-tight">
           <Users className="w-3.5 h-3.5 text-emerald-600" />
           {openJobs} Jobs
        </span>
      </div>

      {/* Action Button */}
      <div className="mt-auto w-full h-11 flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-300 font-bold text-[13px] active:scale-95">
        Explore Institution
      </div>
    </Link>
  );
};

export default CompanyCard;
