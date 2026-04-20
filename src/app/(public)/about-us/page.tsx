"use client";

import { GraduationCap, Users, Building2, MapPin, Target, Heart, Shield } from "lucide-react";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";

export default function AboutPage() {
  const breadcrumbItems = [{ label: "About Us", isCurrent: true }];

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Consistent Breadcrumb Bar */}
      <div className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-16 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-12 py-2">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Compact Hero Section */}
      <section className="bg-white border-b border-slate-100 py-8 sm:py-10">
        <div className="w-full px-4 sm:px-6 lg:px-12 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 md:text-4xl tracking-tight leading-tight">
              About <span className="text-primary italic">TeachNow</span>
            </h1>
            <p className="mt-3 text-base text-slate-500 font-medium leading-relaxed max-w-xl mx-auto">
              India's leading job portal connecting educators with top schools, colleges, and edtech companies.
            </p>
          </div>
        </div>
      </section>

      <div className="w-full px-4 py-8 sm:px-6 lg:px-12 space-y-8">
        {/* Compact Mission/Vision Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Target, title: "Our Mission", desc: "Connecting qualified educators with institutions through a seamless hiring process." },
            { icon: Heart, title: "Our Vision", desc: "To be India's most trusted platform for education sector employment." },
            { icon: Shield, title: "Our Values", desc: "Transparency, trust, and dedication to quality education drive everything we do." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200/60 bg-white p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-900">{item.title}</h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-normal">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Compact Stats Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: GraduationCap, value: "10,000+", label: "Teaching Jobs" },
            { icon: Building2, value: "5,000+", label: "Institutes" },
            { icon: Users, value: "50,000+", label: "Teachers" },
            { icon: MapPin, value: "200+", label: "Cities" },
          ].map((stat) => (
            <div key={stat.label} className="text-center rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm">
              <stat.icon className="mx-auto mb-1.5 h-6 w-6 text-primary" />
              <div className="text-xl font-bold text-slate-900 leading-none">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
