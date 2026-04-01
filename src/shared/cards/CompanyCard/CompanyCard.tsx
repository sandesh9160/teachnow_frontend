"use client";

import { MapPin, Users } from "lucide-react";
import Link from "next/link";


import { CompanyCardProps } from "@/types/components";

const CompanyCard = ({ name, type = "", location, city, openJobs = 0, slug = "institution", logo }: CompanyCardProps & { city?: string }) => {
  const cleanSlug = (slug || "").replace(/^[:/]+/, "");
  
  return (
    <Link
      href={`/institutions/${cleanSlug}`}
      className="group relative flex flex-col items-center text-center h-full rounded-2xl border border-primary/20 bg-white p-5 shadow-sm transition-all duration-500 hover:shadow-xl hover:border-primary hover:-translate-y-1.5"
    >
      {/* Logo Section */}
      <div className="h-16 w-16 mb-4 rounded-2xl border border-slate-100 bg-white p-2.5 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:shadow-md relative z-10 overflow-hidden flex items-center justify-center">
        {logo ? (
          <img src={logo} alt={name} className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary font-bold text-2xl uppercase">
            {name[0]}
          </div>
        )}
      </div>
      
      {/* Info Section */}
      <div className="space-y-1 mb-6">
        <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
          {name}
        </h3>
        {type && (
          <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">
            {type}
          </p>
        )}
      </div>

      {/* Details Row */}
      <div className="w-full pt-4 border-t border-slate-50 flex items-center justify-center gap-4 text-xs text-slate-500 font-bold mb-6">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-primary/40" />
          {city || location || "Remote"}
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-primary/40" />
          {openJobs} Jobs
        </span>
      </div>

      {/* Action Button */}
      <div className="mt-auto w-full h-10 flex items-center justify-center rounded-xl bg-primary text-white transition-all duration-300 font-bold text-xs shadow-lg shadow-primary/20 group-hover:shadow-primary/40 active:scale-95 hover:brightness-110">
        View more
      </div>
    </Link>
  );
};

export default CompanyCard;
