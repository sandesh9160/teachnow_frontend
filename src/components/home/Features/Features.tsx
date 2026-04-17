"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";

const teacherClassroomImg = "/images/teacher-classroom.jpg";
const employerHiringImg = "/images/employer-hiring.jpg";

export const Features = () => {
  return (
    <section className="bg-[#f8faff] py-20 md:py-24">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-[32px] md:text-[42px] font-bold text-black tracking-tight">
            Why TeachNow?
          </h2>
          <p className="mt-4 text-[17px] md:text-[19px] text-black font-semibold">
            Empowering educators and enabling schools to thrive together
          </p>
        </div>

        <div className="grid gap-8 lg:gap-10 md:grid-cols-2">
          {/* For Job Seekers */}
          <div className="group relative rounded-[16px] border border-slate-200/80 bg-white overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 flex flex-col h-full">
            <div className="h-64 sm:h-72 overflow-hidden relative">
              <img
                src={teacherClassroomImg}
                alt="Teacher in classroom"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            
            <div className="p-8 md:p-10 flex flex-col flex-1">
              <h3 className="text-xl font-bold text-[#111827]">For Job Seekers</h3>
              <p className="mt-3 text-[14px] text-slate-500 font-medium leading-relaxed">
                TeachNow helps teachers discover verified job opportunities across schools, colleges, and online
                teaching platforms.
              </p>
              
              <ul className="mt-6 space-y-3 flex-1">
                {[
                  "Find teaching jobs across India",
                  "AI Resume Builder for teachers",
                  "Quick job applications",
                  "Verified schools and institutions",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[13px] text-slate-600 font-medium">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              
              <div className="mt-8">
                <Button asChild className="bg-[#2e3fc7] hover:bg-[#1e2cb2] text-white px-7 h-11 rounded-xl font-bold transition-all shadow-md shadow-blue-100 flex items-center justify-center w-fit gap-2">
                  <Link href="/jobs">
                    Explore Jobs <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* For Employers */}
          <div className="group relative rounded-[16px] border border-slate-200/80 bg-white overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 flex flex-col h-full">
            <div className="h-64 sm:h-72 overflow-hidden relative">
              <img
                src={employerHiringImg}
                alt="Employer hiring"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            
            <div className="p-8 md:p-10 flex flex-col flex-1">
              <h3 className="text-xl font-bold text-[#111827]">For Employers</h3>
              <p className="mt-3 text-[14px] text-slate-500 font-medium leading-relaxed">
                TeachNow enables institutions to quickly hire qualified teachers through advanced discovery tools.
              </p>
              
              <ul className="mt-6 space-y-3 flex-1">
                {[
                  "Post teaching jobs instantly",
                  "Access qualified educator profiles",
                  "Simplified recruitment workflow",
                  "Affordable hiring plans",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[13px] text-slate-600 font-medium">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              
              <div className="mt-8">
                <Button asChild className="bg-[#2e3fc7] hover:bg-[#1e2cb2] text-white px-7 h-11 rounded-xl font-bold transition-all shadow-md shadow-blue-100 flex items-center justify-center w-fit gap-2">
                  <Link href="/auth/employer-login">
                    Hire Teachers <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
