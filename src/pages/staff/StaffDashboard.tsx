import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users, Calendar, FileText, AlertTriangle, Activity, Pill, Stethoscope,
  TrendingUp, TrendingDown, Clock, Shield, ArrowRight, CheckCircle2,
  FlaskConical, Heart, BarChart3, Bell, UserPlus, ClipboardList
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

// Mock chart data (replace with real queries as needed)
const encounterTrend = [
  { name: "Mon", visits: 12 }, { name: "Tue", visits: 19 }, { name: "Wed", visits: 15 },
  { name: "Thu", visits: 22 }, { name: "Fri", visits: 18 }, { name: "Sat", visits: 8 }, { name: "Sun", visits: 5 },
];
const appointmentTypes = [
  { name: "Check-up", value: 35 }, { name: "Follow-up", value: 28 },
  { name: "Emergency", value: 12 }, { name: "Telehealth", value: 25 },
];
const monthlyPatients = [
  { month: "Jan", new: 24, returning: 45 }, { month: "Feb", new: 18, returning: 52 },
  { month: "Mar", new: 32, returning: 48 }, { month: "Apr", new: 28, returning: 55 },
  { month: "May", new: 35, returning: 60 }, { month: "Jun", new: 42, returning: 58 },
];
const PIE_COLORS = ["#2563EB", "#3B82F6", "#60A5FA", "#93C5FD"];

const recentActivity = [
  { id: 1, action: "New patient registered", name: "Sarah Johnson", time: "2 min ago", icon: UserPlus, color: "text-emerald-500" },
  { id: 2, action: "Encounter completed", name: "Dr. Smith → James Wilson", time: "15 min ago", icon: Stethoscope, color: "text-blue-500" },
  { id: 3, action: "Lab results received", name: "Emily Davis — CBC Panel", time: "32 min ago", icon: FlaskConical, color: "text-amber-500" },
  { id: 4, action: "Prescription issued", name: "Dr. Patel → Mark Brown", time: "1 hr ago", icon: Pill, color: "text-purple-500" },
  { id: 5, action: "Appointment scheduled", name: "Lisa Chen — Follow-up", time: "2 hr ago", icon: Calendar, color: "text-cyan-500" },
];

const upcomingAppts = [
  { id: 1, patient: "Sarah Johnson", type: "Annual Check-up", time: "9:00 AM", status: "Confirmed" },
  { id: 2, patient: "James Wilson", type: "Follow-up", time: "10:30 AM", status: "Checked In" },
  { id: 3, patient: "Emily Davis", type: "Lab Review", time: "11:15 AM", status: "Pending" },
  { id: 4, patient: "Mark Brown", type: "Telehealth", time: "1:00 PM", status: "Confirmed" },
  { id: 5, patient: "Lisa Chen", type: "Consultation", time: "2:30 PM", status: "Pending" },
];

