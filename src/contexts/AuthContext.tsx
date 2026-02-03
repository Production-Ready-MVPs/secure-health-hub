import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface AALInfo {
  currentLevel: string;
  nextLevel: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  mfaEnabled: boolean;
  mfaVerified: boolean;
  currentAAL: AALInfo | null;
  signIn: (email: string, password: string) => Promise<{ requiresMFA: boolean }>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  refreshMFAStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaVerified, setMfaVerified] = useState(false);
  const [currentAAL, setCurrentAAL] = useState<AALInfo | null>(null);

  const fetchRoles = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (data) {
      setRoles(data.map((r) => r.role));
    }
  };

  const checkMFAStatus = async () => {
    try {
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData) {
        setCurrentAAL({ currentLevel: aalData.currentLevel, nextLevel: aalData.nextLevel });
        setMfaVerified(aalData.currentLevel === "aal2");
      }

      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      if (factorsData) {
        const hasVerifiedFactor = factorsData.totp.some((f) => f.status === "verified");
        setMfaEnabled(hasVerifiedFactor);
      }
    } catch (err) {
      console.error("Failed to check MFA status:", err);
    }
  };

  const refreshMFAStatus = async () => {
    await checkMFAStatus();
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(() => fetchRoles(session.user.id), 0);
          setTimeout(() => checkMFAStatus(), 0);
        } else {
          setRoles([]);
          setMfaEnabled(false);
          setMfaVerified(false);
          setCurrentAAL(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRoles(session.user.id);
        checkMFAStatus();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ requiresMFA: boolean }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Check if MFA is required
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    
    if (aalData?.nextLevel === "aal2" && aalData.currentLevel !== "aal2") {
      return { requiresMFA: true };
    }

    return { requiresMFA: false };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        roles,
        loading,
        mfaEnabled,
        mfaVerified,
        currentAAL,
        signIn,
        signUp,
        signOut,
        hasRole,
        refreshMFAStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
