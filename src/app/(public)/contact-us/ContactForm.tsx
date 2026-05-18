"use client";

import { Button } from "@/shared/ui/Buttons/Buttons";
import { toast } from "sonner";

export default function ContactForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message Sent!", { description: "We'll get back to you within 24 hours." });
  };

  return (
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
  );
}
