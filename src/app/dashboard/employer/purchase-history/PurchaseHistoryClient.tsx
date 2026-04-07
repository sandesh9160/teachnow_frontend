"use client";

import { useCallback, useEffect, useState } from "react";
import { 
  CheckCircle2, 
  Download, 
  Crown,
  History,
  Zap,
  ShieldCheck,
  Loader2,
  AlertCircle,
  FileText,
  BadgeCent
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
    features?: string[];
    is_active?: number;
    created_at?: string;
    updated_at?: string;
    is_current: boolean;
}

interface CurrentSubscription {
    id: number;
    employer_id: number;
    plan_id: number;
    order_id: number;
    job_posts_total: number;
    job_posts_used: number;
    purchase_date: string;
    starts_at: string;
    expires_at: string;
    status: string;
    created_at: string | null;
    updated_at: string;
}

interface Payment {
  id: number;
  amount: string;
  payment_method: string;
  payment_status: string;
  transaction_id: string;
  plan_name?: string;
  created_at: string | null;
  updated_at: string | null;
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
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        <p className="text-xs text-gray-400 font-medium tracking-normal">Loading billing history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-sm text-gray-500 font-medium tracking-normal">{error}</p>
        <button 
          onClick={fetchHistory}
          className="text-xs font-bold text-blue-600 hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  const plans = data?.plans || [];
  const invoices = data?.invoices || [];
  const payments = data?.payments || [];

