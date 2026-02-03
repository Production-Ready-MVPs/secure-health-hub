import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Public pages
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";

// MFA pages
import MFAEnroll from "@/pages/MFAEnroll";
import MFAVerify from "@/pages/MFAVerify";
import MFASettings from "@/pages/MFASettings";

// Dashboard router
import Dashboard from "@/pages/Dashboard";

// Staff portal
import StaffLayout from "@/pages/staff/StaffLayout";
import StaffDashboard from "@/pages/staff/StaffDashboard";
import PatientsPage from "@/pages/staff/PatientsPage";
import EncountersPage from "@/pages/staff/EncountersPage";
import AuditLogsPage from "@/pages/staff/AuditLogsPage";
import CompliancePage from "@/pages/staff/CompliancePage";
import AdminPage from "@/pages/staff/AdminPage";
import AppointmentsPage from "@/pages/staff/AppointmentsPage";
import AllergiesPage from "@/pages/staff/AllergiesPage";
import VitalSignsPage from "@/pages/staff/VitalSignsPage";
import PrescriptionsPage from "@/pages/staff/PrescriptionsPage";

// Patient portal
import PatientLayout from "@/pages/patient/PatientLayout";
import PatientDashboard from "@/pages/patient/PatientDashboard";
import PatientAppointments from "@/pages/patient/PatientAppointments";
import PatientEncounters from "@/pages/patient/PatientEncounters";
import PatientMedications from "@/pages/patient/PatientMedications";
import PatientLabResults from "@/pages/patient/PatientLabResults";
import PatientAccessLogs from "@/pages/patient/PatientAccessLogs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* MFA routes */}
            <Route
              path="/mfa/enroll"
              element={
                <ProtectedRoute>
                  <MFAEnroll />
                </ProtectedRoute>
              }
            />
            <Route path="/mfa/verify" element={<MFAVerify />} />

            {/* Dashboard router (redirects based on role) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Staff portal */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={["admin", "provider", "compliance_officer"]}>
                  <StaffLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StaffDashboard />} />
              <Route path="patients" element={<PatientsPage />} />
              <Route path="encounters" element={<EncountersPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="allergies" element={<AllergiesPage />} />
              <Route path="vital-signs" element={<VitalSignsPage />} />
              <Route path="prescriptions" element={<PrescriptionsPage />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
              <Route path="compliance" element={<CompliancePage />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="security" element={<MFASettings />} />
            </Route>

            {/* Patient portal */}
            <Route
              path="/patient"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<PatientDashboard />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="encounters" element={<PatientEncounters />} />
              <Route path="medications" element={<PatientMedications />} />
              <Route path="lab-results" element={<PatientLabResults />} />
              <Route path="access-logs" element={<PatientAccessLogs />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
