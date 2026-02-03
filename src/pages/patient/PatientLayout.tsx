import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  User,
  CalendarDays,
  Pill,
  FileText,
  Shield,
  LogOut,
  LayoutDashboard,
  Stethoscope,
  FlaskConical,
} from "lucide-react";

const navItems = [
  { href: "/patient", label: "My Records", icon: LayoutDashboard },
  { href: "/patient/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/patient/encounters", label: "Visits", icon: Stethoscope },
  { href: "/patient/medications", label: "Medications", icon: Pill },
  { href: "/patient/lab-results", label: "Lab Results", icon: FlaskConical },
  { href: "/patient/access-logs", label: "Who Viewed My Data", icon: FileText },
];

export default function PatientLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <Shield className="h-6 w-6 text-primary mr-2" />
          <span className="font-semibold">Patient Portal</span>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} to={item.href}>
              <Button
                variant={location.pathname === item.href ? "secondary" : "ghost"}
                className={cn("w-full justify-start", location.pathname === item.href && "bg-secondary")}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm truncate">{user?.email}</span>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
