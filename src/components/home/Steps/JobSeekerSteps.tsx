"use client";

// import Link from "next/link";
// import { Button } from "@/shared/ui/Buttons/Buttons";
// import { ArrowRight } from "lucide-react";

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
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="text-center mb-14 px-4">
          <h2 className="text-[30px] md:text-[36px] font-bold text-[#111827] tracking-tight mb-2">
            Get Your Job in 4 Simple Steps
          </h2>
          <p className="text-[16px] md:text-[18px] text-slate-500 font-normal">
            Follow these steps to land your dream job on TeachNow
          </p>
        </div>

        <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.step}
              className="group relative rounded-[20px] bg-[#f8faff] p-5 md:p-6 transition-all duration-500 flex flex-col items-center text-center border border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md"
            >
              <div className="mb-4 h-28 w-full flex items-center justify-center">
                <img
                  src={s.img}
                  alt={s.title}
                  className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1e3a8a] text-[12px] font-extrabold shadow-sm">
                {s.step}
              </div>

              <h3 className="text-xl font-semibold text-[#111827] mb-3 leading-tight">
                {s.title}
              </h3>
              <p className="text-[15px] text-slate-500 font-normal leading-relaxed max-w-[240px] mx-auto">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JobSeekerSteps;