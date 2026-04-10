"use client";

import { Bell, CheckCircle2, Inbox } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import type { DashboardRole } from "@/types/session";

export function NotificationBell({ role = "job_seeker" }: { role?: DashboardRole }) {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications(role);
  const roleSlug = role === "job_seeker" ? "jobseeker" : role;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all duration-300 group"
      >
        <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm ring-1 ring-primary/20">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-50">
          <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0">
            <h3 className="text-[12px] font-bold text-slate-900 uppercase tracking-tight">Activity Log</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                Clear All
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto custom-scrollbar p-1.5 ">
            {loading && notifications.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-slate-400 gap-2">
                <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-medium">Syncing...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-slate-400 gap-2">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                  <Inbox className="w-5 h-5 text-slate-200" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-600">All clear</p>
                  <p className="text-[10px] opacity-60">No new alerts</p>
                </div>
              </div>
            ) : (
              notifications.map((notification) => {
                const typeColorMap: Record<string, string> = {
                  job_applied: "border-indigo-100 bg-indigo-50/30",
                  job_deleted: "border-rose-100 bg-rose-50/30",
                  job_created: "border-emerald-100 bg-emerald-50/30",
                };
                const accentColorMap: Record<string, string> = {
                  job_applied: "bg-indigo-500",
                  job_deleted: "bg-rose-500",
                  job_created: "bg-emerald-500",
                };
                const typeStyle = typeColorMap[notification.type] || "border-slate-50 bg-white";
                const accentColor = accentColorMap[notification.type] || "bg-primary";

                return (
                  <div
                    key={notification.id}
                    className={`flex flex-col gap-1 px-4 py-3 rounded-xl border transition-all cursor-pointer relative shadow-sm mb-2 last:mb-0 ${
                      !notification.is_read 
                        ? (notification.type === 'job_deleted' ? 'bg-rose-50/60 border-rose-200 shadow-rose-500/5' : 
                           notification.type === 'job_created' ? 'bg-emerald-50/60 border-emerald-200 shadow-emerald-500/5' :
                           'bg-primary/[0.04] border-primary/20 shadow-primary/5')
                        : `hover:border-slate-200 ${typeStyle}`
                    }`}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                  >
                    <div className="flex items-center justify-between gap-2 overflow-hidden mb-0.5">
                      <span className={`text-[12px] font-bold leading-tight truncate ${
                        !notification.is_read ? "text-slate-900" : "text-slate-600"
                      }`}>
                        {notification.title}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap bg-white/60 px-1.5 py-0.5 rounded-md border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className={`text-[11px] leading-snug line-clamp-1 ${
                      !notification.is_read ? "text-slate-700 font-semibold" : "text-slate-500"
                    }`}>
                      {notification.message}
                    </p>
                    {!notification.is_read && (
                      <span className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full shadow-sm ${accentColor}`} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          <Link
            href={`/dashboard/${roleSlug}/notifications`}
            className="block py-3 text-center text-[11px] font-bold text-slate-500 hover:text-primary hover:bg-slate-50 border-t border-slate-50 transition-all uppercase tracking-wide"
            onClick={() => setIsOpen(false)}
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
