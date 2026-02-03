import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, setHours, setMinutes } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const appointmentTypes = [
  { value: "new_patient", label: "New Patient Visit" },
  { value: "follow_up", label: "Follow-up Visit" },
  { value: "annual_physical", label: "Annual Physical" },
  { value: "sick_visit", label: "Sick Visit" },
  { value: "consultation", label: "Consultation" },
  { value: "procedure", label: "Procedure" },
  { value: "telehealth", label: "Telehealth Visit" },
  { value: "urgent", label: "Urgent Care" },
];

const timeSlots = Array.from({ length: 24 }, (_, hour) =>
  [0, 15, 30, 45].map((minute) => ({
    value: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
    label: format(setMinutes(setHours(new Date(), hour), minute), "h:mm a"),
  }))
).flat();

const durations = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];

const formSchema = z.object({
  patient_id: z.string().min(1, "Patient is required"),
  provider_id: z.string().min(1, "Provider is required"),
  appointment_date: z.date(),
  start_time: z.string().min(1, "Start time is required"),
  duration: z.string().min(1, "Duration is required"),
  appointment_type: z.string().min(1, "Appointment type is required"),
  visit_reason: z.string().optional(),
  room: z.string().optional(),
  is_telehealth: z.boolean().default(false),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  mrn: string;
}

interface Provider {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string | null;
}

interface AppointmentFormProps {
  defaultDate?: Date;
  existingAppointment?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AppointmentForm({
  defaultDate,
  existingAppointment,
  onSuccess,
  onCancel,
}: AppointmentFormProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPatient, setSearchPatient] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patient_id: existingAppointment?.patient_id || "",
      provider_id: existingAppointment?.provider_id || "",
      appointment_date: existingAppointment
        ? new Date(existingAppointment.start_time)
        : defaultDate || new Date(),
      start_time: existingAppointment
        ? format(new Date(existingAppointment.start_time), "HH:mm")
        : "09:00",
      duration: existingAppointment
        ? String(
            Math.round(
              (new Date(existingAppointment.end_time).getTime() -
                new Date(existingAppointment.start_time).getTime()) /
                60000
            )
          )
        : "30",
      appointment_type: existingAppointment?.appointment_type || "",
      visit_reason: existingAppointment?.visit_reason || "",
      room: existingAppointment?.room || "",
      is_telehealth: existingAppointment?.is_telehealth || false,
      notes: existingAppointment?.notes || "",
    },
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (searchPatient.length >= 2) {
      searchPatients();
    }
  }, [searchPatient]);

  const fetchProviders = async () => {
    const { data } = await supabase
      .from("providers")
      .select("id, first_name, last_name, specialty")
      .eq("is_active", true)
      .order("last_name");
    setProviders((data as Provider[]) || []);
  };

  const searchPatients = async () => {
    const { data } = await supabase
      .from("patients")
      .select("id, first_name, last_name, mrn")
      .or(`first_name.ilike.%${searchPatient}%,last_name.ilike.%${searchPatient}%,mrn.ilike.%${searchPatient}%`)
      .is("deleted_at", null)
      .limit(10);
    setPatients((data as Patient[]) || []);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      const [hours, minutes] = data.start_time.split(":").map(Number);
      const startDate = setMinutes(setHours(data.appointment_date, hours), minutes);
      const endDate = new Date(startDate.getTime() + parseInt(data.duration) * 60000);

      const appointmentData = {
        patient_id: data.patient_id,
        provider_id: data.provider_id,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        appointment_type: data.appointment_type,
        visit_reason: data.visit_reason || null,
        room: data.is_telehealth ? null : data.room || null,
        is_telehealth: data.is_telehealth,
        notes: data.notes || null,
        status: "scheduled",
      };

      if (existingAppointment) {
        const { error } = await supabase
          .from("appointments")
          .update(appointmentData)
          .eq("id", existingAppointment.id);

        if (error) throw error;
        toast.success("Appointment updated successfully");
      } else {
        const { error } = await supabase.from("appointments").insert(appointmentData);

        if (error) throw error;
        toast.success("Appointment scheduled successfully");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast.error("Failed to save appointment");
    } finally {
      setLoading(false);
    }
  };

  const isTelehealth = form.watch("is_telehealth");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Patient Search */}
          <FormField
            control={form.control}
            name="patient_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient *</FormLabel>
                <div className="space-y-2">
                  <Input
                    placeholder="Search by name or MRN..."
                    value={searchPatient}
                    onChange={(e) => setSearchPatient(e.target.value)}
                  />
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.last_name}, {patient.first_name} (MRN: {patient.mrn})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Provider */}
          <FormField
            control={form.control}
            name="provider_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        Dr. {provider.last_name}, {provider.first_name}
                        {provider.specialty && ` (${provider.specialty})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Date */}
          <FormField
            control={form.control}
            name="appointment_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? format(field.value, "PPP") : "Pick a date"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Time */}
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-60">
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Duration */}
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {durations.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Appointment Type */}
          <FormField
            control={form.control}
            name="appointment_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Appointment Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Room (if not telehealth) */}
          {!isTelehealth && (
            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Room 101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Telehealth Toggle */}
        <FormField
          control={form.control}
          name="is_telehealth"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mt-0">This is a telehealth appointment</FormLabel>
            </FormItem>
          )}
        />

        {/* Visit Reason */}
        <FormField
          control={form.control}
          name="visit_reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visit Reason</FormLabel>
              <FormControl>
                <Textarea placeholder="Chief complaint or reason for visit..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Internal Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Notes for staff..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {existingAppointment ? "Update Appointment" : "Schedule Appointment"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
