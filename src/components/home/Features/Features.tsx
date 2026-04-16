"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";

const teacherClassroomImg = "/images/teacher-classroom.jpg";
const employerHiringImg = "/images/employer-hiring.jpg";

export const Features = () => {
  return (
    <section className="border-t border-border bg-card py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-12 pl-2">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Why <span className="text-primary/80">TeachNow</span>?
          </h2>
          <p className="mt-2 text-lg text-slate-500 font-medium tracking-wide">
            Empowering educators and enabling schools to thrive together
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">


          {/* For Job Seekers */}
          <div className="group relative rounded-2xl border border-slate-200/60 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full -mr-16 -mt-16 pointer-events-none z-20" />
            
            <div className="h-52 overflow-hidden relative">
              <img
                src={teacherClassroomImg}
                alt="Teacher in classroom"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-8 relative z-10">
              <h3 className="font-display text-xl font-bold text-slate-900">For Job Seekers</h3>
              <p className="mt-2 text-[15px] text-slate-500 font-medium leading-relaxed">
                TeachNow helps teachers discover verified job opportunities across schools, colleges, and online
                teaching platforms.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Find teaching jobs across India",
                  "AI Resume Builder for teachers",
                  "Quick job applications",
                  "Verified schools and institutions",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-blue-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant="hero" size="lg" className="mt-8 gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                <Link href="/jobs">
                  Explore Jobs <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>


          {/* For Employers */}
          <div className="group relative rounded-2xl border border-slate-200/60 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full -mr-16 -mt-16 pointer-events-none z-20" />
            
            <div className="h-52 overflow-hidden relative">
              <img
                src={employerHiringImg}
                alt="Employer hiring"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-8 relative z-10">
              <h3 className="font-display text-xl font-bold text-slate-900">For Employers</h3>
              <p className="mt-2 text-[15px] text-slate-500 font-medium leading-relaxed">
                TeachNow enables institutions to quickly hire qualified teachers.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Post teaching jobs instantly",
                  "Access qualified educator profiles",
                  "Simplified recruitment workflow",
                  "Affordable hiring plans",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-blue-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant="hero" size="lg" className="mt-8 gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                <Link href="/auth/employer-login">
                  Hire Teachers <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
