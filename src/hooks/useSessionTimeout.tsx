import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes for clinical users
const WARNING_BEFORE_TIMEOUT = 2 * 60 * 1000; // 2 minute warning

export function useSessionTimeout() {
  const { user, signOut, roles } = useAuth();
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const isStaffUser = roles.some((r) =>
    ["admin", "provider", "compliance_officer"].includes(r)
  );

  const handleLogout = useCallback(async () => {
    toast.error("Session expired due to inactivity");
    await signOut();
    navigate("/login");
  }, [signOut, navigate]);

  const showWarning = useCallback(() => {
    toast.warning("Your session will expire in 2 minutes due to inactivity", {
      duration: 10000,
      action: {
        label: "Stay logged in",
        onClick: () => resetTimers(),
      },
    });
  }, []);

  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    if (user && isStaffUser) {
      warningRef.current = setTimeout(showWarning, INACTIVITY_TIMEOUT - WARNING_BEFORE_TIMEOUT);
      timeoutRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
    }
  }, [user, isStaffUser, showWarning, handleLogout]);

  useEffect(() => {
    if (!user || !isStaffUser) return;

    const events = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];

    const handleActivity = () => {
      const now = Date.now();
      // Only reset if more than 1 second since last activity (debounce)
      if (now - lastActivityRef.current > 1000) {
        resetTimers();
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    resetTimers();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [user, isStaffUser, resetTimers]);

  return {
    resetTimers,
    lastActivity: lastActivityRef.current,
  };
}
