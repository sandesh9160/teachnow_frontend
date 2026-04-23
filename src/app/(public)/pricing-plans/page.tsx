"use client";

import { CheckCircle2, Loader2, Star, ShieldCheck, Zap, Crown } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import { useEffect, useState } from "react";
import { fetchAPI } from "@/services/api/client";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useRouter } from "next/navigation";
import { useClientSession } from "@/hooks/useClientSession";
import { toast } from "sonner";

interface PricingPlan {
  id: number;
  name: string;
  actual_price: string;
  offer_price: string;
  job_posts_limit: number;
  validity_days: number;
  job_live_days: number;
  featured_jobs_limit: number;
  company_featured: number;
  features: string[];
}

export default function PricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePlanId, setActivePlanId] = useState<number | null>(null);
  const breadcrumbItems = [{ label: "Pricing Plans", isCurrent: true }];
  const router = useRouter();
  const { isLoggedIn, role, user } = useClientSession();

  const { isProcessing, purchasePlan } = useRazorpay({
    onSuccess: () => {
      setActivePlanId(null);
      router.push("/dashboard/employer/purchase-history");
    },
    onFailure: () => {
      setActivePlanId(null);
    },
    userInfo: user ? {
      name: user.name,
      email: user.email,
    } : undefined
  });

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await fetchAPI<{ status: boolean; data: PricingPlan[] }>("/open/plans");
        if (response.status) {
          setPlans(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  const handleSelectPlan = async (plan: PricingPlan) => {
    if (!isLoggedIn) {
      toast.error("Please login to purchase a plan");
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (role !== "employer" && role !== "recruiter") {
      toast.error("Only institutions can purchase job posting plans.");
      return;
    }

    const price = parseFloat(plan.offer_price);
    
    // Free plan — subscribe directly without payment
    if (price === 0) {
      setActivePlanId(plan.id);
      try {
        const res = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan_id: plan.id }),
        });
        const data = await res.json();
        if (data.status) {
          router.push("/dashboard/employer/purchase-history");
        }
      } catch {
        // Fallback
      } finally {
        setActivePlanId(null);
      }
      return;
    }

    setActivePlanId(plan.id);
    await purchasePlan(plan.id, plan.name);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Consistent Breadcrumb Bar */}
      <div className="border-b border-border bg-white/80 backdrop-blur-md sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="bg-white border-b border-slate-100 py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Pricing Plans</h1>
            <p className="mt-3 text-base text-slate-500 font-medium">Choose the right plan for your hiring needs</p>
          </div>
        </div>
      </section>

      <div className="container px-4 py-8 md:py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
            <p className="mt-4 text-sm text-slate-400 font-medium">Loading plans...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const isPopular = plan.company_featured === 1 || plan.name.toLowerCase().includes("silver") || plan.name.toLowerCase().includes("pro");
              const isBuying = activePlanId === plan.id && isProcessing;
              const isFree = parseFloat(plan.offer_price) === 0;
              
              return (
                <div 
                  key={plan.id} 
                  className={`relative flex flex-col rounded-2xl border bg-card p-6 shadow-card transition-all ${
                    isPopular ? "border-primary ring-2 ring-primary/20" : "border-border"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-primary-foreground shadow-lg">
                      <Star className="h-3 w-3 fill-current" /> MOST POPULAR
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="font-display text-xl font-bold text-foreground">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline gap-1.5 flex-wrap">
                      <span className="font-display text-3xl font-bold text-foreground">
                        {isFree ? "Free" : `₹${Math.round(parseFloat(plan.offer_price)).toLocaleString()}`}
                      </span>
                      {!isFree && parseFloat(plan.actual_price) > parseFloat(plan.offer_price) && (
                        <span className="text-sm font-medium text-muted-foreground line-through">₹{Math.round(parseFloat(plan.actual_price)).toLocaleString()}</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground font-medium uppercase tracking-wide">Valid for {plan.validity_days} Days</p>
                  </div>

                  <div className="space-y-5 flex-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-muted/50 p-3 border border-border">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mb-1">Job Posts</p>
                        <p className="text-sm font-bold text-foreground">{plan.job_posts_limit}</p>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-3 border border-border">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mb-1">Featured</p>
                        <p className="text-sm font-bold text-foreground">{plan.featured_jobs_limit}</p>
                      </div>
                    </div>

                    <ul className="space-y-3">
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                        <span>Job live for {plan.job_live_days} days</span>
                      </li>
                      {plan.features?.map((f, i) => (
                        <li key={`${plan.id}-feat-${i}`} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    variant={isPopular ? "hero" : "outline"} 
                    className="mt-8 w-full" 
                    size="lg"
                    disabled={isBuying}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {isBuying ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </span>
                    ) : isFree ? (
                      "Get Started Free"
                    ) : (
                      "Select Plan"
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
        
        {!loading && plans.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border max-w-2xl mx-auto">
            <p className="text-muted-foreground font-medium">No pricing plans available at the moment.</p>
          </div>
        )}

        {/* Trust Indicators */}
        {!loading && plans.length > 0 && (
          <div className="max-w-4xl mx-auto mt-12 text-center">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Secure Payment via Razorpay
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                Instant Activation
              </span>
              <span className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-indigo-500" />
                Cancel Anytime
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
