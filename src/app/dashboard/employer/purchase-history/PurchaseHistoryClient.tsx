"use client";

import { 
  CheckCircle2, 
  Download, 
  CreditCard,
  Crown,
  History,
  Zap,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    isCurrent: false,
    icon: Zap,
    color: "emerald",
    features: [
      "3 job posts/month",
      "Basic applicant tracking",
      "Email support"
    ]
  },
  {
    name: "Professional",
    price: "₹2,999",
    period: "/month",
    isCurrent: true,
    icon: ShieldCheck,
    color: "blue",
    features: [
      "Unlimited job posts",
      "Advanced analytics",
      "Priority support",
      "Featured listings"
    ]
  },
  {
    name: "Enterprise",
    price: "₹9,999",
    period: "/month",
    isCurrent: false,
    icon: Crown,
    color: "indigo",
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom branding",
      "API access",
      "Bulk hiring tools"
    ]
  }
];

const invoices = [
  { id: "INV-2026-003", date: "Mar 1, 2026", amount: "₹2,999", status: "Paid" },
  { id: "INV-2026-002", date: "Feb 1, 2026", amount: "₹2,999", status: "Paid" },
  { id: "INV-2026-001", date: "Jan 1, 2026", amount: "₹2,999", status: "Paid" },
];

export default function PurchaseHistoryClient() {
  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-4 sm:space-y-5 overflow-x-hidden">
      {/* Mobile-Optimized Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-gray-100">
        <div className="space-y-0.5">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-normal">Billing</h1>
          <p className="text-[11px] sm:text-xs text-gray-400 font-medium tracking-normal">Manage your subscription and invoices</p>
        </div>
      </div>

      {/* Mobile-Responsive Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={cn(
              "relative bg-white rounded-xl p-4 sm:p-5 flex flex-col gap-5 sm:gap-6 shadow-sm border transition-all",
              plan.isCurrent 
                ? "border-blue-600 ring-4 ring-blue-50/30" 
                : "border-gray-100"
            )}
          >
            {plan.isCurrent && (
              <div className="absolute top-2.5 right-2.5 bg-blue-600 text-white px-1.5 py-0.5 rounded text-[8px] font-semibold  tracking-normal">
                Active
              </div>
            )}

            <div className="space-y-3 sm:space-y-4">
               <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0",
                    plan.color === 'emerald' && "bg-emerald-50 text-emerald-600",
                    plan.color === 'blue' && "bg-blue-50 text-blue-600",
                    plan.color === 'indigo' && "bg-indigo-50 text-indigo-600",
                  )}>
                    <plan.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900  tracking-normal">{plan.name}</h3>
               </div>
              
               <div className="flex items-baseline gap-1">
                 <span className="text-xl sm:text-2xl font-semibold text-gray-900 leading-none">{plan.price}</span>
                 {plan.period && <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold ">{plan.period}</span>}
               </div>

               <div className="space-y-2 pt-1 border-t border-gray-50">
                 {plan.features.map((feature, i) => (
                   <div key={i} className="flex items-start gap-2.5">
                     <CheckCircle2 className={cn(
                        "w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 mt-0.5",
                        plan.isCurrent ? "text-blue-500" : "text-emerald-500"
                     )} />
                     <span className="text-[10px] sm:text-[11px] text-gray-500 font-bold leading-tight  tracking-normal">{feature}</span>
                   </div>
                 ))}
               </div>
            </div>

            <div className="mt-auto pt-2">
              <button 
                className={cn(
                  "w-full h-8 sm:h-9 rounded-lg font-semibold text-[10px]  tracking-normal transition-all",
                  plan.isCurrent 
                    ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" 
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 font-bold border border-gray-100"
                )}
              >
                {plan.isCurrent ? "Current Plan" : "Upgrade"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Ultra-Compact Invoice History for Mobile */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
           <div className="flex items-center gap-2.5">
              <History className="w-3.5 h-3.5 text-gray-400" />
              <h2 className="text-[10px] sm:text-xs font-semibold text-gray-900  tracking-normal">Invoices</h2>
           </div>
           <button className="text-[9px] font-semibold text-blue-600  tracking-normal">
              View History
           </button>
        </div>

        <div className="divide-y divide-gray-50">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 border border-gray-100">
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[10px] sm:text-[11px] font-semibold text-gray-900  tracking-normal">{invoice.id}</h4>
                  <p className="text-[8px] sm:text-[9px] font-bold text-gray-400  tracking-normaler">{invoice.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-6">
                <div className="text-right flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="text-[11px] sm:text-xs font-semibold text-gray-900 tracking-normal">{invoice.amount}</span>
                  <span className="bg-emerald-50 text-emerald-600 px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-semibold  tracking-normal border border-emerald-100/30 self-end sm:self-center">
                    {invoice.status}
                  </span>
                </div>
                <button className="p-1.5 sm:p-2 rounded-lg text-gray-300 hover:text-gray-900 transition-colors">
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
