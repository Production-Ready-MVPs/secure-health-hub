import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, ShieldCheck, ShieldX, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface MFAFactor {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: string;
  created_at: string;
}

export default function MFASettings() {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);

  const isStaffUser = roles.some((r) =>
    ["admin", "provider", "compliance_officer"].includes(r)
  );

  useEffect(() => {
    fetchFactors();
    // Staff users require MFA
    setMfaRequired(isStaffUser);
  }, [isStaffUser]);

  const fetchFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      setFactors(data.totp || []);
    } catch (err) {
      console.error("Failed to fetch MFA factors:", err);
    } finally {
      setLoading(false);
    }
  };

  const unenrollFactor = async (factorId: string) => {
    if (mfaRequired && factors.length <= 1) {
      toast.error("Staff users must have MFA enabled");
      return;
    }

    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      toast.success("MFA factor removed");
      fetchFactors();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove MFA factor");
    }
  };

  const hasActiveMFA = factors.some((f) => f.status === "verified");

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Security Settings</h1>

      <div className="max-w-2xl space-y-6">
        {/* MFA Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {hasActiveMFA ? (
                  <ShieldCheck className="h-8 w-8 text-green-500" />
                ) : (
                  <ShieldX className="h-8 w-8 text-destructive" />
                )}
                <div>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    {hasActiveMFA
                      ? "Your account is protected with MFA"
                      : "Add an extra layer of security to your account"}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={hasActiveMFA ? "default" : "destructive"}>
                {hasActiveMFA ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mfaRequired && !hasActiveMFA && (
              <Alert variant="destructive">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  MFA is required for staff accounts. Please enable it immediately.
                </AlertDescription>
              </Alert>
            )}

            {/* Enrolled Factors */}
            {factors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Enrolled Authenticators</h4>
                {factors.map((factor) => (
                  <div
                    key={factor.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">
                          {factor.friendly_name || "Authenticator App"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(factor.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={factor.status === "verified" ? "default" : "secondary"}>
                        {factor.status}
                      </Badge>
                      {(!mfaRequired || factors.length > 1) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => unenrollFactor(factor.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add MFA Button */}
            {!hasActiveMFA && (
              <Button onClick={() => navigate("/mfa/enroll")} className="w-full">
                <Shield className="mr-2 h-4 w-4" />
                Set Up Two-Factor Authentication
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Session Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Session Security</CardTitle>
            <CardDescription>
              Your session will automatically expire after 15 minutes of inactivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inactivity Timeout</span>
                <span className="font-medium">15 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Screen Privacy</span>
                <span className="font-medium">
                  {isStaffUser ? "Enabled (blur on focus loss)" : "Disabled"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Type</span>
                <span className="font-medium capitalize">
                  {roles.join(", ") || "No role assigned"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
