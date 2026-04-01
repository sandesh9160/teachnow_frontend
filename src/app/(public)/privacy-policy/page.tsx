"use client";

import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";

const sections = [
  { title: "Information We Collect", content: "We collect personal information such as your name, email address, phone number, resume details, and job preferences when you create an account or apply for jobs on TeachNow." },
  { title: "How We Use Your Information", content: "Your information is used to match you with relevant teaching opportunities, facilitate the application process, and improve our platform's services. We never sell your personal data to third parties." },
  { title: "Data Security", content: "We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and regular security audits." },
  { title: "Cookies", content: "TeachNow uses cookies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can manage cookie settings in your browser." },
  { title: "Your Rights", content: "You have the right to access, update, or delete your personal information at any time. Contact us at privacy@teachnow.in for any data-related requests." },
];

export default function PrivacyPolicyPage() {
  const breadcrumbItems = [{ label: "Privacy Policy", isCurrent: true }];

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Consistent Breadcrumb Bar */}
      <div className="border-b border-border bg-white/80 backdrop-blur-md sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="bg-white border-b border-slate-100 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-slate-900 md:text-5xl tracking-tight leading-tight">Privacy <span className="text-primary italic">Policy</span></h1>
            <p className="mt-5 text-sm text-slate-400 uppercase tracking-widest font-bold">Last updated: March 30, 2026</p>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 py-16 max-w-4xl space-y-12">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">{s.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
