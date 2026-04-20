"use client";

import { ArrowUpRight } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";

export function RecruitingCard() {
  return (
    <div className="bg-[#EEF2FF] rounded-[24px] p-6 relative overflow-hidden group border border-indigo-100">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
      <h4 className="text-lg font-bold text-black mb-2 relative z-10">
        Recruiting?
      </h4>
      <p className="text-[12.5px] text-slate-500 mb-6 relative z-10 leading-relaxed font-medium">
        Advertise your jobs to millions of monthly users and search our database.
      </p>
      <Button className="w-full rounded-xl h-11 text-xs font-bold bg-[#312E81] text-white flex items-center justify-center gap-2 relative z-10 shadow-lg shadow-indigo-100 hover:bg-[#1E1B4B] transition-all">
        Start Recruiting
        <div className="bg-white/20 rounded-full p-1">
          <ArrowUpRight className="h-3 w-3" />
        </div>
      </Button>
    </div>
  );
}

export default RecruitingCard;

