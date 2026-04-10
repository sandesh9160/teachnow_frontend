"use client";
import { useCallback, useEffect, useState } from "react";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import type { NotificationResponse, Notification } from "@/types/notification";
import type { DashboardRole } from "@/types/session";

export function useNotifications(role: DashboardRole = "job_seeker") {
  // Map internal role names to API endpoint segments
  const roleSlug = role === "job_seeker" ? "jobseeker" : role;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    lastPage: number;
    total: number;
  } | null>(null);

  const fetchNotifications = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardServerFetch<NotificationResponse>(`${roleSlug}/notifications?page=${page}`, {
        method: "GET",
      });

      if (res?.status) {
        setNotifications(res.data.data);
        setPagination({
          currentPage: res.data.current_page,
          lastPage: res.data.last_page,
          total: res.data.total,
        });
        const unread = res.data.data.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
      } else {
        setError(res?.message || "Failed to load notifications");
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [role]);

  const markAsRead = async (id: number) => {
    try {
      const res = await dashboardServerFetch<any>(`${roleSlug}/notifications/${id}/read`, {
        method: "POST",
      });

      if (res?.status) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to mark notification as read", e);
      return false;
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await dashboardServerFetch<any>(`${roleSlug}/notifications/read-all`, {
        method: "POST",
      });

      if (res?.status) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to mark all notifications as read", e);
      return false;
    }
  };

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
