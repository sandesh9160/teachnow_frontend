"use client";

import { useState } from "react";
import Link from "next/link";

import ResumeTemplatePreview from "@/components/ai-resume-builder/ResumeTemplatePreview";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { toast } from "sonner";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import {
  FileText, Sparkles, Layout, Download, ArrowRight,
  User, Mail, Phone, MapPin, GraduationCap, Briefcase, Plus, X, Save,
  Zap, Shield, Clock, Palette, Eye, FolderOpen, Award, Languages, Code
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────

const features = [
  { icon: Sparkles, title: "AI Resume Suggestions", desc: "Smart content recommendations powered by AI to highlight your strengths." },
  { icon: Layout, title: "Modern Resume Templates", desc: "Professionally designed templates that stand out to recruiters." },
  { icon: Shield, title: "ATS Friendly Layouts", desc: "Optimized formats that pass Applicant Tracking Systems easily." },
  { icon: Zap, title: "Instant Resume Generation", desc: "Generate a polished resume in under 5 minutes." },
  { icon: Palette, title: "Easy Customization", desc: "Drag-and-drop sections, customize colors, fonts and layout." },
  { icon: Download, title: "Fast Download", desc: "Export your resume as PDF or share a live link with employers." },
];

const templates = [
  "Modern Professional",
  "Minimal Clean",
  "Creative Resume",
  "Corporate Resume",
  "Elegant Resume",
  "Developer Resume",
  "Marketing Resume",
  "Simple ATS Resume",
];

const howItWorks = [
  { step: 1, title: "Enter Your Details", desc: "Add personal information, education, work experience, and skills.", img: "/images/resume/steps/step-details.png" },
  { step: 2, title: "Choose a Template", desc: "Select from professionally designed resume templates.", img: "/images/resume/steps/step-template.png" },
  { step: 3, title: "Generate Resume", desc: "Instantly generate and download your resume.", img: "/images/resume/steps/step-generate.png" },
];

const sidebarSections = [
  { icon: User, label: "Personal Information", id: "personal" },
  { icon: GraduationCap, label: "Education", id: "education" },
  { icon: Briefcase, label: "Work Experience", id: "experience" },
  { icon: Code, label: "Skills", id: "skills" },
  { icon: FolderOpen, label: "Projects", id: "projects" },
  { icon: Award, label: "Certifications", id: "certifications" },
  { icon: Languages, label: "Languages", id: "languages" },
];

const defaultSkills = ["JavaScript", "React", "Python", "Project Management", "Communication", "Data Analysis", "SQL", "Leadership"];

// ── Component ─────────────────────────────────────────────────────────

export default function AIResumeBuilderPage() {

  const [building, setBuilding] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");

  const [personal, setPersonal] = useState({ name: "", email: "", phone: "", location: "", role: "" });
  const [education, setEducation] = useState({ degree: "", university: "" });
  const [experience, setExperience] = useState({ company: "", role: "", years: "" });
  const [skills, setSkills] = useState<string[]>(["JavaScript", "React"]);
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleSave = () => {
    toast.success("Resume Saved!", { description: "Your resume draft has been saved successfully." });
  };

  const handleDownload = () => {
    toast.success("Resume Downloaded", { description: "Your resume PDF has been generated and downloaded." });
  };

  // ── Builder View ──────────────────────────────────────────────────

  if (building) {
    const displayName = personal.name || "Rahul Sharma";
    const displayRole = personal.role || "Software Engineer";
    const displayEmail = personal.email || "rahul@email.com";
    const displayPhone = personal.phone || "+91 9876543210";
    const displayLocation = personal.location || "Hyderabad";

    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Consistent Breadcrumb Bar */}
        <div className="border-b border-border bg-white/80 backdrop-blur-md sticky top-16 z-40">
          <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
            <Breadcrumb items={[
              { label: "CV Resume Builder", href: "/ai-resume-builder" },
              { label: "Editor", isCurrent: true }
            ]} />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Interactive CV Builder</h1>
              <p className="text-slate-500 font-medium mt-1">Design your professional future in real-time.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={handleSave} className="gap-2 rounded-xl border-slate-200"><Save className="h-4 w-4" /> Save Draft</Button>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl border-slate-200"><Eye className="h-4 w-4" /> Live Preview</Button>
              <Button variant="hero" size="sm" onClick={handleDownload} className="gap-2 rounded-xl shadow-lg shadow-primary/20"><Download className="h-4 w-4" /> Download PDF</Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar - Navigation */}
            <div className="lg:w-64 shrink-0 order-1">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-1.5 flex lg:flex-col overflow-x-auto lg:overflow-x-visible no-scrollbar">
                {sidebarSections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors whitespace-nowrap lg:w-full ${
                      activeSection === s.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <s.icon className="h-4 w-4 shrink-0" />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Center - Editor */}
            <div className="flex-1 min-w-0 order-2">
              <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm space-y-8">
                {activeSection === "personal" && (
                  <div className="space-y-4">
                    <h2 className="font-display text-lg font-semibold text-foreground">Personal Information</h2>
                    {[
                      { key: "name" as const, label: "Full Name", icon: User, placeholder: "e.g. Rahul Sharma" },
                      { key: "role" as const, label: "Job Title", icon: Briefcase, placeholder: "e.g. Software Engineer" },
                      { key: "email" as const, label: "Email", icon: Mail, placeholder: "e.g. rahul@email.com" },
                      { key: "phone" as const, label: "Phone", icon: Phone, placeholder: "e.g. +91 9876543210" },
                      { key: "location" as const, label: "Location", icon: MapPin, placeholder: "e.g. Hyderabad" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">{f.label}</label>
                        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5">
                          <f.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <input type="text" value={personal[f.key]} onChange={(e) => setPersonal({ ...personal, [f.key]: e.target.value })} placeholder={f.placeholder} className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === "education" && (
                  <div className="space-y-4">
                    <h2 className="font-display text-lg font-semibold text-foreground">Education</h2>
                    {[
                      { key: "degree" as const, label: "Degree", icon: GraduationCap, placeholder: "e.g. B.Tech Computer Science" },
                      { key: "university" as const, label: "University", icon: GraduationCap, placeholder: "e.g. IIT Hyderabad" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">{f.label}</label>
                        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5">
                          <f.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <input type="text" value={education[f.key]} onChange={(e) => setEducation({ ...education, [f.key]: e.target.value })} placeholder={f.placeholder} className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === "experience" && (
                  <div className="space-y-4">
                    <h2 className="font-display text-lg font-semibold text-foreground">Work Experience</h2>
                    {[
                      { key: "company" as const, label: "Company", icon: Briefcase, placeholder: "e.g. Tech Solutions Pvt Ltd" },
                      { key: "role" as const, label: "Role", icon: User, placeholder: "e.g. Software Engineer" },
                      { key: "years" as const, label: "Duration", icon: Clock, placeholder: "e.g. 3 Years" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">{f.label}</label>
                        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5">
                          <f.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <input type="text" value={experience[f.key]} onChange={(e) => setExperience({ ...experience, [f.key]: e.target.value })} placeholder={f.placeholder} className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === "skills" && (
                  <div className="space-y-4">
                    <h2 className="font-display text-lg font-semibold text-foreground">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s) => (
                        <span key={s} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                          {s}
                          <button onClick={() => setSkills(skills.filter((sk) => sk !== s))} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5">
                        <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()} placeholder="Add a skill..." className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
                      </div>
                      <Button variant="outline" size="sm" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Suggestions:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {defaultSkills.filter((s) => !skills.includes(s)).map((s) => (
                        <button key={s} onClick={() => setSkills([...skills, s])} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors">+ {s}</button>
                      ))}
                    </div>
                  </div>
                )}

                {(activeSection === "projects" || activeSection === "certifications" || activeSection === "languages") && (
                  <div className="text-center py-10">
                    <FileText className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                    <h2 className="font-display text-lg font-semibold text-foreground capitalize">{activeSection}</h2>
                    <p className="text-sm text-muted-foreground mt-2">This section will be available soon. Add your {activeSection} to make your resume stand out.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right - Live Preview */}
            <div className="hidden xl:block w-80 shrink-0 order-3">
              <div className="sticky top-[120px] rounded-xl border border-border bg-card shadow-card overflow-hidden">
                <div className="gradient-primary p-5 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground font-display font-bold text-xl backdrop-blur-sm">
                    {displayName[0]?.toUpperCase()}
                  </div>
                  <h3 className="mt-2 font-display text-base font-bold text-primary-foreground">{displayName}</h3>
                  <p className="text-xs text-primary-foreground/70">{displayRole}</p>
                </div>
                <div className="p-4 space-y-3 text-sm">
                  <div>
                    <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Contact</h4>
                    <p className="flex items-center gap-1.5 text-xs text-foreground"><Mail className="h-3 w-3 text-primary/60" />{displayEmail}</p>
                    <p className="flex items-center gap-1.5 text-xs text-foreground"><Phone className="h-3 w-3 text-primary/60" />{displayPhone}</p>
                    <p className="flex items-center gap-1.5 text-xs text-foreground"><MapPin className="h-3 w-3 text-primary/60" />{displayLocation}</p>
                  </div>
                  {experience.company && (
                    <div>
                      <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Experience</h4>
                      <p className="text-xs font-medium text-foreground">{experience.role || displayRole}</p>
                      <p className="text-[10px] text-muted-foreground">{experience.company} · {experience.years}</p>
                    </div>
                  )}
                  {skills.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {skills.map((s) => (
                          <span key={s} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {education.degree && (
                    <div>
                      <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Education</h4>
                      <p className="text-xs font-medium text-foreground">{education.degree}</p>
                      {education.university && <p className="text-[10px] text-muted-foreground">{education.university}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Landing View ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Consistent Breadcrumb Bar */}
      <div className="border-b border-border bg-white/80 backdrop-blur-md sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "CV Resume Builder", isCurrent: true }]} />
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-white border-b border-slate-100">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%-30rem)] sm:w-288.75"></div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block rounded-2xl bg-primary/5 px-4 py-2 text-xs font-bold text-primary mb-8 uppercase tracking-widest border border-primary/10">
                ✨ 100% Free AI Tool
              </span>
              <h1 className="text-5xl font-black leading-[1.1] text-slate-900 md:text-7xl tracking-tight">
                Craft Your Story <br />
                <span className="text-primary italic">Professionally</span>
              </h1>
              <p className="mt-8 text-xl text-slate-500 max-w-xl font-medium leading-relaxed">
                Create a high-density, professional resume in minutes using smart templates powered by our unique AI suggestion engine.
              </p>
              <div className="mt-8 flex gap-3 justify-center lg:justify-start">
                <Button variant="hero" size="lg" className="gap-2" onClick={() => setBuilding(true)}>
                  <Sparkles className="h-4 w-4" /> Create My Resume
                </Button>
                <Button variant="outline" size="lg" className="gap-2" onClick={() => {
                  const el = document.getElementById("templates");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}>
                  Browse Templates
                </Button>
              </div>
            </div>
            <div className="flex-1 max-w-md">
              <div className="rounded-2xl border border-border bg-card/50 p-2 shadow-card-hover backdrop-blur-sm">
                <img src="/images/resume/resume-builder-hero.png" alt="AI Resume Builder" className="rounded-xl w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#F8FAFC] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-black text-slate-900 md:text-5xl tracking-tight mb-20">
            Professional CV in 3 Simple Steps
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {howItWorks.map((s) => (
              <div key={s.step} className="group rounded-2xl border border-border bg-background p-8 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 text-center">
                <div className="mx-auto mb-6 h-32 w-32 overflow-hidden rounded-xl">
                  <img src={s.img} alt={s.title} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full gradient-primary text-primary-foreground text-sm font-bold mb-4">
                  {s.step}
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="py-24 bg-white border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-black text-slate-900 md:text-5xl tracking-tight mb-16">
            Global Standard Templates
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {templates.map((name) => (
              <div
                key={name}
                className="group rounded-xl border border-border bg-card overflow-hidden shadow-card hover:shadow-card-hover hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => setBuilding(true)}
              >
                <div className="p-2 bg-muted/50">
                  <ResumeTemplatePreview name={name} />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold text-foreground">{name}</h3>
                  <Button variant="outline" size="sm" className="text-xs h-7 hover:bg-primary hover:text-primary-foreground transition-colors">
                    Use Template
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-black text-slate-900 md:text-5xl tracking-tight mb-16">
            Elite AI Advantages
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-background p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden py-32 bg-white border-t border-slate-100">
        <div className="absolute inset-0 bg-primary/5 opacity-40 blur-3xl pointer-events-none"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative text-center">
          <h2 className="text-4xl font-black text-slate-900 md:text-6xl tracking-tight uppercase">
            Start Your Elite <span className="text-primary italic leading-tight">Career Journey</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Join thousands of job seekers who landed their dream jobs with our AI-powered resume builder.
          </p>
          <div className="mt-8 flex gap-3 justify-center">
            <Button variant="hero" size="lg" className="gap-2" onClick={() => setBuilding(true)}>
              <Sparkles className="h-4 w-4" /> Create Resume
            </Button>
            <Link href="/jobs">
              <Button variant="outline" size="lg" className="gap-2">
                Browse Jobs <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
