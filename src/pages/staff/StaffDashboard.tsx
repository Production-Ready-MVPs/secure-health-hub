import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, FileText, AlertTriangle, Activity, Pill, Stethoscope, TrendingUp, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

interface EncountersByType {
  type: string;
  count: number;
}

interface EncountersByDate {
  date: string;
  count: number;
}

interface PatientsByAge {
  range: string;
  count: number;
}

interface VitalTrend {
  date: string;
  avgBpSystolic: number;
  avgBpDiastolic: number;
  avgHeartRate: number;
}

interface RecentEncounter {
  id: string;
  encounter_date: string;
  encounter_type: string;
  status: string;
  chief_complaint: string | null;
  patients: { first_name: string; last_name: string } | null;
}

export default function StaffDashboard() {
  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    patients: 0,
    encounters: 0,
    pendingReviews: 0,
    appointments: 0,
    allergies: 0,
    prescriptions: 0,
  });
  const [encountersByType, setEncountersByType] = useState<EncountersByType[]>([]);
  const [encountersByDate, setEncountersByDate] = useState<EncountersByDate[]>([]);
  const [patientsByAge, setPatientsByAge] = useState<PatientsByAge[]>([]);
  const [vitalTrends, setVitalTrends] = useState<VitalTrend[]>([]);
  const [recentEncounters, setRecentEncounters] = useState<RecentEncounter[]>([]);
  const [prescriptionsByStatus, setPrescriptionsByStatus] = useState<{status: string; count: number}[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch basic counts
        const [patientsRes, encountersRes, breakGlassRes, appointmentsRes, allergiesRes, prescriptionsRes] = await Promise.all([
          supabase.from("patients").select("id", { count: "exact", head: true }).is("deleted_at", null),
          supabase.from("encounters").select("id", { count: "exact", head: true }),
          supabase.from("break_glass_logs").select("id", { count: "exact", head: true }).is("reviewed_at", null),
          supabase.from("appointments").select("id", { count: "exact", head: true }).gte("start_time", new Date().toISOString()),
          supabase.from("allergies").select("id", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("prescriptions").select("id", { count: "exact", head: true }),
        ]);

        setStats({
          patients: patientsRes.count ?? 0,
          encounters: encountersRes.count ?? 0,
          pendingReviews: breakGlassRes.count ?? 0,
          appointments: appointmentsRes.count ?? 0,
          allergies: allergiesRes.count ?? 0,
          prescriptions: prescriptionsRes.count ?? 0,
        });

        // Fetch encounters by type for pie chart
        const { data: encTypeData } = await supabase
          .from("encounters")
          .select("encounter_type");
        
        if (encTypeData) {
          const typeCounts = encTypeData.reduce((acc: Record<string, number>, enc) => {
            acc[enc.encounter_type] = (acc[enc.encounter_type] || 0) + 1;
            return acc;
          }, {});
          setEncountersByType(
            Object.entries(typeCounts).map(([type, count]) => ({ type, count: count as number }))
          );
        }

        // Fetch encounters by date for line chart (last 30 days)
        const thirtyDaysAgo = subDays(new Date(), 30);
        const { data: encDateData } = await supabase
          .from("encounters")
          .select("encounter_date")
          .gte("encounter_date", thirtyDaysAgo.toISOString());
        
        if (encDateData) {
          const dateCounts: Record<string, number> = {};
          for (let i = 0; i < 30; i++) {
            const date = format(subDays(new Date(), i), "MMM d");
            dateCounts[date] = 0;
          }
          encDateData.forEach((enc) => {
            const date = format(new Date(enc.encounter_date), "MMM d");
            if (dateCounts[date] !== undefined) {
              dateCounts[date]++;
            }
          });
          setEncountersByDate(
            Object.entries(dateCounts)
              .map(([date, count]) => ({ date, count }))
              .reverse()
          );
        }

        // Fetch patients by age group
        const { data: patientAgeData } = await supabase
          .from("patients")
          .select("date_of_birth")
          .is("deleted_at", null);
        
        if (patientAgeData) {
          const ageGroups: Record<string, number> = {
            "0-17": 0,
            "18-34": 0,
            "35-49": 0,
            "50-64": 0,
            "65+": 0,
          };
          patientAgeData.forEach((p) => {
            const age = Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            if (age < 18) ageGroups["0-17"]++;
            else if (age < 35) ageGroups["18-34"]++;
            else if (age < 50) ageGroups["35-49"]++;
            else if (age < 65) ageGroups["50-64"]++;
            else ageGroups["65+"]++;
          });
          setPatientsByAge(
            Object.entries(ageGroups).map(([range, count]) => ({ range, count }))
          );
        }

        // Fetch vital signs trends
        const { data: vitalsData } = await supabase
          .from("vital_signs")
          .select("recorded_at, bp_systolic, bp_diastolic, heart_rate")
          .not("bp_systolic", "is", null)
          .order("recorded_at", { ascending: false })
          .limit(100);
        
        if (vitalsData && vitalsData.length > 0) {
          const vitalsByDate: Record<string, { systolic: number[]; diastolic: number[]; hr: number[] }> = {};
          vitalsData.forEach((v) => {
            const date = format(new Date(v.recorded_at), "MMM d");
            if (!vitalsByDate[date]) {
              vitalsByDate[date] = { systolic: [], diastolic: [], hr: [] };
            }
            if (v.bp_systolic) vitalsByDate[date].systolic.push(v.bp_systolic);
            if (v.bp_diastolic) vitalsByDate[date].diastolic.push(v.bp_diastolic);
            if (v.heart_rate) vitalsByDate[date].hr.push(v.heart_rate);
          });
          const trends = Object.entries(vitalsByDate).map(([date, data]) => ({
            date,
            avgBpSystolic: data.systolic.length ? Math.round(data.systolic.reduce((a, b) => a + b, 0) / data.systolic.length) : 0,
            avgBpDiastolic: data.diastolic.length ? Math.round(data.diastolic.reduce((a, b) => a + b, 0) / data.diastolic.length) : 0,
            avgHeartRate: data.hr.length ? Math.round(data.hr.reduce((a, b) => a + b, 0) / data.hr.length) : 0,
          }));
          setVitalTrends(trends.slice(0, 14).reverse());
        }

        // Fetch recent encounters
        const { data: recentEnc } = await supabase
          .from("encounters")
          .select(`
            id, encounter_date, encounter_type, status, chief_complaint,
            patients(first_name, last_name)
          `)
          .order("encounter_date", { ascending: false })
          .limit(5);
        
        setRecentEncounters((recentEnc as RecentEncounter[]) ?? []);

        // Fetch prescriptions by status
        const { data: rxData } = await supabase
          .from("prescriptions")
          .select("status");
        
        if (rxData) {
          const statusCounts = rxData.reduce((acc: Record<string, number>, rx) => {
            acc[rx.status] = (acc[rx.status] || 0) + 1;
            return acc;
          }, {});
          setPrescriptionsByStatus(
            Object.entries(statusCounts).map(([status, count]) => ({ status, count: count as number }))
          );
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the EHR Staff Portal</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Clock className="h-3 w-3 mr-1" />
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </Badge>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.patients}</div>
            <p className="text-xs text-muted-foreground">Active records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Encounters</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.encounters}</div>
            <p className="text-xs text-muted-foreground">Total visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appointments}</div>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Allergies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.allergies}</div>
            <p className="text-xs text-muted-foreground">Documented</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.prescriptions}</div>
            <p className="text-xs text-muted-foreground">Total orders</p>
          </CardContent>
        </Card>

        {hasRole("compliance_officer") && (
          <Card className="border-yellow-500/50">
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
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Encounters Over Time */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Encounters Over Time
            </CardTitle>
            <CardDescription>Daily encounter volume (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={encountersByDate}>
                  <defs>
                    <linearGradient id="colorEncounters" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorEncounters)" 
                    name="Encounters"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Encounters by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Encounters by Type</CardTitle>
            <CardDescription>Distribution of visit types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={encountersByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="type"
                    label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {encountersByType.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Patients by Age */}
        <Card>
          <CardHeader>
            <CardTitle>Patients by Age Group</CardTitle>
            <CardDescription>Patient demographics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patientsByAge} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis dataKey="range" type="category" tick={{ fontSize: 12 }} className="text-muted-foreground" width={50} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} name="Patients" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Vital Signs Trends */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Vital Signs Trends
            </CardTitle>
            <CardDescription>Average blood pressure and heart rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {vitalTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                    <Line type="monotone" dataKey="avgBpSystolic" stroke="hsl(var(--destructive))" strokeWidth={2} name="Systolic BP" dot={false} />
                    <Line type="monotone" dataKey="avgBpDiastolic" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Diastolic BP" dot={false} />
                    <Line type="monotone" dataKey="avgHeartRate" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Heart Rate" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No vital signs data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Encounters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Encounters
            </CardTitle>
            <CardDescription>Latest patient visits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEncounters.length > 0 ? (
                recentEncounters.map((enc) => (
                  <div key={enc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">
                        {enc.patients?.last_name}, {enc.patients?.first_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {enc.chief_complaint || enc.encounter_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={enc.status === "completed" ? "default" : "secondary"}>
                        {enc.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(enc.encounter_date), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No recent encounters</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Prescription Status
            </CardTitle>
            <CardDescription>Current prescription distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {prescriptionsByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prescriptionsByStatus}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="status" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Prescriptions">
                      {prescriptionsByStatus.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.status === "sent" ? "hsl(var(--chart-2))" :
                            entry.status === "pending" ? "hsl(var(--chart-4))" :
                            entry.status === "cancelled" ? "hsl(var(--destructive))" :
                            "hsl(var(--primary))"
                          } 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No prescription data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks based on your role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            {hasRole("provider") && (
              <>
                <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                  <Users className="h-5 w-5 mb-2 text-primary" />
                  <p className="font-medium">View Patients</p>
                  <p className="text-sm text-muted-foreground">Access patient records</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                  <Stethoscope className="h-5 w-5 mb-2 text-primary" />
                  <p className="font-medium">New Encounter</p>
                  <p className="text-sm text-muted-foreground">Start a new visit</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                  <Pill className="h-5 w-5 mb-2 text-primary" />
                  <p className="font-medium">E-Prescribe</p>
                  <p className="text-sm text-muted-foreground">Write a prescription</p>
                </div>
              </>
            )}
            {hasRole("admin") && (
              <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <Users className="h-5 w-5 mb-2 text-primary" />
                <p className="font-medium">Manage Users</p>
                <p className="text-sm text-muted-foreground">User administration</p>
              </div>
            )}
            {hasRole("compliance_officer") && (
              <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <FileText className="h-5 w-5 mb-2 text-primary" />
                <p className="font-medium">Audit Logs</p>
                <p className="text-sm text-muted-foreground">Review access logs</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
