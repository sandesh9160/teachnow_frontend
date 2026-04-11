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
  // AlertTriangle,
  Zap,
  Star
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
  } = useNotifications("employer");

  if (loading && notifications.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 flex flex-col items-center justify-center gap-4 shadow-sm">
        <div className="w-8 h-8 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-400 text-[11px] font-medium tracking-tight">Accessing notifications...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 flex flex-col items-center justify-center text-center gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16" />
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-1 relative z-10 border border-slate-100 shadow-inner">
          <Bell className="w-7 h-7 text-slate-200" />
        </div>
        <div className="relative z-10">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">All Caught Up</h3>
          <p className="text-slate-400 text-[12px] max-w-[240px] mx-auto mt-1 leading-relaxed font-medium">
            Your institution has no new alerts. Important updates will appear here as they arrive.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-[11px] font-bold text-slate-500 tracking-tight">Recent activity</h2>
          {unreadCount > 0 && (
            <span className="bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full text-[9px] font-bold shadow-sm border border-indigo-100/50">
              {unreadCount} NEW
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 transition-all flex items-center gap-1.5 active:scale-95 group"
          >
            <CheckCircle2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            Mark all read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-2 shadow-sm">
        <div className="space-y-1">
          {notifications.map((notification) => {
            const getIcon = () => {
              const type = notification.type?.toLowerCase();
              if (type?.includes('applicant')) return <UserPlus className="w-4 h-4" />;
              if (type?.includes('job')) return <Briefcase className="w-4 h-4" />;
              if (type?.includes('subscription') || type?.includes('credit')) return <Zap className="w-4 h-4" />;
              if (type?.includes('featured')) return <Star className="w-4 h-4" />;
              return <Bell className="w-4 h-4" />;
            };

            const getColorConfig = () => {
              const type = notification.type?.toLowerCase();
              if (type?.includes('applicant')) return { border: "border-indigo-100", bg: "bg-indigo-50/20", accent: "bg-indigo-500", iconBg: "bg-indigo-50 text-indigo-500" };
              if (type?.includes('job')) return { border: "border-emerald-100", bg: "bg-emerald-50/20", accent: "bg-emerald-500", iconBg: "bg-emerald-50 text-emerald-500" };
              if (type?.includes('subscription') || type?.includes('credit')) return { border: "border-amber-100", bg: "bg-amber-50/20", accent: "bg-amber-500", iconBg: "bg-amber-50 text-amber-500" };
              if (type?.includes('expired') || type?.includes('deleted')) return { border: "border-rose-100", bg: "bg-rose-50/20", accent: "bg-rose-500", iconBg: "bg-rose-50 text-rose-500" };
              return { border: "border-slate-100", bg: "bg-white", accent: "bg-primary", iconBg: "bg-slate-50 text-slate-500" };
            };

            const colors = getColorConfig();

            return (
              <div
                key={notification.id}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
                className={cn(
                  "group flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer mb-2 last:mb-0 relative overflow-hidden",
                  !notification.is_read 
                    ? `bg-indigo-50/10 ${colors.border} shadow-sm border-l-4 border-l-indigo-500`
                    : `hover:border-slate-200 hover:bg-slate-50/30 ${colors.bg} ${colors.border}`
                )}
              >
                {!notification.is_read && (
                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/[0.02] rounded-full -mr-10 -mt-10" />
                )}
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105 ${colors.iconBg} ${!notification.is_read && 'border-primary/20'}`}>
                  {getIcon()}
                </div>
                
                <div className="flex-1 min-w-0 pt-0.5 relative z-10">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <h4 className={cn(
                      "text-sm font-bold leading-tight truncate tracking-tight",
                      !notification.is_read ? "text-slate-900" : "text-slate-600 font-semibold"
                    )}>
                      {notification.title}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap bg-white px-2 py-0.5 rounded-lg border border-slate-100 shadow-sm shrink-0">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className={cn(
                    "text-[12px] leading-relaxed line-clamp-2",
                    !notification.is_read ? "text-slate-700 font-medium" : "text-slate-500 font-medium"
                  )}>
                    {notification.message}
                  </p>
                </div>

                {!notification.is_read && (
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 animate-pulse shrink-0" title="Unread" />
                )}
              </div>
            );
          })}
        </div>

        {pagination && pagination.lastPage > 1 && (
          <div className="mt-4 px-3 py-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              Showing <span className="text-primary">{notifications.length}</span> of <span className="text-slate-900">{pagination.total}</span>
            </p>
            
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.currentPage === 1}
                onClick={() => fetchNotifications(pagination.currentPage - 1)}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-[10px] font-bold text-slate-700 px-3">
                {pagination.currentPage} / {pagination.lastPage}
              </span>

              <button
                disabled={pagination.currentPage === pagination.lastPage}
                onClick={() => fetchNotifications(pagination.currentPage + 1)}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-all shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
