"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Download,
  CreditCard,
  Loader2,
  AlertCircle,
  FileText,
  Calendar,
  Clock,
  ArrowUpRight,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import { fetchAPI } from "@/services/api/client";
import { useRazorpay } from "@/hooks/useRazorpay";

// import { toast } from "sonner";
import Link from "next/link";

interface Plan {
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
  is_active: number;
  is_highlighted: number;
  display_order: number;
  created_at: string;
  updated_at: string;
  is_current?: boolean;
}

const getFullUrl = (path: string | null) => {
  if (!path) return "";
  if (path.startsWith('http')) return path;
  const baseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";
  return `${baseUrl}/${path.startsWith('/') ? path.slice(1) : path}`;
};

interface CurrentSubscription {
  id: number;
  employer_id: number;
  plan_id: number;
  order_id?: number;
  job_posts_total: number;
  job_posts_used: number;
  featured_jobs_total: number;
  featured_jobs_used: number;
  purchase_date: string;
  starts_at: string;
  expires_at: string;
  status: string;
}

interface Subscription {
  id: number;
  plan_id: number;
  plan_name: string;
  job_posts_total: number;
  job_posts_used: number;
  featured_jobs_total: number;
  featured_jobs_used: number;
  starts_at: string;
  expires_at: string;
  status: string;
  is_active: boolean;
}

interface PaginatedData<T> {
  data: T[];
  total: number;
  current_page: number;
  last_page: number;
}

interface Payment {
  id: number;
  amount: string;
  payment_method: string;
  payment_status: string;
  transaction_id: string;
  plan_name: string;
  created_at: string | null;
}

interface Invoice {
  id: number;
  invoice_number: string;
  amount: string;
  currency: string;
  invoice_date: string;
  pdf_path: string;
}

interface PurchaseHistoryData {
  plans: Plan[];
  current_subscription: CurrentSubscription | null;
  payments: PaginatedData<Payment>;
  invoices: PaginatedData<Invoice>;
  subscriptions: PaginatedData<Subscription>;
}

interface ApiResponse {
  status: boolean;
  data: Plan[] | PurchaseHistoryData;
  message?: string;
}

