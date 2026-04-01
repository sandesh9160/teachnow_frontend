"use client";

import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";

const sections = [
  { title: "Acceptance of Terms", content: "By accessing or using TeachNow, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our platform." },
  { title: "User Accounts", content: "You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate and complete information when creating an account." },
  { title: "Job Listings", content: "Employers are responsible for the accuracy of their job listings. TeachNow does not guarantee employment and is not responsible for the hiring decisions of employers." },
  { title: "Prohibited Activities", content: "Users must not post false information, engage in fraudulent activities, or use the platform for any unlawful purpose. Violations may result in account termination." },
  { title: "Limitation of Liability", content: "TeachNow is provided 'as is' without warranties. We are not liable for any damages arising from the use of our platform." },
];

export default function TermsAndConditionsPage() {
  const breadcrumbItems = [{ label: "Terms and Conditions", isCurrent: true }];

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
            <h1 className="text-3xl font-bold text-slate-900 md:text-5xl tracking-tight leading-tight">Terms and <span className="text-primary italic">Conditions</span></h1>
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
