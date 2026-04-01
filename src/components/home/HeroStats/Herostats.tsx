"use client";

import { 
  BookOpen, 
  Building2, 
  Users, 
  MapPin 
} from "lucide-react";
import StatsCard from "@/shared/cards/StatsCard/StatsCard";

interface HeroStatsProps {
  stats: {
    total_jobs: number;
    total_companies: number;
    total_candidates: number;
    total_recruiters: number;
  } | null;
}

export const HeroStats = ({ stats }: HeroStatsProps) => {
  const statsData = [
    { icon: BookOpen, target: stats?.total_jobs ?? 0, suffix: "+", label: "Teaching Jobs" },
    { icon: Building2, target: stats?.total_companies ?? 0, suffix: "+", label: "Schools & Institutes" },
    { icon: Users, target: stats?.total_candidates ?? 0, suffix: "+", label: "Teachers Registered" },
    { icon: MapPin, target: stats?.total_recruiters ?? 0, suffix: "+", label: "Cities" },
  ];

 return (
  <section className="py-12 bg-slate-50/10 border-y border-slate-100/50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        {statsData.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  </section>
);
};

export default HeroStats;
