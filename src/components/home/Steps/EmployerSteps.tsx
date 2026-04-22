"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Create Employer Account",
    desc: "Register as an employer to start posting teaching vacancies.",
    img: "/images/steps/step1-signup.png",
  },
  {
    step: 2,
    title: "Post Teaching Job",
    desc: "Add job details including subject, experience, salary, and location.",
    img: "/images/steps/step2-post-job.png",
  },
  {
    step: 3,
    title: "Receive Applications",
    desc: "Teachers apply to your job listings instantly.",
    img: "/images/steps/step3-receive-apps.png",
  },
  {
    step: 4,
    title: "Hire the Best Teacher",
    desc: "Review applicants and hire qualified educators quickly.",
    img: "/images/steps/step4-hire.png",
  },
];

export const EmployerSteps = () => {
  return (
    <section className="pt-16 pb-24 bg-white text-black">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="text-center mb-14 px-4">
          <h2 className="text-[30px] md:text-[36px] font-bold text-[#111827] tracking-tight mb-2">
            Steps to Post a Job
          </h2>
          <p className="text-[16px] md:text-[18px] text-slate-500 font-normal">
            Hire qualified teachers quickly with TeachNow.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-0">
          {steps.map((s) => (
            <div
              key={s.step}
              className="group w-full rounded-[16px] border border-slate-200/80 bg-white p-6 transition-all duration-300 flex flex-col items-center text-center h-full shadow-sm hover:shadow-md"
            >
              <div className="relative mb-6 h-36 w-full flex items-center justify-center">
                <img
                  src={s.img}
                  alt={s.title}
                  className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-white text-xs font-bold mb-4 shadow-sm">
                {s.step}
              </div>

              <h3 className="text-xl font-semibold text-black leading-tight mb-3">
                {s.title}
              </h3>
              <p className="text-[14px] text-black/70 font-normal leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-16 flex justify-center">
          <Button variant="hero" size="xl" asChild className="rounded-2xl px-12 transition-all shadow-lg shadow-blue-900/20 active:scale-95">
            <Link href="/auth/login" className="flex items-center gap-3">
              Start Hiring Now <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EmployerSteps;
