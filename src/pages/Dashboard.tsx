import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function Dashboard() {
  const { roles, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Role-based routing
  if (roles.includes("admin")) {
    return <Navigate to="/staff" replace />;
  }
  if (roles.includes("compliance_officer")) {
    return <Navigate to="/staff" replace />;
  }
  if (roles.includes("provider")) {
    return <Navigate to="/staff" replace />;
  }
  if (roles.includes("patient")) {
    return <Navigate to="/patient" replace />;
  }

  // No roles assigned yet
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Access Pending</h1>
        <p className="text-muted-foreground">
          Your account is awaiting role assignment. Please contact an administrator.
        </p>
      </div>
    </div>
  );
}
