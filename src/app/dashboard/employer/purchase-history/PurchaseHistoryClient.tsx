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
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";

interface Plan {
    id: number;
    name: string;
    actual_price: string;
    offer_price: string;
    job_posts_limit: number;
    validity_days: number;
    job_live_days: number;
    is_current: boolean;
}

interface CurrentSubscription {
    id: number;
    employer_id: number;
    plan_id: number;
    job_posts_total: number;
    job_posts_used: number;
    featured_jobs_total: number;
    featured_jobs_used: number;
    purchase_date: string;
    starts_at: string;
    expires_at: string;
    status: string;
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
    payments: Payment[];
    invoices: Invoice[];
}

interface ApiResponse {
    status: boolean;
    data: PurchaseHistoryData;
    message?: string;
}

export default function PurchaseHistoryClient() {
  const [data, setData] = useState<PurchaseHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardServerFetch<ApiResponse>("employer/payments-history");
      if (res.status) {
        setData(res.data);
      } else {
        setError(res.message || "Failed to load billing data");
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
  const invoices = data?.invoices || [];
  const payments = data?.payments || [];
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
          <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-blue-100 shadow-sm transition-all hover:shadow-md">
            <div className="space-y-0.5 min-w-0">
              <p className="text-[9px] sm:text-[10px] font-semibold text-slate-400 tracking-wider truncate">Credits</p>
              <p className="text-sm sm:text-lg font-semibold text-[#00359E] truncate">{sub.job_posts_total - sub.job_posts_used} <span className="text-[10px] sm:text-xs font-medium text-slate-400">/ {sub.job_posts_total}</span></p>
            </div>
            <div className="space-y-0.5 border-l border-slate-100 pl-3 sm:pl-4 min-w-0">
              <p className="text-[9px] sm:text-[10px] font-semibold text-slate-400 tracking-wider truncate">Status</p>
              <div className="flex items-center gap-1 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <p className="text-[11px] sm:text-sm font-semibold text-emerald-600 capitalize truncate">{sub.status}</p>
              </div>
            </div>
            <div className="space-y-0.5 border-l border-slate-100 pl-3 sm:pl-4 min-w-0">
              <p className="text-[9px] sm:text-[10px] font-semibold text-slate-400 tracking-wider truncate">Expires</p>
              <p className="text-[11px] sm:text-sm font-semibold text-slate-800 truncate">{formatDate(sub.expires_at)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.is_current;
          const price = plan.offer_price === "0.00" || plan.offer_price === "0" ? "Free" : `₹${Number(plan.offer_price).toLocaleString('en-IN')}`;
          
          return (
            <div 
              key={plan.id}
              className={cn(
                "rounded-2xl p-6 flex flex-col border transition-all duration-300 relative",
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

              <div className="space-y-6 flex-1">
                <div>
                  <h3 className="text-[14px] font-semibold text-slate-900 mb-3">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold text-slate-900 tracking-tight">{price}</span>
                    {price !== "Free" && (
                      <span className="text-[13px] text-slate-400 font-medium">/ package</span>
                    )}
                  </div>
                  {plan.actual_price !== plan.offer_price && (
                    <p className="text-[12px] text-slate-300 line-through font-medium">₹{Number(plan.actual_price).toLocaleString('en-IN')}</p>
                  )}
                </div>

                <div className="space-y-3.5 pt-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <FileText className="w-3 h-3 text-[#1E3A8A]" />
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium">{plan.job_posts_limit} Job Postings</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <Clock className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium">Package valid for {plan.validity_days} days</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <Calendar className="w-3 h-3 text-indigo-600" />
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium">Jobs live for {plan.job_live_days} days</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4.5 h-4.5 text-[#10B981]" strokeWidth={2.5} />
                    </div>
                    <span className="text-[13px] text-slate-600 font-medium">Email Support</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                {isCurrent ? (
                  <div className="w-full py-2.5 px-6 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center gap-2 font-semibold text-[13px] shadow-sm">
                    Active Plan
                  </div>
                ) : (
                  <button className="w-full py-2.5 px-6 rounded-xl font-semibold text-[13px] transition-all duration-200 bg-white text-[#1E3A8A] border border-blue-100 hover:bg-blue-50/50 flex items-center justify-center gap-2 group">
                    Upgrade Now <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-10">
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
                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 tracking-wider text-center">Actions</th>
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
                        <button className="p-2 text-slate-400 hover:text-[#1E3A8A] hover:bg-blue-50 rounded-lg transition-all">
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
                    <button className="p-1 text-slate-300 hover:text-slate-600 transition-colors">
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
