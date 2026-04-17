"use client";

import { MapPin, Users } from "lucide-react";
import Link from "next/link";


import { CompanyCardProps } from "@/types/components";

const CompanyCard = ({ name, type = "", location, city, openJobs = 0, slug = "institution", logo }: CompanyCardProps & { city?: string }) => {
  const cleanSlug = (slug || "").replace(/^[:/]+/, "");
  
  return (
    <Link
      href={`/institutions/${cleanSlug}`}
      className="group relative flex flex-col items-center text-center h-[250px] rounded-[16px] border border-primary/20 bg-white p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300"
    >
      {/* Box Logo Section - MATCHING REFERENCE */}
      <div className="h-16 w-16 mb-4 rounded-xl bg-[#f8fafc] flex items-center justify-center p-2 relative z-10 border border-slate-50">
        {logo ? (
          <img src={logo} alt={name} className="h-full w-full object-contain overflow-hidden" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-[#1e3a8a] font-bold text-lg rounded-md">
            {name[0]}
          </div>
        )}
      </div>
      
      {/* Info Section */}
      <div className="space-y-0.5 mt-0 mb-4">
        <h3 className="text-[16px] font-bold text-[#1e293b] group-hover:text-blue-700 transition-colors leading-tight line-clamp-2 min-h-[38px] flex items-center justify-center">
          {name}
        </h3>
        <p className="text-[12px] font-medium text-slate-400 line-clamp-1 uppercase tracking-wide">
          {type || "Institution"}
        </p>
      </div>

      {/* Metadata Row - Centered and Clean */}
      <div className="flex items-center justify-center gap-3 text-[12px] font-semibold text-slate-500/80 mt-auto pt-3 border-t border-slate-50 w-full">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-slate-400" />
          <span>{city || location || "Remote"}</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 rounded-full text-[10px] font-bold text-blue-600/80">
          <Users className="w-2.5 h-2.5" />
          <span>{openJobs} jobs</span>
        </div>
      </div>
    </Link>
  );
};

export default CompanyCard;
