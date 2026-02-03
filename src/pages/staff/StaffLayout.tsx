import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScreenPrivacy } from "@/components/security/ScreenPrivacy";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import {
  Users,
  Calendar,
  FileText,
  Shield,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  Settings,
  ShieldAlert,
} from "lucide-react";

const navItems = [
  { href: "/staff", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "provider", "compliance_officer"] },
  { href: "/staff/patients", label: "Patients", icon: Users, roles: ["admin", "provider"] },
  { href: "/staff/encounters", label: "Encounters", icon: Calendar, roles: ["admin", "provider"] },
  { href: "/staff/audit-logs", label: "Audit Logs", icon: FileText, roles: ["admin", "compliance_officer"] },
  { href: "/staff/compliance", label: "Compliance", icon: ClipboardList, roles: ["admin", "compliance_officer"] },
  { href: "/staff/admin", label: "Admin", icon: Shield, roles: ["admin"] },
  { href: "/staff/security", label: "Security", icon: Settings, roles: ["admin", "provider", "compliance_officer"] },
];

export default function StaffLayout() {
  const { user, roles, signOut, hasRole, mfaEnabled } = useAuth();
  const location = useLocation();

  // Enable session timeout for staff users
  useSessionTimeout();

  const visibleNavItems = navItems.filter((item) =>
    item.roles.some((role) => hasRole(role as any))
  );

  return (
    <ScreenPrivacy enabled={true}>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card flex flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <Shield className="h-6 w-6 text-primary mr-2" />
            <span className="font-semibold">EHR Staff Portal</span>
          </div>
          
          {/* MFA Warning */}
          {!mfaEnabled && (
            <Link to="/staff/security" className="mx-4 mt-4">
              <div className="flex items-center gap-2 p-2 bg-destructive/10 text-destructive rounded-md text-xs">
                <ShieldAlert className="h-4 w-4" />
                <span>MFA Required</span>
              </div>
            </Link>
          )}

          <nav className="p-4 space-y-1 flex-1">
            {visibleNavItems.map((item) => (
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

          <div className="p-4 border-t">
            <div className="text-sm text-muted-foreground mb-2 truncate">
              {user?.email}
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {roles.map((role) => (
                <span key={role} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                  {role}
                </span>
              ))}
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
    </ScreenPrivacy>
  );
}
