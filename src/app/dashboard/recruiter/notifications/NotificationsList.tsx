"use client";

import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { 
  Bell, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  UserPlus,
  Briefcase,
  Zap,
  Star,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationsList() {
  const { 
    notifications, 
    loading, 
    unreadCount, 
    pagination, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications("recruiter");

  if (loading && notifications.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-20 flex flex-col items-center justify-center gap-4 shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-200" />
        <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest">Syncing Activity...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-20 flex flex-col items-center justify-center text-center gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16" />
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-1 relative z-10 border border-slate-100 shadow-inner">
          <Bell className="w-7 h-7 text-slate-200" />
        </div>
        <div className="relative z-10">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Everything Clear</h3>
          <p className="text-slate-400 text-[12px] max-w-[240px] mx-auto mt-1 leading-relaxed font-medium">
            You have no new alerts. Important updates will appear here as they arrive.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-1 gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-[17px] font-semibold text-[#1e293b] tracking-tight">Recent Activity</h2>
          {unreadCount > 0 && (
            <span className="bg-indigo-600 text-white px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] font-bold shadow-lg shadow-indigo-600/20 whitespace-nowrap">
              {unreadCount} NEW
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-[10px] sm:text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5 p-1.5 px-2 hover:bg-indigo-50 rounded-xl group shrink-0 active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span className="hidden xs:inline">Mark all read</span>
            <span className="xs:hidden">Read All</span>
          </button>
        )}
      </div>

      {/* Main List Container */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-1.5 sm:p-2.5 shadow-sm space-y-1">
        {notifications.map((notification) => {
          const isUnread = !notification.is_read;
          
          const getIcon = () => {
            const type = notification.type?.toLowerCase();
            if (type?.includes('applicant')) return <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
            if (type?.includes('job')) return <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
            if (type?.includes('subscription') || type?.includes('credit')) return <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
            if (type?.includes('featured')) return <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
            return <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
          };
            const getColorConfig = () => {
              const type = notification.type?.toLowerCase();
              if (type?.includes('applicant')) return { border: "border-indigo-100", bg: "bg-indigo-50/20", accent: "bg-indigo-500", iconBg: "bg-indigo-50 text-indigo-500" };
              if (type?.includes('job')) return { border: "border-emerald-100", bg: "bg-emerald-50/20", accent: "bg-emerald-500", iconBg: "bg-emerald-50 text-emerald-500" };
              if (type?.includes('subscription') || type?.includes('credit')) return { border: "border-amber-100", bg: "bg-amber-50/20", accent: "bg-amber-500", iconBg: "bg-amber-50 text-amber-500" };
              if (type?.includes('expired') || type?.includes('deleted')) return { border: "border-rose-100", bg: "bg-rose-50/20", accent: "bg-rose-500", iconBg: "bg-rose-50 text-rose-500" };
              return { border: "border-slate-100", bg: "bg-white", accent: "bg-indigo-600", iconBg: "bg-slate-50 text-slate-500" };
            };

            const colors = getColorConfig();

          return (
            <div
              key={notification.id}
              onClick={() => isUnread && markAsRead(notification.id)}
              className={cn(
                "group flex items-start gap-4 p-5 sm:p-6 rounded-2xl border transition-all duration-300 cursor-pointer shadow-sm relative overflow-hidden active:bg-slate-50 mb-3 last:mb-0",
                isUnread 
                  ? `bg-white border-slate-200/60 ring-1 ring-slate-100 shadow-md`
                  : `bg-white border-slate-100 hover:border-slate-200 hover:shadow-md`
              )}
            >
              {/* Icon & Status */}
              <div className="relative shrink-0">
                <div className={cn(
                  "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-300 border shadow-sm",
                  colors.iconBg,
                  isUnread ? "border-transparent" : "border-slate-100"
                )}>
                  {getIcon()}
                </div>
                {isUnread && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white animate-pulse shadow-sm z-20" />
                )}
              </div>

              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "text-[15px] sm:text-[16px] font-bold leading-tight tracking-tight mb-1 transition-colors",
                    isUnread ? "text-slate-900" : "text-slate-600"
                  )}>
                    {notification.title}
                  </h4>
                  
                  {/* Mobile Badge (only shown on mobile) */}
                  <div className="sm:hidden mb-2">
                     <span className={cn(
                      "text-[10px] font-bold px-3 py-1 rounded-full border shadow-sm transition-colors inline-block",
                      isUnread ? "bg-slate-50 text-slate-500 border-slate-200" : "bg-slate-50 text-slate-400 border-slate-100"
                    )}>
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  <p className={cn(
                    "text-[13px] sm:text-sm leading-relaxed",
                    isUnread ? "text-slate-600 font-medium" : "text-slate-400 font-normal"
                  )}>
                    {notification.message}
                  </p>
                </div>

                {/* Desktop Badge (only shown on desktop) */}
                <div className="hidden sm:block shrink-0">
                  <span className={cn(
                    "text-[10px] font-bold px-3 py-1.5 rounded-full border shadow-sm transition-colors whitespace-nowrap",
                    isUnread ? "bg-slate-50 text-slate-500 border-slate-200" : "bg-slate-50 text-slate-400 border-slate-100"
                  )}>
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination && pagination.lastPage > 1 && (
        <div className="mt-4 px-2 sm:px-3 py-2 sm:py-3 bg-slate-50/40 rounded-xl border border-slate-100 flex flex-col xs:flex-row items-center justify-between gap-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
            <span className="xs:hidden">Page </span>
            <span className="text-indigo-600">{pagination.currentPage}</span> of <span className="text-slate-900">{pagination.lastPage}</span>
            <span className="hidden xs:inline text-slate-400 mx-2">|</span>
            <span className="hidden xs:inline">Total </span>
            <span className="hidden xs:inline text-slate-900">{pagination.total}</span>
          </p>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() => fetchNotifications(pagination.currentPage - 1)}
              className="h-8 p-3 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-500 hover:text-indigo-600 hover:shadow-md transition-all active:scale-90"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1 px-3 h-8 bg-white border border-slate-200 rounded-xl">
              <span className="text-[11px] font-bold text-slate-700">{pagination.currentPage}</span>
              <span className="text-slate-300 text-[10px]">/</span>
              <span className="text-[11px] font-bold text-slate-400">{pagination.lastPage}</span>
            </div>

            <button
              disabled={pagination.currentPage === pagination.lastPage}
              onClick={() => fetchNotifications(pagination.currentPage + 1)}
              className="h-8 p-3 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-500 hover:text-indigo-600 hover:shadow-md transition-all active:scale-90"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
