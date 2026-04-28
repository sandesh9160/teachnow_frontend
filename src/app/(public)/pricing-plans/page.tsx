"use client";

import { CheckCircle2, Loader2, Star, ShieldCheck, Zap, Crown, ArrowUpRight, Clock, Calendar } from "lucide-react";
// import { Button } from "@/shared/ui/Buttons/Buttons";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import { useEffect, useState } from "react";
import { fetchAPI } from "@/services/api/client";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useRouter } from "next/navigation";
import { useClientSession } from "@/hooks/useClientSession";
import { cn } from "@/lib/utils";
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

      <section className="bg-white border-b border-slate-100 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-0.5">
            <h1 className="text-2xl font-semibold text-[#0F172A]">Pricing Plans</h1>
            <p className="text-slate-500 text-sm">Choose the right plan for your hiring needs</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 font-sans overflow-x-hidden">
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
              const price = isFree ? "Free" : `₹${Math.round(parseFloat(plan.offer_price)).toLocaleString('en-IN')}`;
              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col rounded-2xl p-4 sm:p-6 border transition-all duration-300",
                    isPopular
                      ? "border-[#1E3A8A] bg-[#F1F5F9] shadow-lg shadow-blue-900/5 ring-1 ring-[#1E3A8A]"
                      : "border-slate-200 bg-white hover:border-blue-200"
                  )}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-white shadow-lg">
                      <Star className="h-3 w-3 fill-current" /> MOST POPULAR
                    </div>
                  )}

                  <div className="space-y-4 flex-1">
                    <div>
                      <h3 className="text-[13px] sm:text-[14px] font-semibold text-slate-900">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">{price}</span>
                        {!isFree && (
                          <span className="text-[13px] text-slate-400 font-medium">/ package</span>
                        )}
                      </div>
                      {parseFloat(plan.actual_price) > parseFloat(plan.offer_price) && (
                        <p className="text-[12px] text-slate-300 line-through font-medium">₹{Number(plan.actual_price).toLocaleString('en-IN')}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
                      <div className="bg-blue-50/50 rounded-xl p-2.5 sm:p-3 border border-blue-100/50">
                        <p className="text-[9px] sm:text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Job Posts</p>
                        <p className="text-lg sm:text-xl font-bold text-slate-900">{plan.job_posts_limit}</p>
                      </div>
                      <div className="bg-indigo-50/50 rounded-xl p-2.5 sm:p-3 border border-indigo-100/50">
                        <p className="text-[9px] sm:text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">Featured</p>
                        <p className="text-lg sm:text-xl font-bold text-slate-900">{plan.featured_jobs_limit ?? 0}</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      {plan.company_featured == 1 && (
                        <div className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" strokeWidth={3} />
                          </div>
                          <span className="text-[13px] text-slate-600 font-medium">Company Featured</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                          <Clock className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="text-[13px] text-slate-600 font-medium">Valid for {plan.validity_days} days</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                          <Calendar className="w-3 h-3 text-indigo-600" />
                        </div>
                        <span className="text-[13px] text-slate-600 font-medium">Jobs live for {plan.job_live_days} days</span>
                      </div>

                      {plan.features && plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 mt-0.5">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-emerald-50">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" strokeWidth={2.5} />
                          </div>
                          <span className="text-[12px] text-slate-600 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isBuying}
                      className={cn(
                        "w-full py-2.5 px-6 rounded-xl font-semibold text-[13px] transition-all duration-200 flex items-center justify-center gap-2 group border shadow-sm",
                        isPopular
                          ? "bg-[#1E3A8A] text-white border-[#1E3A8A] hover:bg-[#1E3A8A]/90"
                          : "bg-white text-[#1E3A8A] border-blue-100 hover:bg-blue-50/50",
                        isBuying && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isBuying ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                      ) : isFree ? (
                        "Get Started Free"
                      ) : (
                        <>Select Plan <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></>
                      )}
                    </button>
                  </div>
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
