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
        <div className="fixed inset-x-4 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 sm:w-80 md:w-96 bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border-2 border-slate-300 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-50">
          <div className="px-4 py-3 border-b-2 border-slate-200 flex items-center justify-between bg-white sticky top-0">
            <h3 className="text-[11px] font-bold text-indigo-900">Updates</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                Read All
              </button>
            )}
          </div>

          <div className="max-h-[320px] sm:max-h-[380px] overflow-y-auto custom-scrollbar p-1.5 ">
            {loading && notifications.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-300 gap-2">
                <Inbox className="w-8 h-8 opacity-20" />
                <p className="text-[10px] font-bold tracking-wide">No Alerts</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const typeColorMap: Record<string, string> = {
                  job_applied: "border-indigo-100 bg-indigo-50/20",
                  new_applicant: "border-indigo-100 bg-indigo-50/20",
                  job_deleted: "border-rose-100 bg-rose-50/20",
                  job_created: "border-emerald-100 bg-emerald-50/20",
                  subscription: "border-amber-100 bg-amber-50/20",
                  featured: "border-amber-100 bg-amber-50/20",
                };
                const accentColorMap: Record<string, string> = {
                  job_applied: "bg-indigo-500",
                  new_applicant: "bg-indigo-500",
                  job_deleted: "bg-rose-500",
                  job_created: "bg-emerald-500",
                  subscription: "bg-amber-500",
                  featured: "bg-amber-500",
                };
                const typeStyle = typeColorMap[notification.type] || "border-slate-50 bg-white";
                const accentColor = accentColorMap[notification.type] || "bg-primary";

                return (
                  <div
                    key={notification.id}
                    className={`flex flex-col gap-0.5 px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer relative shadow-sm mb-1.5 last:mb-0 ${
                      !notification.is_read 
                        ? (notification.type === 'job_deleted' ? 'bg-rose-50/40 border-rose-200/50' : 
                           notification.type === 'job_created' ? 'bg-emerald-50/40 border-emerald-200/50' :
                           'bg-primary/[0.03] border-primary/10')
                        : `hover:border-slate-200 ${typeStyle}`
                    }`}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                  >
                    <div className="flex items-center justify-between gap-2 overflow-hidden">
                      <span className={`text-[11px] font-bold leading-tight truncate ${
                        !notification.is_read ? "text-indigo-900" : "text-slate-600"
                      }`}>
                        {notification.title}
                      </span>
                      <span className="text-[8px] font-bold text-slate-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className={`text-[10px] leading-snug line-clamp-2 ${
                      !notification.is_read ? "text-slate-700 font-medium" : "text-slate-600"
                    }`}>
                      {notification.message}
                    </p>
                    {!notification.is_read && (
                      <span className={`absolute left-1 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full ${accentColor}`} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          <Link
            href={`/dashboard/${roleSlug}/notifications`}
            className="block py-2.5 text-center text-[10px] font-extrabold text-slate-500 hover:text-primary hover:bg-slate-50 border-t-2 border-slate-200 transition-all tracking-wide"
            onClick={() => setIsOpen(false)}
          >
            All Activity
          </Link>
        </div>
      )}
    </div>
  );
}
