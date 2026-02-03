import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, Pill, FileText } from "lucide-react";

interface PatientRecord {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  mrn: string;
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [stats, setStats] = useState({ encounters: 0, medications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Get patient record linked to this user
      const { data: patientData } = await supabase
        .from("patients")
        .select("id, first_name, last_name, date_of_birth, mrn")
        .eq("user_id", user?.id)
        .single();

      if (patientData) {
        setPatient(patientData);

        // Get stats
        const [encountersRes, medsRes] = await Promise.all([
          supabase.from("encounters").select("id", { count: "exact", head: true }).eq("patient_id", patientData.id),
          supabase.from("medications").select("id", { count: "exact", head: true }).eq("patient_id", patientData.id).eq("status", "active"),
        ]);

        setStats({
          encounters: encountersRes.count ?? 0,
          medications: medsRes.count ?? 0,
        });
      }
      setLoading(false);
    }
    if (user) fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Patient Record Found</h2>
            <p className="text-muted-foreground">
              Your account is not linked to a patient record. Please contact the clinic.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome, {patient.first_name}</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Medical Record #</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patient.mrn}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Date of Birth</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patient.date_of_birth}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.encounters}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.medications}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Health Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use the navigation menu to view your visits, medications, and see who has accessed your medical records.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
