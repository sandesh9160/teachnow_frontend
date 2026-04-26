"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { clearAuthCookies } from "@/lib/api";
import { useClientSession } from "@/hooks/useClientSession";
import { toast } from "sonner";

/**
 * SessionTimeoutHandler - Monitors user inactivity and automatically logs out.
 * Threshold is set to 30 minutes.
 */
const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes

export default function SessionTimeoutHandler() {
  const { isLoggedIn } = useClientSession();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const handleLogout = useCallback(() => {
    if (isLoggedIn) {
      console.log("[SessionTimeout] Inactivity detected. Logging out...");
      
      // 1. Clear cookies
      clearAuthCookies();
      
      // 2. Redirect to login with reason
      const loginUrl = `/auth/login?session_expired=1&redirect=${encodeURIComponent(pathname)}`;
      window.location.href = loginUrl;
    }
  }, [isLoggedIn, pathname]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (isLoggedIn) {
      timeoutRef.current = setTimeout(handleLogout, TIMEOUT_DURATION);
    }
  }, [isLoggedIn, handleLogout]);

  useEffect(() => {
    // Only monitor if the user is actually logged in
    if (!isLoggedIn) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    // List of events that count as "activity"
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click"
    ];
    
    // Initial start of the timer
    resetTimer();

    // Attach listeners to all events
    const eventHandler = () => resetTimer();
    events.forEach((event) => {
      window.addEventListener(event, eventHandler);
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, eventHandler);
      });
    };
  }, [isLoggedIn, resetTimer]);

  return null;
}
