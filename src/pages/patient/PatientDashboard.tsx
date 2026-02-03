import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Calendar, Pill, FileText, FlaskConical, Stethoscope, ArrowRight } from "lucide-react";
import { format, isFuture, isToday } from "date-fns";

interface PatientRecord {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  mrn: string;
}

interface UpcomingAppointment {
  id: string;
  start_time: string;
  appointment_type: string;
  providers: { first_name: string; last_name: string } | null;
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [stats, setStats] = useState({ encounters: 0, medications: 0, pendingLabs: 0, upcomingAppts: 0 });
  const [nextAppointment, setNextAppointment] = useState<UpcomingAppointment | null>(null);
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
        const now = new Date().toISOString();
        const [encountersRes, medsRes, labsRes, apptsRes, nextApptRes] = await Promise.all([
          supabase.from("encounters").select("id", { count: "exact", head: true }).eq("patient_id", patientData.id),
          supabase.from("medications").select("id", { count: "exact", head: true }).eq("patient_id", patientData.id).eq("status", "active"),
          supabase.from("lab_orders").select("id", { count: "exact", head: true }).eq("patient_id", patientData.id).eq("status", "pending"),
          supabase.from("appointments").select("id", { count: "exact", head: true }).eq("patient_id", patientData.id).gte("start_time", now).neq("status", "cancelled"),
          supabase.from("appointments").select("id, start_time, appointment_type, providers:provider_id(first_name, last_name)")
            .eq("patient_id", patientData.id)
            .gte("start_time", now)
            .neq("status", "cancelled")
            .order("start_time")
            .limit(1)
            .single(),
        ]);

        setStats({
          encounters: encountersRes.count ?? 0,
          medications: medsRes.count ?? 0,
          pendingLabs: labsRes.count ?? 0,
          upcomingAppts: apptsRes.count ?? 0,
        });

        if (nextApptRes.data) {
          setNextAppointment(nextApptRes.data as unknown as UpcomingAppointment);
        }
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

      {/* Next Appointment Banner */}
      {nextAppointment && (
        <Card className="mb-6 border-primary/50 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Your next appointment</p>
                  <p className="font-semibold">
                    {format(new Date(nextAppointment.start_time), "EEEE, MMMM d 'at' h:mm a")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    with Dr. {nextAppointment.providers?.last_name} • {nextAppointment.appointment_type.replace("_", " ")}
                  </p>
                </div>
              </div>
              <Link to="/patient/appointments">
                <Button variant="outline" size="sm">
                  View Details <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
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
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingAppts}</div>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Lab Orders</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingLabs}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/patient/appointments">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="py-6 flex items-center gap-4">
              <Calendar className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold">Appointments</h3>
                <p className="text-sm text-muted-foreground">View and manage your appointments</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/patient/medications">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="py-6 flex items-center gap-4">
              <Pill className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold">Medications</h3>
                <p className="text-sm text-muted-foreground">View your current medications</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/patient/lab-results">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="py-6 flex items-center gap-4">
              <FlaskConical className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold">Lab Results</h3>
                <p className="text-sm text-muted-foreground">View your lab orders and results</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/patient/encounters">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="py-6 flex items-center gap-4">
              <Stethoscope className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold">Visit History</h3>
                <p className="text-sm text-muted-foreground">Review your past visits</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/patient/access-logs">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="py-6 flex items-center gap-4">
              <FileText className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold">Access Logs</h3>
                <p className="text-sm text-muted-foreground">See who viewed your records</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
