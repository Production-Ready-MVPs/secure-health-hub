import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText, AlertTriangle } from "lucide-react";

export default function StaffDashboard() {
  const { hasRole } = useAuth();
  const [stats, setStats] = useState({
    patients: 0,
    encounters: 0,
    pendingReviews: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const [patientsRes, encountersRes, breakGlassRes] = await Promise.all([
        supabase.from("patients").select("id", { count: "exact", head: true }),
        supabase.from("encounters").select("id", { count: "exact", head: true }),
        supabase.from("break_glass_logs").select("id", { count: "exact", head: true }).is("reviewed_at", null),
      ]);

      setStats({
        patients: patientsRes.count ?? 0,
        encounters: encountersRes.count ?? 0,
        pendingReviews: breakGlassRes.count ?? 0,
      });
    }
    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.patients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Encounters</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.encounters}</div>
          </CardContent>
        </Card>

        {hasRole("compliance_officer") && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReviews}</div>
              <p className="text-xs text-muted-foreground">Break-glass access</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {hasRole("provider") && "View your assigned patients"}
              {hasRole("admin") && "Manage users and roles"}
              {hasRole("compliance_officer") && "Review audit logs"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
