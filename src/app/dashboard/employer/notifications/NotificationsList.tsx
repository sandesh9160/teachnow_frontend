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
      <div className="bg-white rounded-2xl border border-slate-100 p-12 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-500 text-xs font-medium">Fetching notifications...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 flex flex-col items-center justify-center text-center gap-4 shadow-sm">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-1">
          <Bell className="w-8 h-8 text-slate-200" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">No notifications</h3>
          <p className="text-slate-400 text-xs max-w-[240px] mx-auto mt-1 leading-relaxed">
            Your institution is all caught up! Important updates will appear here when they arrive.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Activity</h2>
          {unreadCount > 0 && (
            <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
              {unreadCount} NEW
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-[11px] font-bold text-primary hover:text-primary/80 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mark all as read
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
                className={`group flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer mb-2 last:mb-0 ${
                  !notification.is_read 
                    ? `bg-primary/[0.03] ${colors.border} shadow-sm border-l-4 border-l-primary`
                    : `hover:border-slate-200 ${colors.bg} ${colors.border}`
                }`}
              >
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105 ${colors.iconBg} ${!notification.is_read && 'border-primary/20'}`}>
                  {getIcon()}
                </div>
                
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <h4 className={`text-sm font-bold leading-tight truncate ${
                      !notification.is_read ? "text-slate-900" : "text-slate-600"
                    }`}>
                      {notification.title}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap bg-white px-2 py-0.5 rounded-lg border border-slate-100 shadow-sm shrink-0">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className={`text-xs leading-relaxed line-clamp-2 ${
                    !notification.is_read ? "text-slate-700 font-semibold" : "text-slate-500"
                  }`}>
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
