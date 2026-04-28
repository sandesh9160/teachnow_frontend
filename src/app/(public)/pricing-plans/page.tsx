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
  feature_days: number;
  featured_jobs_limit: number;
  company_featured: number;
  features: string[];
  is_highlighted: number;
  is_active: number;
  display_order: number;
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
      toast.warning("Employer Login Required", {
        description: "Please login as an Employer or Recruiter to purchase a plan.",
        style: { background: '#FFF7ED', border: '1px solid #FED7AA', color: '#9A3412' },
        duration: 4000,
      });
      router.push(`/auth/login?role=employer_recruiter&redirect=${encodeURIComponent("/pricing-plans")}`);
      return;
    }

    if (role !== "employer" && role !== "recruiter") {
      toast.error("Access Denied", {
        description: "Only Employer or Recruiter accounts can purchase job posting plans.",
        style: { background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B' },
      });
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
        <div className="mx-auto max-w-7xl px-4 py-1 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <section className="bg-white border-b border-slate-100 py-3 md:py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-xl font-bold text-slate-900 md:text-2xl">Pricing Plans</h1>
            <p className="mt-0.5 text-xs text-slate-500 font-medium">Choose the right plan for your hiring needs</p>
          </div>
        </div>
      </section>

      <div className="container px-4 py-4 md:py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
            <p className="mt-4 text-sm text-slate-400 font-medium">Loading plans...</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const isPopular = plan.is_highlighted === 1;
              const isBuying = activePlanId === plan.id && isProcessing;
              const isFree = parseFloat(plan.offer_price) === 0;
              
              return (
                <div 
                  key={plan.id} 
                  className={`relative flex flex-col rounded-xl border bg-card p-4 shadow-card transition-all ${
                    isPopular ? "border-primary ring-2 ring-primary/20" : "border-border"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-primary-foreground shadow-lg">
                      <Star className="h-3 w-3 fill-current" /> MOST POPULAR
                    </div>
                  )}

                  <div className="mb-3">
                    <h3 className="font-display text-base font-bold text-foreground">{plan.name}</h3>
                    <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
                      <span className="font-display text-xl font-bold text-foreground">
                        {isFree ? "Free" : `₹${Math.round(parseFloat(plan.offer_price)).toLocaleString()}`}
                      </span>
                      {parseFloat(plan.actual_price) > parseFloat(plan.offer_price) && (
                        <span className="text-xs font-medium text-muted-foreground line-through">₹{Math.round(parseFloat(plan.actual_price)).toLocaleString()}</span>
                      )}
                      <span className="ml-auto text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {plan.validity_days} Days Validity
                      </span>
                    </div>

                  </div>

                  <div className="space-y-3 flex-1">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-muted/30 p-2 border border-border/50">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase  mb-0.5">Job Posts</p>
                        <p className="text-xs font-semibold text-foreground">{plan.job_posts_limit}</p>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-2 border border-border/50">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Featured Jobs</p>
                        <p className="text-xs font-semibold text-foreground">{plan.featured_jobs_limit}</p>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-2 border border-border/50">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Job Live</p>
                        <p className="text-xs font-semibold text-foreground">{plan.job_live_days} Days</p>
                      </div>
                      <div className="rounded-lg bg-muted/30 p-2 border border-border/50">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5 leading-none">Featured Job Validity</p>
                        <p className="text-xs font-semibold text-foreground">{plan.feature_days} Days</p>
                      </div>
                    </div>

                    {/* Compact Features List */}
                    <div className="space-y-2 pt-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Key Features</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {plan.features?.map((f, i) => (
                          <div key={`${plan.id}-feat-${i}`} className="flex items-start gap-1.5 text-xs text-slate-600 leading-tight">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </div>
                        ))}
                        <div className="flex items-start gap-1.5 text-xs text-slate-600 leading-tight">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>Company Featured: {plan.company_featured === 1 ? "Yes" : "No"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant={isPopular ? "hero" : "outline"} 
                    className="mt-4 w-full" 
                    size="sm"
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
          <div className="max-w-4xl mx-auto mt-6 text-center">
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
