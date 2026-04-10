"use client";

import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { 
  Bell, 
  CheckCircle2, 
  Clock, 

  ChevronLeft, 
  ChevronRight,
 
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
  } = useNotifications();

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
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-1">
          <Bell className="w-7 h-7 text-slate-200" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">No notifications</h3>
          <p className="text-slate-400 text-xs max-w-[200px] mx-auto mt-0.5">
            You're all caught up! Updates will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Activity</h2>
          {unreadCount > 0 && (
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">
              {unreadCount} New
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Main Outer Box */}
      <div className="bg-white rounded-xl border border-slate-100 p-2 shadow-sm">
        <div className="space-y-1.5">
          {notifications.map((notification) => {
            const typeColorMap: Record<string, string> = {
              job_applied: "border-indigo-100 bg-indigo-50/20",
              job_deleted: "border-rose-100 bg-rose-50/20",
              job_created: "border-emerald-100 bg-emerald-50/20",
            };
            const typeStyle = typeColorMap[notification.type] || "border-slate-100 bg-white";
            const accentColor = 
              notification.type === 'job_applied' ? 'bg-indigo-500' :
              notification.type === 'job_deleted' ? 'bg-rose-500' :
              notification.type === 'job_created' ? 'bg-emerald-500' : 
              'bg-primary';

            return (
              <div
                key={notification.id}
                className={`group flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer shadow-sm mb-3 last:mb-0 ${
                  !notification.is_read 
                    ? (notification.type === 'job_deleted' ? 'bg-rose-50/50 border-rose-200' : 
                       notification.type === 'job_created' ? 'bg-emerald-50/50 border-emerald-200' :
                       'bg-primary/[0.04] border-primary/20 shadow-primary/5')
                    : `hover:border-slate-300 ${typeStyle}`
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className={`shrink-0 w-2 h-2 rounded-full mt-2 ${
                  !notification.is_read ? accentColor : "bg-slate-200"
                }`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <h4 className={`text-[14px] font-bold leading-tight truncate ${
                      !notification.is_read ? "text-slate-900" : "text-slate-600"
                    }`}>
                      {notification.title}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap bg-white/80 px-2 py-0.5 rounded-lg border border-slate-100 shadow-sm">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className={`text-[13px] leading-relaxed line-clamp-2 ${
                    !notification.is_read ? "text-slate-700 font-semibold" : "text-slate-500"
                  }`}>
                    {notification.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {pagination && pagination.lastPage > 1 && (
          <div className="mt-3 px-2 py-2 bg-slate-50/50 rounded-lg border border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-semibold text-slate-500">
              <span className="text-slate-900">{pagination.total}</span> items total
            </p>
            
            <div className="flex items-center gap-1.5">
              <button
                disabled={pagination.currentPage === 1}
                onClick={() => fetchNotifications(pagination.currentPage - 1)}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-all shadow-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              
              <span className="text-[10px] font-bold text-slate-700 px-2">
                {pagination.currentPage} / {pagination.lastPage}
              </span>

              <button
                disabled={pagination.currentPage === pagination.lastPage}
                onClick={() => fetchNotifications(pagination.currentPage + 1)}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-all shadow-sm"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
