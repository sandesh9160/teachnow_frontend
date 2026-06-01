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
      <div className="bg-white rounded-xl border border-slate-100 p-6 flex flex-col items-center justify-center gap-2 shadow-sm">
        <div className="w-5 h-5 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-400 text-[10px] font-medium tracking-tight">Accessing notifications...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 p-6 flex flex-col items-center justify-center text-center gap-2 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50/50 rounded-full -mr-10 -mt-10" />
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center relative z-10 border border-slate-100 shadow-inner">
          <Bell className="w-5 h-5 text-slate-200" />
        </div>
        <div className="relative z-10">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">All Caught Up</h3>
          <p className="text-slate-400 text-[10px] max-w-[200px] mx-auto mt-0.5 leading-relaxed font-medium">
            Your institution has no new alerts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[10px] font-bold text-slate-500 tracking-tight">Recent activity</h2>
          {unreadCount > 0 && (
            <span className="bg-indigo-50 text-indigo-600 px-1.5 py-px rounded-full text-[8px] font-bold shadow-sm border border-indigo-100/50">
              {unreadCount} NEW
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-700 transition-all flex items-center gap-1 active:scale-95 group"
          >
            <CheckCircle2 className="w-3 h-3 group-hover:scale-110 transition-transform" />
            Mark all read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-1.5 shadow-sm">
        <div className="space-y-1.5">
          {notifications.map((notification) => {
            const getIcon = () => {
              const type = notification.type?.toLowerCase();
              if (type?.includes('applicant')) return <UserPlus className="w-3 h-3" />;
              if (type?.includes('job')) return <Briefcase className="w-3 h-3" />;
              if (type?.includes('subscription') || type?.includes('credit')) return <Zap className="w-3 h-3" />;
              if (type?.includes('featured')) return <Star className="w-3 h-3" />;
              return <Bell className="w-3 h-3" />;
            };

            const getColorConfig = () => {
              const type = notification.type?.toLowerCase();
              if (type?.includes('applicant')) return { border: "border-indigo-200", bg: "bg-indigo-50/30", accent: "bg-indigo-500", iconBg: "bg-indigo-50 text-indigo-500", leftBorder: "border-l-indigo-400", badgeBg: "bg-indigo-50 text-indigo-500 border-indigo-200" };
              if (type?.includes('job')) return { border: "border-emerald-200", bg: "bg-emerald-50/30", accent: "bg-emerald-500", iconBg: "bg-emerald-50 text-emerald-500", leftBorder: "border-l-emerald-400", badgeBg: "bg-emerald-50 text-emerald-600 border-emerald-200" };
              if (type?.includes('subscription') || type?.includes('credit')) return { border: "border-amber-200", bg: "bg-amber-50/30", accent: "bg-amber-500", iconBg: "bg-amber-50 text-amber-500", leftBorder: "border-l-amber-400", badgeBg: "bg-amber-50 text-amber-600 border-amber-200" };
              if (type?.includes('expired') || type?.includes('deleted')) return { border: "border-rose-200", bg: "bg-rose-50/30", accent: "bg-rose-500", iconBg: "bg-rose-50 text-rose-500", leftBorder: "border-l-rose-400", badgeBg: "bg-rose-50 text-rose-500 border-rose-200" };
              return { border: "border-slate-200", bg: "bg-white", accent: "bg-primary", iconBg: "bg-slate-50 text-slate-500", leftBorder: "border-l-slate-300", badgeBg: "bg-slate-50 text-slate-500 border-slate-200" };
            };

            const colors = getColorConfig();

            return (
              <div
                key={notification.id}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
                className={cn(
                  "group flex items-start gap-2.5 p-2.5 rounded-lg border-l-[3px] border transition-all duration-200 cursor-pointer relative overflow-hidden",
                  !notification.is_read 
                    ? `bg-indigo-50/20 border-indigo-200 border-l-indigo-500 shadow-sm`
                    : `hover:shadow-sm hover:bg-slate-50/50 ${colors.bg} ${colors.border} ${colors.leftBorder}`
                )}
              >
                <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border transition-transform group-hover:scale-105 ${colors.iconBg} ${!notification.is_read && 'border-primary/20'}`}>
                  {getIcon()}
                </div>
                
                <div className="flex-1 min-w-0 relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={cn(
                      "text-[11px] font-bold leading-tight truncate tracking-tight",
                      !notification.is_read ? "text-slate-900" : "text-slate-600 font-semibold"
                    )}>
                      {notification.title}
                    </h4>
                    <span className={`text-[9px] font-bold whitespace-nowrap px-1.5 py-px rounded border shrink-0 ${colors.badgeBg}`}>
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className={cn(
                    "text-[10px] leading-snug line-clamp-1 mt-0.5",
                    !notification.is_read ? "text-slate-700 font-medium" : "text-slate-500"
                  )}>
                    {notification.message}
                  </p>
                </div>

                {!notification.is_read && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 animate-pulse shrink-0" title="Unread" />
                )}
              </div>
            );
          })}
        </div>

        {pagination && pagination.lastPage > 1 && (
          <div className="mt-1.5 px-2 py-1.5 bg-slate-50/50 rounded-lg border border-slate-100 flex items-center justify-between">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
              <span className="text-primary">{notifications.length}</span> of <span className="text-slate-900">{pagination.total}</span>
            </p>
            
            <div className="flex items-center gap-1">
              <button
                disabled={pagination.currentPage === 1}
                onClick={() => fetchNotifications(pagination.currentPage - 1)}
                className="p-1 rounded border border-slate-200 bg-white text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-all"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              
              <span className="text-[9px] font-bold text-slate-700 px-1.5">
                {pagination.currentPage} / {pagination.lastPage}
              </span>

              <button
                disabled={pagination.currentPage === pagination.lastPage}
                onClick={() => fetchNotifications(pagination.currentPage + 1)}
                className="p-1 rounded border border-slate-200 bg-white text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-all"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
