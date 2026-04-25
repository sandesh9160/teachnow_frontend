"use client";

import { MapPin, Users } from "lucide-react";
import Link from "next/link";


import { CompanyCardProps } from "@/types/components";

const CompanyCard = ({ name, type = "", location, city, openJobs = 0, slug = "institution", logo }: CompanyCardProps & { city?: string }) => {
  const cleanSlug = (slug || "").replace(/^[:/]+/, "");

  return (
    <Link
      href={`/institutions/${cleanSlug}`}
      className="group relative flex flex-col items-center text-center h-[190px] rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-500"
    >
      {/* Box Logo Section */}
      <div className="h-14 w-14 mb-3 rounded-lg bg-slate-50 flex items-center justify-center p-2 relative z-10 border border-slate-100/50 transition-transform duration-500 group-hover:scale-105">
        {logo ? (
          <img src={logo} alt={name} className="h-full w-full object-contain overflow-hidden" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-200 text-[#1e3a8a] font-semibold text-lg rounded-xl">
            {name[0]}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex-1 min-h-0 flex flex-col justify-start">
        <h3 className="text-[17px] font-semibold text-black leading-tight mb-1 line-clamp-2">
          {name}
        </h3>
        <p className="text-[13px] font-medium text-slate-400 line-clamp-1">
          {type || "Institution"}
        </p>
      </div>

      {/* Metadata Row - Single Centered Line */}
      <div className="flex items-center justify-center gap-4 text-[13px] font-medium text-slate-500 w-full mt-auto">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{city || location || "Remote"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>{openJobs} jobs</span>
        </div>
      </div>
    </Link>
  );
};

export default CompanyCard;
