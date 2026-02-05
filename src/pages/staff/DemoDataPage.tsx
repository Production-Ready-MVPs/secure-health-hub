import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Database, Users, Stethoscope, Pill, Calendar, Activity, AlertTriangle, FileText, Shield } from "lucide-react";

interface DataCounts {
  patients: number;
  providers: number;
  encounters: number;
  allergies: number;
  vital_signs: number;
  prescriptions: number;
  appointments: number;
  lab_orders: number;
  clinical_notes: number;
  audit_logs: number;
  break_glass_logs: number;
}

export default function DemoDataPage() {
  const [counts, setCounts] = useState<DataCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [
          patientsRes, providersRes, encountersRes, allergiesRes, vitalsRes,
          prescriptionsRes, appointmentsRes, labOrdersRes, clinicalNotesRes,
          auditLogsRes, breakGlassRes,
        ] = await Promise.all([
          supabase.from("patients").select("id", { count: "exact", head: true }).is("deleted_at", null),
          supabase.from("providers").select("id", { count: "exact", head: true }),
          supabase.from("encounters").select("id", { count: "exact", head: true }),
          supabase.from("allergies").select("id", { count: "exact", head: true }),
          supabase.from("vital_signs").select("id", { count: "exact", head: true }),
          supabase.from("prescriptions").select("id", { count: "exact", head: true }),
          supabase.from("appointments").select("id", { count: "exact", head: true }),
          supabase.from("lab_orders").select("id", { count: "exact", head: true }),
          supabase.from("clinical_notes").select("id", { count: "exact", head: true }),
          supabase.from("phi_access_logs").select("id", { count: "exact", head: true }),
          supabase.from("break_glass_logs").select("id", { count: "exact", head: true }),
        ]);

        setCounts({
          patients: patientsRes.count ?? 0,
          providers: providersRes.count ?? 0,
          encounters: encountersRes.count ?? 0,
          allergies: allergiesRes.count ?? 0,
          vital_signs: vitalsRes.count ?? 0,
          prescriptions: prescriptionsRes.count ?? 0,
          appointments: appointmentsRes.count ?? 0,
          lab_orders: labOrdersRes.count ?? 0,
          clinical_notes: clinicalNotesRes.count ?? 0,
          audit_logs: auditLogsRes.count ?? 0,
          break_glass_logs: breakGlassRes.count ?? 0,
        });
      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCounts();
  }, []);

  const dataItems = [
    { label: "Patients", count: counts?.patients ?? 0, icon: Users },
    { label: "Providers", count: counts?.providers ?? 0, icon: Stethoscope },
    { label: "Encounters", count: counts?.encounters ?? 0, icon: FileText },
    { label: "Allergies", count: counts?.allergies ?? 0, icon: AlertTriangle },
    { label: "Vital Signs", count: counts?.vital_signs ?? 0, icon: Activity },
    { label: "Prescriptions", count: counts?.prescriptions ?? 0, icon: Pill },
    { label: "Appointments", count: counts?.appointments ?? 0, icon: Calendar },
    { label: "Lab Orders", count: counts?.lab_orders ?? 0, icon: Database },
    { label: "Clinical Notes", count: counts?.clinical_notes ?? 0, icon: FileText },
    { label: "Audit Logs", count: counts?.audit_logs ?? 0, icon: Shield },
    { label: "Break Glass Logs", count: counts?.break_glass_logs ?? 0, icon: AlertTriangle },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Demo Data Status</h1>
        <p className="text-muted-foreground">View the current state of demo data in the system</p>
      </div>

      <Card className="border-primary/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold text-lg">Demo Data Loaded</h3>
              <p className="text-muted-foreground">The system has been populated with comprehensive demo data.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        ) : (
          dataItems.map((item) => (
            <Card key={item.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{item.count.toLocaleString()}</div>
                <Badge variant={item.count > 0 ? "default" : "secondary"} className="mt-2">
                  {item.count > 0 ? "Populated" : "Empty"}
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Credentials</CardTitle>
          <CardDescription>Password for all accounts: DemoPass123!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 rounded-lg border">
              <Badge className="mb-2">Provider</Badge>
              <p className="font-mono text-sm">dr.chen@demo-ehr.com</p>
            </div>
            <div className="p-4 rounded-lg border">
              <Badge className="mb-2">Provider</Badge>
              <p className="font-mono text-sm">dr.rodriguez@demo-ehr.com</p>
            </div>
            <div className="p-4 rounded-lg border">
              <Badge variant="destructive" className="mb-2">Admin</Badge>
              <p className="font-mono text-sm">admin@demo-ehr.com</p>
            </div>
            <div className="p-4 rounded-lg border">
              <Badge variant="secondary" className="mb-2">Compliance</Badge>
              <p className="font-mono text-sm">compliance@demo-ehr.com</p>
            </div>
            <div className="p-4 rounded-lg border">
              <Badge variant="outline" className="mb-2">Patient</Badge>
              <p className="font-mono text-sm">patient1@demo-ehr.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
