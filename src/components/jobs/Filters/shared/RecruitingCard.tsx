"use client";

import { ArrowUpRight } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";

export function RecruitingCard() {
  return (
    <div className="bg-[#E9F1FF] rounded-[2.5rem] p-8 relative overflow-hidden group">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
      <h4 className="text-xl font-bold text-slate-900 mb-4 relative z-10">
        Recruiting?
      </h4>
      <p className="text-sm text-slate-600 mb-8 relative z-10 leading-relaxed font-medium">
        Advertise your jobs to millions of monthly users and search 15.8 million CVs in our database.
      </p>
      <Button className="w-full rounded-2xl h-14 font-bold flex items-center justify-center gap-3 relative z-10 shadow-lg shadow-primary/20">
        Start Recruiting Now
        <div className="bg-white/20 rounded-full p-1">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </Button>
    </div>
  );
}

export default RecruitingCard;

