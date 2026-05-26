import { ShieldCheck, Zap, Crown } from "lucide-react";
import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import { fetchAPI } from "@/services/api/client";
import PricingClient from "./PricingClient";

// Incremental Static Regeneration (ISR): Cache for 1 hour, refresh in background
export const revalidate = 3600;

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

async function getPricingPlans(): Promise<PricingPlan[]> {
  try {
    const response = await fetchAPI<{ status: boolean; data: PricingPlan[] }>("/open/plans");
    if (response?.status && Array.isArray(response?.data)) {
      return response.data;
    }
  } catch (error) {
    console.error("Failed to fetch plans on server:", error);
  }
  return [];
}

export default async function PricingPage() {
  let plans: PricingPlan[] = [];
  try {
    plans = await getPricingPlans();
  } catch (error) {
    console.error("Failed to load plans:", error);
  }

  const breadcrumbItems = [{ label: "Pricing Plans", isCurrent: true }];

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
        <PricingClient initialPlans={plans} />
        
        {plans.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border max-w-2xl mx-auto">
            <p className="text-muted-foreground font-medium">No pricing plans available at the moment.</p>
          </div>
        )}

        {/* Trust Indicators */}
        {plans.length > 0 && (
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
