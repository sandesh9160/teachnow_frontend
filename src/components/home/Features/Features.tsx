"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";

const teacherClassroomImg = "/images/teacher-classroom.jpg";
const employerHiringImg = "/images/employer-hiring.jpg";

export const Features = () => {
  return (
    <section className="bg-[#f8faff] py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-[32px] md:text-[42px] font-bold text-black tracking-tight">
            Why <span className="text-blue-600">TeachNow</span>?
          </h2>
          <p className="mt-4 text-[17px] md:text-[19px] text-black/80 font-semibold">
            Empowering educators and enabling schools to thrive together
          </p>
        </div>

        <div className="grid gap-8 lg:gap-10 md:grid-cols-2">
          {/* For Job Seekers */}
          <div className="group relative rounded-[24px] border border-slate-200/60 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full">
            <div className="h-64 sm:h-72 overflow-hidden relative">
              <img
                src={teacherClassroomImg}
                alt="Teacher in classroom"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            
            <div className="p-8 md:p-10 flex flex-col flex-1">
              <h3 className="text-2xl font-bold text-black">For Job Seekers</h3>
              <p className="mt-3 text-[16px] text-black/70 font-medium leading-relaxed">
                TeachNow helps teachers discover verified job opportunities across schools, colleges, and online
                teaching platforms.
              </p>
              
              <ul className="mt-8 space-y-4 flex-1">
                {[
                  "Find teaching jobs across India",
                  "AI Resume Builder for teachers",
                  "Quick job applications",
                  "Verified schools and institutions",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[15px] text-black font-semibold">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              
              <Button asChild variant="hero" size="lg" className="mt-10 h-12 px-8 gap-2 bg-blue-600 hover:bg-blue-700 transition-all font-bold rounded-xl shadow-lg shadow-blue-600/20">
                <Link href="/jobs" className="flex items-center gap-2">
                  Explore Jobs <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* For Employers */}
          <div className="group relative rounded-[24px] border border-slate-200/60 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full">
            <div className="h-64 sm:h-72 overflow-hidden relative">
              <img
                src={employerHiringImg}
                alt="Employer hiring"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            
            <div className="p-8 md:p-10 flex flex-col flex-1">
              <h3 className="text-2xl font-bold text-black">For Employers</h3>
              <p className="mt-3 text-[16px] text-black/70 font-medium leading-relaxed">
                TeachNow enables institutions to quickly hire qualified teachers through advanced discovery tools.
              </p>
              
              <ul className="mt-8 space-y-4 flex-1">
                {[
                  "Post teaching jobs instantly",
                  "Access qualified educator profiles",
                  "Simplified recruitment workflow",
                  "Affordable hiring plans",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[15px] text-black font-semibold">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              
              <Button asChild variant="hero" size="lg" className="mt-10 h-12 px-8 gap-2 bg-blue-600 hover:bg-blue-700 transition-all font-bold rounded-xl shadow-lg shadow-blue-600/20">
                <Link href="/auth/employer-login" className="flex items-center gap-2">
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
