"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { EmployerSteps } from "@/components/home/Steps/EmployerSteps";
import { CheckCircle2, TrendingUp, Users, ShieldCheck } from "lucide-react";

export default function HireNowPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-24 md:pt-32 pb-16 md:pb-24">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Text Content */}
            <div className="max-w-2xl text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span># Hiring Platform for Education</span>
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6">
                Hire the Best <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">Educators</span> Faster.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Connect with thousands of qualified teachers, professors, and administrative staff ready to make an impact at your institution.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" variant="hero" asChild>
                  <Link href="/auth/employer-login">
                    Register
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/auth/employer-login">
                    Login
                  </Link>
                </Button>
              </div>
              
              <div className="mt-10 pt-10 border-t border-border flex flex-col sm:flex-row gap-8 justify-center lg:justify-start">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-foreground">50k+</p>
                    <p className="text-sm text-muted-foreground">Active Candidates</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-foreground">7 Days</p>
                    <p className="text-sm text-muted-foreground">Avg. Time to Hire</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Image/Visual Content */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative rounded-2xl bg-card border border-border shadow-soft p-2">
                <div className="absolute -inset-1 bg-linear-to-r from-primary to-secondary opacity-30 blur-lg rounded-2xl -z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop" 
                  alt="Students and Teacher in Classroom" 
                  className="rounded-xl object-cover w-full h-[400px] lg:h-[500px]"
                />
                
                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-xl p-4 shadow-lg flex items-center gap-4 animate-bounce-slow">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Verified Profiles</p>
                    <p className="text-xs text-muted-foreground">100% authenticated</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold md:text-4xl text-foreground mb-4">Why Institutions Choose TeachNow</h2>
            <p className="text-muted-foreground text-lg">We simplify the recruitment process, allowing you to focus on what matters most: education.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Targeted Reach</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect exclusively with education professionals. No more sifting through irrelevant resumes from general job boards.
              </p>
            </div>
            
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Quality Candidates</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our candidates are vetted, and their profiles are comprehensively detailed with skills, experience, and educational background.
              </p>
            </div>
            
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Cost-Effective Hiring</h3>
              <p className="text-muted-foreground leading-relaxed">
                Reduce your cost-per-hire and time-to-fill metrics with our streamlined application tracking and direct communication tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Employer Steps Component */}
      <EmployerSteps />

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Build Your Dream Team?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join hundreds of forward-thinking institutions that trust TeachNow to find their ideal teaching staff.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="hero" className="px-8 py-6 text-lg" asChild>
              <Link href="/auth/employer-login">
                Register
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-6 text-lg bg-background" asChild>
              <Link href="/auth/employer-login">
                Login
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
