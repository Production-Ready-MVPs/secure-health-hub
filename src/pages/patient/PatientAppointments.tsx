import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isPast, isFuture, isToday } from "date-fns";
import { Calendar, Clock, User, Video, MapPin, AlertCircle } from "lucide-react";

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  appointment_type: string;
  status: string;
  is_telehealth: boolean;
  telehealth_link: string | null;
  visit_reason: string | null;
  room: string | null;
  providers: { first_name: string; last_name: string; specialty: string | null } | null;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-orange-100 text-orange-800",
};

export default function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (patient) {
        const { data } = await supabase
          .from("appointments")
          .select(`
            id, start_time, end_time, appointment_type, status,
            is_telehealth, telehealth_link, visit_reason, room,
            providers:provider_id(first_name, last_name, specialty)
          `)
          .eq("patient_id", patient.id)
          .order("start_time", { ascending: false });

        setAppointments((data as unknown as Appointment[]) ?? []);
      }
      setLoading(false);
    }
    if (user) fetchAppointments();
  }, [user]);

  const upcomingAppointments = appointments.filter(
    (apt) => isFuture(new Date(apt.start_time)) || isToday(new Date(apt.start_time))
  ).filter((apt) => apt.status !== "cancelled" && apt.status !== "completed");

  const pastAppointments = appointments.filter(
    (apt) => isPast(new Date(apt.end_time)) || apt.status === "completed" || apt.status === "cancelled"
  );

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const appointmentDate = new Date(appointment.start_time);
    const isUpcoming = isFuture(appointmentDate) || isToday(appointmentDate);

    return (
      <Card className={`mb-4 ${isUpcoming ? "border-primary/50" : ""}`}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              {/* Date & Time */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Calendar className="h-5 w-5 text-primary" />
                  {format(appointmentDate, "EEEE, MMMM d, yyyy")}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {format(appointmentDate, "h:mm a")} - {format(new Date(appointment.end_time), "h:mm a")}
                </div>
              </div>

              {/* Provider */}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>
                  Dr. {appointment.providers?.last_name}, {appointment.providers?.first_name}
                  {appointment.providers?.specialty && (
                    <span className="text-muted-foreground ml-1">
                      ({appointment.providers.specialty})
                    </span>
                  )}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2">
                {appointment.is_telehealth ? (
                  <>
                    <Video className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-600">Telehealth Visit</span>
                    {isUpcoming && appointment.telehealth_link && (
                      <a
                        href={appointment.telehealth_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm ml-2"
                      >
                        Join Video Call
                      </a>
                    )}
                  </>
                ) : appointment.room ? (
                  <>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{appointment.room}</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Location TBD</span>
                  </>
                )}
              </div>

              {/* Visit Reason */}
              {appointment.visit_reason && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Reason:</span> {appointment.visit_reason}
                </div>
              )}
            </div>

            {/* Status & Type Badges */}
            <div className="flex flex-col items-end gap-2">
              <Badge className={statusColors[appointment.status] || "bg-gray-100 text-gray-800"}>
                {appointment.status.replace("_", " ")}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {appointment.appointment_type.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Appointments</h1>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Upcoming Appointments</h3>
                <p className="text-muted-foreground">
                  Contact your healthcare provider to schedule an appointment.
                </p>
              </CardContent>
            </Card>
          ) : (
            upcomingAppointments.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Past Appointments</h3>
                <p className="text-muted-foreground">
                  Your appointment history will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            pastAppointments.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
