"use client";

import { GraduationCap, Users, Building2, MapPin, Target, Heart, Shield } from "lucide-react";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";

export default function AboutPage() {
  const breadcrumbItems = [{ label: "About Us", isCurrent: true }];

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Consistent Breadcrumb Bar */}
      <div className="border-b border-border bg-white/80 backdrop-blur-md sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="bg-white border-b border-slate-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 md:text-5xl tracking-tight leading-tight">About <span className="text-primary italic">TeachNow</span></h1>
            <p className="mt-5 text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">India's leading job portal connecting educators with top schools, colleges, and edtech companies.</p>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {[
            { icon: Target, title: "Our Mission", desc: "To bridge the gap between qualified educators and institutions, making the hiring process seamless and efficient." },
            { icon: Heart, title: "Our Vision", desc: "To become India's most trusted platform for education sector employment, empowering teachers nationwide." },
            { icon: Shield, title: "Our Values", desc: "Transparency, trust, and dedication to quality education drive everything we do at TeachNow." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-card p-6 shadow-card text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { icon: GraduationCap, value: "10,000+", label: "Teaching Jobs" },
            { icon: Building2, value: "5,000+", label: "Schools & Institutes" },
            { icon: Users, value: "50,000+", label: "Teachers Registered" },
            { icon: MapPin, value: "200+", label: "Cities" },
          ].map((stat) => (
            <div key={stat.label} className="text-center rounded-xl border border-border bg-card p-6 shadow-card">
              <stat.icon className="mx-auto mb-2 h-7 w-7 text-primary" />
              <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
