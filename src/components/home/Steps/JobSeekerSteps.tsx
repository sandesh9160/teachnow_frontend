"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Create Your Profile",
    desc: "Sign up and create your professional profile with your qualifications, experience, and skills.",
    img: "/images/steps/profile-setup.png",
  },
  {
    step: "02",
    title: "Build Your Resume",
    desc: "Use the AI Resume Builder to create a professional resume in minutes.",
    img: "/images/steps/resume-builder.png",
  },
  {
    step: "03",
    title: "Search Jobs",
    desc: "Explore thousands of jobs by role, city, and industry.",
    img: "/images/steps/job-search.png",
  },
  {
    step: "04",
    title: "Apply & Get Hired",
    desc: "Apply to companies easily and track your applications.",
    img: "/images/steps/job-success.png",
  },
];

export const JobSeekerSteps = () => {
  return (
    <section className="bg-white border-t border-border py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-12 pl-2">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Get Your <span className="text-primary/80">Teaching Job</span> in 4 Simple Steps
          </h2>
          <p className="mt-2 text-lg text-slate-500 font-medium tracking-wide">
            Follow these steps to land your dream job on TeachNow
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.step}
              className="group relative rounded-xl border-2 border-blue-500 bg-white p-6 shadow-none transition-all duration-300 overflow-hidden text-center"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full -mr-12 -mt-12 animate-pulse pointer-events-none z-0" />
              
              <div className="relative z-10 mx-auto mb-4 h-36 w-36 overflow-hidden rounded-xl">
                <img
                  src={s.img}
                  alt={s.title}
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-sm font-bold mb-3">
                {s.step}
              </div>
              <h3 className="relative z-10 font-display text-base font-bold text-slate-900 leading-tight">
                {s.title}
              </h3>
              <p className="relative z-10 mt-2 text-sm text-slate-500 font-medium">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button asChild variant="hero" size="lg" className="gap-2">
            <Link href="/jobs">
              Start Your Job Search <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default JobSeekerSteps;