function StatCard({ title, value, icon: Icon, trend, trendValue, subtitle, iconBg }: any) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {(trend || subtitle) && (
              <div className="flex items-center gap-1.5 pt-1">
                {trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
                {trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
                <span className={`text-xs font-medium ${trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"}`}>
                  {trendValue || subtitle}
                </span>
              </div>
            )}
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${iconBg || "bg-primary/10"}`}>
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StaffDashboard() {
  const { hasRole, user } = useAuth();
  const [stats, setStats] = useState({ patients: 0, encounters: 0, pendingReviews: 0, appointments: 0, medications: 0, labOrders: 0, providers: 0, allergies: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [patientsRes, encountersRes, breakGlassRes, apptsRes, medsRes, labsRes, providersRes, allergiesRes] = await Promise.all([
        supabase.from("patients").select("id", { count: "exact", head: true }),
        supabase.from("encounters").select("id", { count: "exact", head: true }),
        supabase.from("break_glass_logs").select("id", { count: "exact", head: true }).is("reviewed_at", null),
        supabase.from("appointments").select("id", { count: "exact", head: true }),
        supabase.from("medications").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("lab_orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("providers").select("id", { count: "exact", head: true }),
        supabase.from("allergies").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        patients: patientsRes.count ?? 0, encounters: encountersRes.count ?? 0,
        pendingReviews: breakGlassRes.count ?? 0, appointments: apptsRes.count ?? 0,
        medications: medsRes.count ?? 0, labOrders: labsRes.count ?? 0,
        providers: providersRes.count ?? 0, allergies: allergiesRes.count ?? 0,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-muted/20 min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{greeting()}</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's an overview of your healthcare facility today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Bell className="h-4 w-4" /> <span className="hidden sm:inline">Notifications</span>
            <span className="ml-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-medium">3</span>
          </Button>
          <Link to="/staff/patients">
            <Button size="sm" className="gap-2 bg-[#2563EB] hover:bg-blue-700">
              <UserPlus className="h-4 w-4" /> Add Patient
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Patients" value={stats.patients} icon={Users} trend="up" trendValue="+12% this month" iconBg="bg-blue-50" />
        <StatCard title="Encounters" value={stats.encounters} icon={Stethoscope} trend="up" trendValue="+8% this week" iconBg="bg-emerald-50" />
        <StatCard title="Active Medications" value={stats.medications} icon={Pill} subtitle={`${stats.allergies} allergies flagged`} iconBg="bg-purple-50" />
        <StatCard title="Pending Labs" value={stats.labOrders} icon={FlaskConical} trend={stats.labOrders > 5 ? "up" : "down"} trendValue={stats.labOrders > 5 ? "Needs attention" : "On track"} iconBg="bg-amber-50" />
      </div>

      {/* Compliance + Reviews Alert */}
      {hasRole("compliance_officer") && stats.pendingReviews > 0 && (
        <Card className="border-amber-300/60 bg-amber-50/50">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Break-Glass Access Reviews Pending</p>
                <p className="text-xs text-muted-foreground">{stats.pendingReviews} emergency access event{stats.pendingReviews !== 1 ? "s" : ""} require your review.</p>
              </div>
            </div>
            <Link to="/staff/compliance">
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                Review Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Encounter Trends */}
        <Card className="lg:col-span-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Patient Encounters</CardTitle>
                <CardDescription>Daily visit trends this week</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
                <TrendingUp className="h-3 w-3" /> +14.2%
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={encounterTrend}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }} />
                <Area type="monotone" dataKey="visits" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVisits)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Appointment Types Pie */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Appointment Types</CardTitle>
            <CardDescription>Distribution this month</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="w-full flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={appointmentTypes} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {appointmentTypes.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-2">
                {appointmentTypes.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="text-xs text-muted-foreground">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Patients Bar Chart + Upcoming Appointments */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Patient Volume</CardTitle>
            <CardDescription>New vs Returning — Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyPatients} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }} />
                <Bar dataKey="new" fill="#2563EB" radius={[4, 4, 0, 0]} name="New" />
                <Bar dataKey="returning" fill="#93C5FD" radius={[4, 4, 0, 0]} name="Returning" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Today's Schedule</CardTitle>
                <CardDescription>{upcomingAppts.length} appointments</CardDescription>
              </div>
              <Link to="/staff/appointments">
                <Button variant="ghost" size="sm" className="text-xs">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingAppts.map((appt) => (
              <div key={appt.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-xs font-semibold text-[#2563EB] shrink-0">
                  {appt.patient.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{appt.patient}</p>
                  <p className="text-xs text-muted-foreground">{appt.type} • {appt.time}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  appt.status === "Checked In" ? "bg-emerald-100 text-emerald-700" :
                  appt.status === "Confirmed" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                }`}>{appt.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Recent Activity + Quick Actions + System Health */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Latest actions across the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className={`mt-0.5 h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0`}>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground/70">{item.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Navigate to key areas</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {[
              { label: "Patients", icon: Users, href: "/staff/patients", color: "text-blue-600 bg-blue-50" },
              { label: "Encounters", icon: Stethoscope, href: "/staff/encounters", color: "text-emerald-600 bg-emerald-50" },
              { label: "Prescriptions", icon: Pill, href: "/staff/prescriptions", color: "text-purple-600 bg-purple-50" },
              { label: "Vital Signs", icon: Activity, href: "/staff/vital-signs", color: "text-rose-600 bg-rose-50" },
              { label: "Audit Logs", icon: FileText, href: "/staff/audit-logs", color: "text-amber-600 bg-amber-50" },
              { label: "Compliance", icon: ClipboardList, href: "/staff/compliance", color: "text-cyan-600 bg-cyan-50" },
            ].map((action) => (
              <Link key={action.label} to={action.href}>
                <div className="flex flex-col items-center gap-2 p-3 rounded-xl border hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${action.color}`}>
                    <action.icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">System Health</CardTitle>
            <CardDescription>Infrastructure status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Database Uptime", value: 99.9, status: "Operational" },
              { label: "API Response Time", value: 95, status: "42ms avg" },
              { label: "Storage Used", value: 68, status: "6.8 / 10 GB" },
              { label: "HIPAA Compliance", value: 100, status: "Fully Compliant" },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.status}</span>
                </div>
                <Progress value={item.value} className="h-1.5" />
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-600">All systems operational</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Appointments" value={stats.appointments} icon={Calendar} subtitle="Total scheduled" iconBg="bg-cyan-50" />
        <StatCard title="Providers" value={stats.providers} icon={Heart} subtitle="Active staff" iconBg="bg-rose-50" />
        <StatCard title="Allergies Flagged" value={stats.allergies} icon={AlertTriangle} subtitle="Across all patients" iconBg="bg-orange-50" />
        <StatCard title="Pending Reviews" value={stats.pendingReviews} icon={Shield} trend={stats.pendingReviews > 0 ? "up" : "down"} trendValue={stats.pendingReviews > 0 ? "Action needed" : "All clear"} iconBg="bg-violet-50" />
      </div>
    </div>
  );
}
