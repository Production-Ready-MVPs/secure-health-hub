import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Shield, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScreenPrivacyProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export function ScreenPrivacy({ children, enabled = true }: ScreenPrivacyProps) {
  const { roles } = useAuth();
  const [isBlurred, setIsBlurred] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);

  const isStaffUser = roles.some((r) =>
    ["admin", "provider", "compliance_officer"].includes(r)
  );

  const handleVisibilityChange = useCallback(() => {
    if (!enabled || !isStaffUser) return;
    
    if (document.hidden) {
      setIsBlurred(true);
      setManualOverride(false);
    } else {
      // Small delay before unblurring for security
      setTimeout(() => {
        if (!manualOverride) {
          setIsBlurred(false);
        }
      }, 500);
    }
  }, [enabled, isStaffUser, manualOverride]);

  const handleWindowBlur = useCallback(() => {
    if (!enabled || !isStaffUser) return;
    setIsBlurred(true);
    setManualOverride(false);
  }, [enabled, isStaffUser]);

  const handleWindowFocus = useCallback(() => {
    if (!enabled || !isStaffUser) return;
    setTimeout(() => {
      if (!manualOverride) {
        setIsBlurred(false);
      }
    }, 300);
  }, [enabled, isStaffUser, manualOverride]);

  useEffect(() => {
    if (!enabled || !isStaffUser) return;

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [enabled, isStaffUser, handleVisibilityChange, handleWindowBlur, handleWindowFocus]);

  const togglePrivacy = () => {
    if (isBlurred) {
      setIsBlurred(false);
      setManualOverride(false);
    } else {
      setIsBlurred(true);
      setManualOverride(true);
    }
  };

  return (
    <div className="relative">
      {/* Privacy toggle button for staff */}
      {isStaffUser && enabled && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm shadow-lg"
          onClick={togglePrivacy}
          title={isBlurred ? "Show PHI" : "Hide PHI"}
        >
          {isBlurred ? <Eye className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
        </Button>
      )}

      {/* Content */}
      <div
        className={cn(
          "transition-all duration-300",
          isBlurred && "blur-lg pointer-events-none select-none"
        )}
      >
        {children}
      </div>

      {/* Blur overlay */}
      {isBlurred && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="text-center p-8 bg-card rounded-lg shadow-xl border">
            <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">PHI Protected</h2>
            <p className="text-muted-foreground mb-4">
              Screen is blurred to protect patient information
            </p>
            <Button onClick={() => setIsBlurred(false)}>
              <Eye className="mr-2 h-4 w-4" />
              Resume Viewing
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
