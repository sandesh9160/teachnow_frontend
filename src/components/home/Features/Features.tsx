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
          <div className="group rounded-2xl border border-border bg-background overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
            <div className="h-52 overflow-hidden">
              <img
                src={teacherClassroomImg}
                alt="Teacher in classroom"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-8">
              <h3 className="font-display text-xl font-bold text-foreground">For Job Seekers</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                TeachNow helps teachers discover verified job opportunities across schools, colleges, and online
                teaching platforms.
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Find teaching jobs across India",
                  "AI Resume Builder for teachers",
                  "Quick job applications",
                  "Verified schools and institutions",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant="hero" size="lg" className="mt-6 gap-2">
                <Link href="/jobs">
                  Explore Jobs <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>


          {/* For Employers */}
          <div className="group rounded-2xl border border-border bg-background overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
            <div className="h-52 overflow-hidden">
              <img
                src={employerHiringImg}
                alt="Employer hiring"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-8">
              <h3 className="font-display text-xl font-bold text-foreground">For Employers</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                TeachNow enables institutions to quickly hire qualified teachers.
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Post teaching jobs instantly",
                  "Access qualified educator profiles",
                  "Simplified recruitment workflow",
                  "Affordable hiring plans",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant="hero" size="lg" className="mt-6 gap-2">
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