  // Simple mapping for icons and colors based on plan name or index
  const getPlanStyles = (plan: Plan, index: number) => {
    const name = plan.name.toLowerCase();
    if (name.includes('basic') || name.includes('starter') || index === 0) {
      return { icon: Zap, color: 'emerald' };
    }
    if (name.includes('pro') || name.includes('standard') || index === 1) {
      return { icon: ShieldCheck, color: 'blue' };
    }
    return { icon: Crown, color: 'indigo' };
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Mobile-Optimized Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-gray-100">
        <div className="space-y-0.5">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-normal">Billing & Subscription</h1>
          <p className="text-[11px] sm:text-xs text-gray-400 font-medium tracking-normal">Manage your plans, payments and invoices</p>
        </div>
      </div>

      {/* Mobile-Responsive Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {plans.map((plan, index) => {
          const styles = getPlanStyles(plan, index);
          const Icon = styles.icon;
          
          return (
            <div 
              key={plan.id}
              className={cn(
                "relative bg-white rounded-xl p-4 sm:p-5 flex flex-col gap-5 sm:gap-6 shadow-sm border transition-all",
                plan.is_current 
                  ? "border-blue-600 ring-4 ring-blue-50/30" 
                  : "border-gray-100"
              )}
            >
              {plan.is_current && (
                <div className="absolute top-2.5 right-2.5 bg-blue-600 text-white px-1.5 py-0.5 rounded text-[8px] font-semibold tracking-normal">
                  Active
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                 <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0",
                      styles.color === 'emerald' && "bg-emerald-50 text-emerald-600",
                      styles.color === 'blue' && "bg-blue-50 text-blue-600",
                      styles.color === 'indigo' && "bg-indigo-50 text-indigo-600",
                    )}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 tracking-normal">{plan.name}</h3>
                 </div>
                
                 <div className="flex items-baseline gap-1">
                   <span className="text-xl sm:text-2xl font-semibold text-gray-900 leading-none">₹{plan.offer_price}</span>
                   <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold">/{plan.validity_days} days</span>
                   {plan.actual_price !== plan.offer_price && (
                      <span className="text-[10px] text-gray-300 line-through ml-1">₹{plan.actual_price}</span>
                   )}
                 </div>

                 <div className="space-y-2 pt-1 border-t border-gray-50">
                   {(plan.features || []).map((feature, i) => (
                     <div key={i} className="flex items-start gap-2.5">
                       <CheckCircle2 className={cn(
                          "w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 mt-0.5",
                          plan.is_current ? "text-blue-500" : "text-emerald-500"
                       )} />
                       <span className="text-[10px] sm:text-[11px] text-gray-500 font-bold leading-tight tracking-normal">{feature}</span>
                     </div>
                   ))}
                   <div className="flex items-start gap-2.5">
                      <CheckCircle2 className={cn(
                          "w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 mt-0.5",
                          plan.is_current ? "text-blue-500" : "text-emerald-500"
                       )} />
                      <span className="text-[10px] sm:text-[11px] text-gray-500 font-bold leading-tight tracking-normal">{plan.job_posts_limit} Job Posts</span>
                   </div>
                 </div>
              </div>

              <div className="mt-auto pt-2">
                <button 
                  className={cn(
                    "w-full h-8 sm:h-9 rounded-lg font-semibold text-[10px] tracking-normal transition-all",
                    plan.is_current 
                      ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" 
                      : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 font-bold border border-gray-100"
                  )}
                >
                  {plan.is_current ? "Current Plan" : "Upgrade"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Payment History Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div className="flex items-center gap-2.5">
                <BadgeCent className="w-3.5 h-3.5 text-gray-400" />
                <h2 className="text-[10px] sm:text-xs font-semibold text-gray-900 tracking-normal">Payment History</h2>
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-hidden custom-scrollbar">
            <table className="w-full text-left min-w-[500px]">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-2.5 text-[9px] font-semibold text-gray-600 ">Transaction ID</th>
                  <th className="px-4 py-2.5 text-[9px] font-semibold text-gray-600 ">Plan</th>
                  <th className="px-4 py-2.5 text-[9px] font-semibold text-gray-600  text-center">Method</th>
                  <th className="px-4 py-2.5 text-[9px] font-semibold text-gray-600  text-right">Amount</th>
                  <th className="px-4 py-2.5 text-[9px] font-semibold text-gray-600  text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.length > 0 ? payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] sm:text-[11px] font-semibold text-gray-900 tracking-normal block truncate max-w-[120px]">
                          {payment.transaction_id || payment.id}
                        </span>
                        <span className="text-[8px] font-bold text-gray-300 tracking-normal uppercase">#PAYMENT-{payment.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                       <span className="text-[10px] sm:text-[11px] font-bold text-gray-600 tracking-normal">
                          {payment.plan_name || "N/A"}
                       </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                       <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-[8px] font-bold uppercase tracking-wider">
                          {payment.payment_method}
                       </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                       <span className="text-[10px] sm:text-[11px] font-bold text-gray-900">₹{payment.amount}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                       <span className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider",
                          payment.payment_status.toLowerCase() === 'success' 
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100/30" 
                            : "bg-red-50 text-red-600 border border-red-100/30"
                       )}>
                          {payment.payment_status}
                       </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center">
                       <p className="text-[10px] font-bold text-gray-300">No payments recorded</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoices List Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div className="flex items-center gap-2.5">
                <FileText className="w-3.5 h-3.5 text-gray-400" />
                <h2 className="text-[10px] sm:text-xs font-semibold text-gray-900 tracking-normal">Recent Invoices</h2>
            </div>
            {invoices.length > 0 && (
              <button className="text-[9px] font-semibold text-blue-600 tracking-normal">
                  Download All
              </button>
            )}
          </div>

          <div className="divide-y divide-gray-50">
            {invoices.length > 0 ? invoices.map((invoice) => (
              <div key={invoice.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 border border-gray-100">
                    <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[10px] sm:text-[11px] font-semibold text-gray-900 tracking-normal">{invoice.invoice_number}</h4>
                    <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 tracking-normaler">{invoice.invoice_date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-6">
                  <div className="text-right flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-900 tracking-normal">₹{invoice.amount}</span>
                    <span className="bg-emerald-50 text-emerald-600 px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-semibold tracking-normal border border-emerald-100/30 self-end sm:self-center">
                      Paid
                    </span>
                  </div>
                  <button className="p-1.5 sm:p-2 rounded-lg text-gray-300 hover:text-gray-900 transition-colors border border-transparent hover:border-gray-100">
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="px-6 py-10 text-center space-y-2">
                <History className="w-6 h-6 text-gray-200 mx-auto" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No invoices found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


