import { AppointmentCalendar } from "@/components/scheduling/AppointmentCalendar";

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <p className="text-muted-foreground">
          Manage patient appointments and scheduling
        </p>
      </div>

      <AppointmentCalendar />
    </div>
  );
}

