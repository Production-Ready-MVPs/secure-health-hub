import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { Calendar as CalendarIcon, Plus, Video, MapPin, Clock, User } from "lucide-react";
import { AppointmentForm } from "./AppointmentForm";
import { AppointmentDetails } from "./AppointmentDetails";

interface Appointment {
  id: string;
  patient_id: string;
  provider_id: string;
  start_time: string;
  end_time: string;
  appointment_type: string;
  status: string;
  is_telehealth: boolean;
  telehealth_link: string | null;
  visit_reason: string | null;
  room: string | null;
  notes: string | null;
  reminder_sent_at: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  cancellation_reason: string | null;
  patients: { first_name: string; last_name: string; mrn: string } | null;
  providers: { first_name: string; last_name: string } | null;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-500",
  confirmed: "bg-green-500",
  checked_in: "bg-purple-500",
  in_progress: "bg-yellow-500",
  completed: "bg-gray-500",
  cancelled: "bg-red-500",
  no_show: "bg-orange-500",
};

export function AppointmentCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    setLoading(true);
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        patients(first_name, last_name, mrn),
        providers(first_name, last_name)
      `)
      .gte("start_time", monthStart.toISOString())
      .lte("start_time", monthEnd.toISOString())
      .order("start_time", { ascending: true });

    if (!error && data) {
      setAppointments(data as unknown as Appointment[]);
    }
    setLoading(false);
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((apt) => isSameDay(new Date(apt.start_time), date));
  };

  const todayAppointments = getAppointmentsForDate(selectedDate);

  const datesWithAppointments = appointments.reduce((acc, apt) => {
    const dateStr = format(new Date(apt.start_time), "yyyy-MM-dd");
    acc[dateStr] = (acc[dateStr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Section */}
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendar
          </CardTitle>
          <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
              </DialogHeader>
              <AppointmentForm
                defaultDate={selectedDate}
                onSuccess={() => {
                  setShowNewForm(false);
                  fetchAppointments();
                }}
                onCancel={() => setShowNewForm(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border pointer-events-auto"
            modifiers={{
              hasAppointments: (date) => {
                const dateStr = format(date, "yyyy-MM-dd");
                return !!datesWithAppointments[dateStr];
              },
            }}
            modifiersStyles={{
              hasAppointments: {
                fontWeight: "bold",
                textDecoration: "underline",
              },
            }}
            onMonthChange={setSelectedDate}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1 text-xs">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="capitalize">{status.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">
            Appointments for {format(selectedDate, "MMMM d, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No appointments scheduled for this date
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {todayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedAppointment(apt)}
                  >
                    <div className={`w-1 h-16 rounded-full ${statusColors[apt.status] || "bg-gray-400"}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">
                          {apt.patients?.last_name}, {apt.patients?.first_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          MRN: {apt.patients?.mrn}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(apt.start_time), "h:mm a")} -{" "}
                          {format(new Date(apt.end_time), "h:mm a")}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Dr. {apt.providers?.last_name}
                        </span>
                        {apt.is_telehealth ? (
                          <span className="flex items-center gap-1 text-blue-600">
                            <Video className="h-3 w-3" />
                            Telehealth
                          </span>
                        ) : apt.room ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {apt.room}
                          </span>
                        ) : null}
                      </div>
                      {apt.visit_reason && (
                        <p className="text-sm mt-1 text-muted-foreground truncate">
                          {apt.visit_reason}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {apt.appointment_type.replace("_", " ")}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`capitalize ${apt.status === "no_show" ? "text-orange-600 border-orange-600" : ""}`}
                      >
                        {apt.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Appointment Details Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <AppointmentDetails
              appointment={selectedAppointment}
              onUpdate={() => {
                setSelectedAppointment(null);
                fetchAppointments();
              }}
              onClose={() => setSelectedAppointment(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
