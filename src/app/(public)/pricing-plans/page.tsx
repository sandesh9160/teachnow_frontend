"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";

const plans = [
  {
    name: "Basic",
    price: "₹2,999",
    period: "/month",
    desc: "Perfect for small schools",
    features: ["5 job postings/month", "Basic analytics", "Email support", "30-day listing"],
    popular: false,
  },
  {
    name: "Professional",
    price: "₹7,999",
    period: "/month",
    desc: "For growing institutions",
    features: ["25 job postings/month", "Advanced analytics", "Priority support", "Featured listings", "Resume database access"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "₹19,999",
    period: "/month",
    desc: "For large school chains",
    features: ["Unlimited job postings", "Custom analytics", "Dedicated account manager", "Branded company page", "API access", "Bulk hiring tools"],
    popular: false,
  },
];

export default function PricingPage() {
  const breadcrumbItems = [{ label: "Pricing Plans", isCurrent: true }];

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Consistent Breadcrumb Bar */}
      <div className="border-b border-border bg-white/80 backdrop-blur-md sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="bg-white border-b border-slate-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl tracking-tight">Pricing Plans</h1>
            <p className="mt-3 text-base text-slate-500 font-medium">Choose the right plan for your hiring needs</p>
          </div>
        </div>
      </section>
      <div className="container py-12">
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-2xl border bg-card p-6 shadow-card ${plan.popular ? "border-primary ring-2 ring-primary/20 relative" : "border-border"}`}>
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Most Popular</span>
              )}
              <h3 className="font-display text-xl font-bold text-foreground">{plan.name}</h3>
              <p className="text-sm text-muted-foreground">{plan.desc}</p>
              <div className="mt-4">
                <span className="font-display text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant={plan.popular ? "hero" : "outline"} className="mt-6 w-full" size="lg">
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
