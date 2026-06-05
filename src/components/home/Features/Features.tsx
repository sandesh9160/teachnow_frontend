import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";

const teacherClassroomImg = "/images/teacher-classroom.jpg";
const employerHiringImg = "/images/employer-hiring.jpg";

export const Features = () => {
  return (
    <section className="bg-[#F7F9FC] py-20 md:py-24">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="text-center mb-14 px-4">
          <h2 className="text-[32px] md:text-[32px] font-extrabold text-[#111827] tracking-tight mb-2">
            Why TeachNow?
          </h2>
          <p className="text-[16px] md:text-[18px] text-slate-600 font-normal">
            Empowering educators and enabling schools to thrive together
          </p>
        </div>

        <div className="grid gap-8 lg:gap-10 md:grid-cols-2">
          {/* For Job Seekers */}
          <div className="group relative rounded-[16px] border border-slate-200/80 bg-white overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 flex flex-col h-full">
            <div className="h-48 sm:h-56 overflow-hidden relative">
              <Image
                src={teacherClassroomImg}
                alt="Teacher in classroom"
                fill
                quality={75}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            <div className="p-6 md:p-8 flex flex-col flex-1">
              <h3 className="text-xl font-semibold text-[#111827]">For Job Seekers</h3>
              <p className="mt-3 text-[14px] text-slate-600 font-normal leading-relaxed">
                TeachNow helps teachers discover verified job opportunities across schools, colleges, and online
                teaching platforms.
              </p>

              <ul className="mt-4 space-y-2.5 flex-1">
                {[
                  "Find teaching jobs across India",
                  "AI Resume Builder for teachers",
                  "Quick job applications",
                  "Verified schools and institutions",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[13px] text-slate-600 font-normal">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <Button asChild variant="hero" className="px-7 h-11 rounded-xl font-bold flex items-center justify-center w-fit gap-2">
                  <Link href="/jobs">
                    Explore Jobs <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* For Employers */}
          <div className="group relative rounded-[16px] border border-slate-200/80 bg-white overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 flex flex-col h-full">
            <div className="h-48 sm:h-56 overflow-hidden relative">
              <Image
                src={employerHiringImg}
                alt="Employer hiring"
                fill
                quality={75}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            <div className="p-6 md:p-8 flex flex-col flex-1">
              <h3 className="text-xl font-semibold text-[#111827]">For Employers</h3>
              <p className="mt-3 text-[14px] text-slate-600 font-normal leading-relaxed">
                TeachNow enables institutions to quickly hire qualified teachers through advanced discovery tools.
              </p>

              <ul className="mt-4 space-y-2.5 flex-1">
                {[
                  "Post teaching jobs instantly",
                  "Access qualified educator profiles",
                  "Simplified recruitment workflow",
                  "Affordable hiring plans",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[13px] text-slate-600 font-normal">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <Button asChild variant="hero" className="px-7 h-11 rounded-xl font-bold flex items-center justify-center w-fit gap-2">
                  <Link href="/auth/login">
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