export default function PurchaseHistoryClient() {
  const [data, setData] = useState<PurchaseHistoryData | null>(null);
  const [plansArray, setPlansArray] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgradingPlanId, setUpgradingPlanId] = useState<number | null>(null);

  const { isProcessing, purchasePlan } = useRazorpay({
    onSuccess: () => {
      setUpgradingPlanId(null);
      // Refresh data after successful payment
      fetchHistory();
    },
    onFailure: () => {
      setUpgradingPlanId(null);
    },
  });

  const handleUpgrade = async (plan: Plan) => {
    const price = plan.offer_price === "0.00" || plan.offer_price === "0" ? 0 : Number(plan.offer_price);

    if (price === 0) {
      // Free plan — subscribe directly
      setUpgradingPlanId(plan.id);
      try {
        const res = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan_id: plan.id }),
        });
        const data = await res.json();
        if (data.status) {
          fetchHistory();
        }
      } catch {
        // silently handle
      } finally {
        setUpgradingPlanId(null);
      }
      return;
    }

    setUpgradingPlanId(plan.id);
    await purchasePlan(plan.id, plan.name);
  };

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch plans from /open/plans (same as public pricing page) for consistent data
      const [historyRes, plansRes] = await Promise.all([
        dashboardServerFetch<ApiResponse>("employer/payments-history"),
        fetchAPI<{ status: boolean; data: Plan[] }>("/open/plans"),
      ]);

      console.log("Employer Payments History Response:", historyRes);

      if (historyRes.status) {
        // Always use /open/plans data for the plan cards (authoritative source)
        const openPlans = plansRes.status
          ? [...plansRes.data].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          : [];

        if (Array.isArray(historyRes.data)) {
          // Response is just plans array — mark none as current
          setPlansArray(openPlans);
          setData(null);
        } else {
          const histData = historyRes.data as PurchaseHistoryData;
          setData(histData);

          // Mark the current active plan using plan_id from current_subscription
          const currentPlanId = histData.current_subscription?.plan_id;
          const markedPlans = openPlans.map(p => ({
            ...p,
            is_current: p.id === currentPlanId,
          }));
          setPlansArray(markedPlans);
        }
      } else {
        setError(historyRes.message || "Failed to load billing data");
      }
    } catch (err) {
      setError("An error occurred while fetching billing data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-[#00359E] animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading billing details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-slate-600 font-medium">{error}</p>
        <button
          onClick={fetchHistory}
          className="px-4 py-2 bg-[#00359E] text-white rounded-lg text-sm font-semibold hover:bg-[#002B80] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString.split(' ')[0] || dateString;
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateString.split(' ')[0] || dateString;
    }
  };

  const plans = data?.plans || [];
  const invoices = data?.invoices?.data || [];
  const payments = data?.payments?.data || [];
  const subscriptions = data?.subscriptions?.data || [];
  const sub = data?.current_subscription;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-8 font-sans overflow-x-hidden pb-12">
      {/* Header & Sub Usage */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-semibold text-[#0F172A]">Billing</h2>
          <p className="text-slate-500 text-sm">Manage your subscription and invoices</p>
        </div>

        {sub && (
          <div>
          </div>
        )}
      </div>

      {/* Pricing Grid / Purchase History Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {(plansArray.length > 0 ? plansArray : plans).map((plan) => {
          const isCurrent = plan.is_current;
          const price = plan.offer_price === "0.00" || plan.offer_price === "0" ? "Free" : `₹${Number(plan.offer_price).toLocaleString('en-IN')}`;

          return (
            <div
              key={plan.id}
              className={cn(
                "rounded-2xl p-4 sm:p-6 flex flex-col border transition-all duration-300 relative",
                isCurrent
                  ? "border-[#1E3A8A] bg-[#F1F5F9] shadow-lg shadow-blue-900/5 ring-1 ring-[#1E3A8A]"
                  : "border-slate-200 bg-white hover:border-blue-200"
              )}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-6 px-3 py-1 bg-[#1E3A8A] text-white text-[10px] font-semibold rounded-full shadow-lg">
                  Current Active Plan
                </div>
              )}
              {!isCurrent && plan.is_highlighted === 1 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-white shadow-lg">
                  <Star className="h-3 w-3 fill-current" /> MOST POPULAR
                </div>
              )}

              <div className="space-y-4 flex-1">
                <div>
                  <h3 className="text-[13px] sm:text-[14px] font-semibold text-slate-900">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">{price}</span>
                    {price !== "Free" && (
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
                  onClick={() => handleUpgrade(plan)}
                  disabled={upgradingPlanId === plan.id || isProcessing}
                  className={cn(
                    "w-full py-2.5 px-6 rounded-xl font-semibold text-[13px] transition-all duration-200 flex items-center justify-center gap-2 group border shadow-sm",
                    isCurrent
                      ? "bg-[#1E3A8A] text-white border-[#1E3A8A] hover:bg-[#1E3A8A]/90"
                      : "bg-white text-[#1E3A8A] border-blue-100 hover:bg-blue-50/50",
                    (upgradingPlanId === plan.id || isProcessing) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {upgradingPlanId === plan.id ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                  ) : isCurrent ? (
                    "✓ Current Plan"
                  ) : (
                    <>Purchase Plan <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-10">
        {/* Subscription History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-[#0F172A]">Subscription History</h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 tracking-wider">Plan Details</th>
                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 tracking-wider">Usage Summary</th>
                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 tracking-wider">Duration</th>
                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 tracking-wider text-center">Usage Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {subscriptions.length > 0 ? subscriptions.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                          <span className="text-[14px] font-semibold text-slate-900">{item.plan_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-medium text-slate-600">Jobs:</span>
                            <span className="text-[12px] font-bold text-slate-900">{item.job_posts_used} / {item.job_posts_total}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-medium text-slate-600">Featured:</span>
                            <span className="text-[12px] font-bold text-slate-900">{item.featured_jobs_used} / {item.featured_jobs_total}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <p className="text-[13px] font-semibold text-slate-700">{formatDate(item.starts_at)} - {formatDate(item.expires_at)}</p>
                          <p className="text-[11px] text-slate-400 font-medium tracking-tight">Period</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Link href={`/dashboard/employer/subscriptions/${item.id}/usage`}>
                          <button
                            className="h-8 px-6 rounded-md bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 font-medium text-[10px] mx-auto transition-all"
                          >
                            View
                          </button>
                        </Link>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center opacity-40">
                        <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-400">No subscriptions found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {subscriptions.length > 0 ? subscriptions.map((item) => (
                <div key={item.id} className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[14px] font-semibold text-slate-900">{item.plan_name}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-slate-400 tracking-wider">JOBS</p>
                      <p className="text-[12px] font-bold text-slate-800">{item.job_posts_used} / {item.job_posts_total}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-semibold text-slate-400 tracking-wider">FEATURED</p>
                      <p className="text-[12px] font-bold text-slate-800">{item.featured_jobs_used} / {item.featured_jobs_total}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 uppercase font-bold tracking-tight flex items-center gap-2">
                      <span>{formatDate(item.starts_at)}</span>
                      <span className="text-slate-300 text-[18px]">→</span>
                      <span>{formatDate(item.expires_at)}</span>
                    </div>
                    <Link href={`/dashboard/employer/subscriptions/${item.id}/usage`}>
                      <button
                        className="h-6 px-4 rounded-md bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 font-medium text-[10px] transition-all"
                      >
                        View
                      </button>
                    </Link>
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center opacity-40">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-400">No subscriptions found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-[#0F172A]">Payment History</h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 tracking-wider">Plan Name</th>
                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 tracking-wider">Transaction Details</th>
                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 tracking-wider">Method</th>
                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 tracking-wider text-right">Amount</th>
                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payments.length > 0 ? payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <span className="text-[14px] font-semibold text-slate-900">{payment.plan_name}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <p className="text-[13px] font-medium text-slate-700">{payment.transaction_id.slice(0, 16).toUpperCase()}</p>
                          <p className="text-[11px] text-slate-400">{payment.created_at ? formatDate(payment.created_at) : `ID: pay_${payment.id}`}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold tracking-tight">{payment.payment_method}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-[14px] font-semibold text-slate-900">₹{Number(payment.amount).toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5",
                          payment.payment_status === 'success' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        )}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", payment.payment_status === 'success' ? "bg-emerald-500" : "bg-rose-500")} />
                          {payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center opacity-40">
                        <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm font-semibold">No payments found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {payments.length > 0 ? payments.map((payment) => (
                <div key={payment.id} className="p-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="text-slate-400 shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-semibold text-slate-900 leading-tight truncate">{payment.plan_name}</h4>
                    <p className="text-[12px] text-slate-400 font-medium">{payment.created_at ? formatDate(payment.created_at) : payment.transaction_id.slice(0, 8).toUpperCase()}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[14px] font-semibold text-slate-900">₹{Number(payment.amount).toLocaleString('en-IN')}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                      payment.payment_status === 'success' ? "bg-[#ECFDF5] text-[#059669] border-emerald-100/50" : "bg-rose-50 text-rose-600 border-rose-100/50"
                    )}>
                      {payment.payment_status === 'success' ? 'Paid' : payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1)}
                    </span>
                    <button className="p-1 text-slate-300 hover:text-slate-600 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center opacity-40">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-400">No payments found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invoice History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-[#0F172A]">Invoice History</h2>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 tracking-wider">Invoice Number</th>
                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 tracking-wider">Date</th>
                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 tracking-wider text-right">Amount</th>
                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 tracking-wider text-center">Status</th>
                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 tracking-wider text-center">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoices.length > 0 ? invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-[14px] font-semibold text-slate-900">{invoice.invoice_number}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] text-slate-500 font-medium">{formatDate(invoice.invoice_date)}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-[14px] font-semibold text-slate-900">₹{Number(invoice.amount).toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[11px] font-semibold">Paid</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => invoice.pdf_path && window.open(getFullUrl(invoice.pdf_path), '_blank')}
                          className="p-2 text-slate-400 hover:text-[#1E3A8A] hover:bg-blue-50 rounded-lg transition-all"
                          title="Download Invoice"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center opacity-40">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-400">No invoices generated</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {invoices.length > 0 ? invoices.map((invoice) => (
                <div key={invoice.id} className="p-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="text-slate-400 shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-semibold text-slate-900 leading-tight truncate">{invoice.invoice_number}</h4>
                    <p className="text-[12px] text-slate-400 font-medium">{formatDate(invoice.invoice_date)}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[14px] font-semibold text-slate-900">₹{Number(invoice.amount).toLocaleString('en-IN')}</span>
                    <span className="bg-[#ECFDF5] text-[#059669] px-2 py-0.5 rounded-full text-[10px] font-semibold border border-emerald-100/50">
                      Paid
                    </span>
                    <button
                      onClick={() => invoice.pdf_path && window.open(getFullUrl(invoice.pdf_path), '_blank')}
                      className="p-1 text-slate-300 hover:text-slate-600 transition-colors"
                      title="Download Invoice"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center opacity-40">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-400">No invoices generated</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
