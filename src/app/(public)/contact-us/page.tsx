"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { toast } from "sonner";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";

export default function ContactPage() {
  const breadcrumbItems = [{ label: "Contact Us", isCurrent: true }];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message Sent!", { description: "We'll get back to you within 24 hours." });
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Consistent Breadcrumb Bar */}
      <div className="border-b border-border bg-white/80 backdrop-blur-md sticky top-16 z-40">
        <div className="w-full px-4 py-2 sm:px-6 lg:px-12">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="bg-white border-b border-slate-100 py-12 md:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-12 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 md:text-5xl leading-tight">Contact <span className="text-primary italic">Us</span></h1>
            <p className="mt-5 text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">Have questions? We'd love to hear from you. Our team is here to help.</p>
          </div>
        </div>
      </section>
      <div className="w-full px-4 py-16 sm:px-6 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
          <div className="space-y-6">
            {[
              { icon: Mail, label: "Email", value: "support@teachnow.in" },
              { icon: Phone, label: "Phone", value: "+91 1800-123-4567" },
              { icon: MapPin, label: "Address", value: "TeachNow HQ, Connaught Place, New Delhi 110001" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 shadow-card space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
              <input className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Your name" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <input type="email" className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="you@example.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Message</label>
              <textarea rows={4} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" placeholder="How can we help?" />
            </div>
            <Button variant="hero" className="w-full" size="lg">Send Message</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
