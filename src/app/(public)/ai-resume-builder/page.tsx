"use client";

import { Button } from "@/shared/ui/Buttons/Buttons";
import { 
  Sparkles, 
  Layout, 
  Shield, 
  Zap, 
  Palette, 
  ArrowRight, 
  Download,
  Loader2,
} from "lucide-react";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import Link from "next/link";

import Image from "next/image";

import { useEffect, useState } from "react";
import { fetchAPI, normalizeMediaUrl } from "@/services/api/client";

interface CVTemplate {
  id: number;
  name: string;
  preview_image: string;
}

export default function AIResumeBuilderPage() {
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const breadcrumbItems = [
    { label: "AI Resume Builder", isCurrent: true },
  ];

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetchAPI<{ status: boolean; data: CVTemplate[] }>("/open/cv-templates");
        if (response.status) {
          setTemplates(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, []);

  const features = [
    { 
      icon: Sparkles, 
      title: "AI Resume Suggestions", 
      desc: "Smart content recommendations powered by AI to highlight your strengths." 
    },
    { 
      icon: Layout, 
      title: "Modern Resume Templates", 
      desc: "Professionally designed templates that stand out to recruiters." 
    },
    { 
      icon: Shield, 
      title: "ATS Friendly Layouts", 
      desc: "Optimized formats that pass Applicant Tracking Systems easily." 
    },
    { 
      icon: Zap, 
      title: "Instant Resume Generation", 
      desc: "Generate a polished resume in under 5 minutes." 
    },
    { 
      icon: Palette, 
      title: "Easy Customization", 
      desc: "Drag-and-drop sections, customize colors, fonts and layout." 
    },
    { 
      icon: Download, 
      title: "Fast Download", 
      desc: "Export your resume as PDF or share a live link with employers." 
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header / Breadcrumb */}
      <div className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 md:py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E0F2F1] px-4 py-1.5 text-[11px] font-bold text-[#00897B] border border-[#B2DFDB]">
                <Sparkles className="h-3.5 w-3.5" /> 100% Free — No Credit Card Required
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 md:text-6xl tracking-tight leading-tight">
                Free AI <span className="text-[#3B49DF]">Resume Builder</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed mx-auto lg:mx-0">
                Create a professional resume in minutes using smart AI-powered templates. Perfect for any job seeker.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
                <div className="flex flex-col items-center lg:items-start gap-4 pt-4">
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    <Link href="/auth/login">
                      <Button suppressHydrationWarning variant="hero" size="lg" className="rounded-xl px-8 font-bold bg-[#3B49DF] hover:bg-[#2D38B1] shadow-lg shadow-blue-200">
                        <Sparkles className="h-4 w-4 mr-2" /> Create My Resume
                      </Button>
                    </Link>
                    <Button suppressHydrationWarning variant="outline" size="lg" className="rounded-xl px-8 font-bold text-slate-700 bg-white border-slate-200 hover:bg-slate-50" onClick={() => document.getElementById('templates-section')?.scrollIntoView({ behavior: 'smooth' })}>
                      Browse Templates
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Don't have an account? <Link href="/auth/login" className="text-[#3B49DF] font-bold hover:underline">Create one free</Link>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full max-w-xl">
              <div className="relative rounded-[2.5rem] bg-white p-4 shadow-2xl shadow-blue-100/50 border border-slate-50">
                <div className="aspect-[1.4/1] rounded-[2rem] bg-[#0F172A] overflow-hidden relative flex items-center justify-center">
                   <Image 
                    src="/artifacts/resume_builder_preview.png" 
                    alt="AI Resume Preview" 
                    fill
                    priority
                    unoptimized
                    className="object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700" 
                  />
                   {/* Glowing Orbs */}
                   <div className="absolute top-10 right-10 w-24 h-24 bg-blue-500/10 blur-3xl rounded-full" />
                   <div className="absolute bottom-10 left-10 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates-section" className="py-20 bg-white border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold text-slate-900 mb-16">
            Choose a Resume Template
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 min-h-[300px]">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                <p className="mt-4 text-sm text-slate-400 font-medium">Fetching professional templates...</p>
              </div>
            ) : (
              templates.map((t) => (
                <Link key={t.id} href="/auth/login" className="flex flex-col group">
                  <div className="aspect-[1/1.414] rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-4 group-hover:shadow-xl transition-all duration-300 relative">
                    <Image 
                      src={normalizeMediaUrl(t.preview_image)} 
                      alt={t.name} 
                      fill
                      unoptimized
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-bold text-slate-700 truncate mr-2" title={t.name}>{t.name}</h3>
                    <Button suppressHydrationWarning variant="outline" size="sm" className="text-[10px] h-7 px-3 font-bold rounded-lg border-slate-200 bg-white hover:bg-slate-50 shrink-0">
                      Use Template
                    </Button>
                  </div>
                </Link>
              ))
            )}
            {!loading && templates.length === 0 && (
              <div className="col-span-full text-center py-20 border border-dashed border-slate-200 rounded-3xl">
                <p className="text-slate-400">No templates available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold text-slate-900 mb-16">
            Why Use Our AI Resume Builder
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-8 rounded-2xl border border-[#E9EFF6] bg-white shadow-sm hover:shadow-md transition-all">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#EFF4FA] text-[#3B49DF] mb-6">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-3">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Build Your Professional Resume Today
          </h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
            Join thousands of job seekers who landed their dream jobs with our AI-powered resume builder.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button suppressHydrationWarning variant="hero" size="lg" className="rounded-xl px-10 font-bold bg-[#2D38B1] hover:bg-[#1E278E] shadow-xl shadow-blue-100">
              <Sparkles className="h-4 w-4 mr-2" /> Create Resume
            </Button>
            <Link href="/jobs">
              <Button suppressHydrationWarning variant="outline" size="lg" className="rounded-xl px-10 font-bold text-slate-700 bg-white border-slate-200">
                Browse Jobs <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
