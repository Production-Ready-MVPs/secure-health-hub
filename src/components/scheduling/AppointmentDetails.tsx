import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import {
  Clock,
  User,
  Video,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

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

const statusOptions = [
  { value: "scheduled", label: "Scheduled", icon: Clock },
  { value: "confirmed", label: "Confirmed", icon: CheckCircle },
  { value: "checked_in", label: "Checked In", icon: CheckCircle },
  { value: "in_progress", label: "In Progress", icon: Clock },
  { value: "completed", label: "Completed", icon: CheckCircle },
  { value: "cancelled", label: "Cancelled", icon: XCircle },
  { value: "no_show", label: "No Show", icon: AlertTriangle },
];

interface AppointmentDetailsProps {
  appointment: Appointment;
  onUpdate: () => void;
  onClose: () => void;
}

export function AppointmentDetails({ appointment, onUpdate, onClose }: AppointmentDetailsProps) {
  const [status, setStatus] = useState(appointment.status);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showNoShowDialog, setShowNoShowDialog] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === "cancelled") {
      setShowCancelDialog(true);
      return;
    }
    if (newStatus === "no_show") {
      setShowNoShowDialog(true);
      return;
    }

    await updateStatus(newStatus);
  };

  const updateStatus = async (newStatus: string, reason?: string) => {
    setUpdating(true);
    try {
      const updateData: Record<string, any> = { status: newStatus };

      if (newStatus === "checked_in") {
        updateData.check_in_time = new Date().toISOString();
      } else if (newStatus === "completed") {
        updateData.check_out_time = new Date().toISOString();
      } else if (newStatus === "cancelled") {
        updateData.cancelled_at = new Date().toISOString();
        updateData.cancellation_reason = reason;
      }

      const { error } = await supabase
        .from("appointments")
        .update(updateData)
        .eq("id", appointment.id);

      if (error) throw error;

      setStatus(newStatus);
      toast.success(`Appointment marked as ${newStatus.replace("_", " ")}`);
      onUpdate();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update appointment");
    } finally {
      setUpdating(false);
    }
  };

  const sendReminder = async () => {
    setSendingReminder(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/appointment-reminder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            action: "send_single",
            appointment_id: appointment.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send reminder");
      }

      const result = await response.json();
      if (result.success) {
        toast.success("Reminder sent successfully");
        onUpdate();
      } else {
        toast.error(result.error || "Failed to send reminder");
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error("Failed to send reminder");
    } finally {
      setSendingReminder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Info */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold">
            {appointment.patients?.last_name}, {appointment.patients?.first_name}
          </h3>
          <p className="text-sm text-muted-foreground">MRN: {appointment.patients?.mrn}</p>
        </div>
        <Badge
          variant={
            status === "completed"
              ? "default"
              : status === "cancelled" || status === "no_show"
              ? "destructive"
              : "secondary"
          }
          className="capitalize"
        >
          {status.replace("_", " ")}
        </Badge>
      </div>

      <Separator />

      {/* Appointment Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(new Date(appointment.start_time), "EEEE, MMMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(new Date(appointment.start_time), "h:mm a")} -{" "}
              {format(new Date(appointment.end_time), "h:mm a")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Dr. {appointment.providers?.last_name}</span>
          </div>
        </div>
        <div className="space-y-3">
          {appointment.is_telehealth ? (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Video className="h-4 w-4" />
              <span>Telehealth Visit</span>
            </div>
          ) : appointment.room ? (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.room}</span>
            </div>
          ) : null}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium capitalize">
              {appointment.appointment_type.replace("_", " ")}
            </span>
          </div>
          {appointment.reminder_sent_at && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Mail className="h-4 w-4" />
              <span>Reminder sent {format(new Date(appointment.reminder_sent_at), "MMM d")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Visit Reason */}
      {appointment.visit_reason && (
        <div>
          <Label className="text-muted-foreground">Visit Reason</Label>
          <p className="mt-1">{appointment.visit_reason}</p>
        </div>
      )}

      {/* Notes */}
      {appointment.notes && (
        <div>
          <Label className="text-muted-foreground">Notes</Label>
          <p className="mt-1 text-sm bg-muted/50 p-3 rounded-md">{appointment.notes}</p>
        </div>
      )}

      {/* Check-in/out times */}
      {(appointment.check_in_time || appointment.check_out_time) && (
        <div className="bg-muted/50 p-3 rounded-md space-y-1">
          {appointment.check_in_time && (
            <p className="text-sm">
              <span className="text-muted-foreground">Checked in:</span>{" "}
              {format(new Date(appointment.check_in_time), "h:mm a")}
            </p>
          )}
          {appointment.check_out_time && (
            <p className="text-sm">
              <span className="text-muted-foreground">Checked out:</span>{" "}
              {format(new Date(appointment.check_out_time), "h:mm a")}
            </p>
          )}
        </div>
      )}

      {/* Cancellation reason */}
      {appointment.cancellation_reason && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-md">
          <div className="flex items-start gap-2">
            <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Cancellation Reason</p>
              <p className="text-sm text-red-700">{appointment.cancellation_reason}</p>
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Status Update */}
      {status !== "completed" && status !== "cancelled" && (
        <div className="space-y-3">
          <Label>Update Status</Label>
          <Select value={status} onValueChange={handleStatusChange} disabled={updating}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={sendReminder}
          disabled={sendingReminder || status === "cancelled" || status === "completed"}
        >
          {sendingReminder ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Send Reminder
        </Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for cancelling this appointment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Cancellation reason..."
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => updateStatus("cancelled", cancellationReason)}
              disabled={!cancellationReason}
            >
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* No Show Dialog */}
      <AlertDialog open={showNoShowDialog} onOpenChange={setShowNoShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as No-Show</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this appointment as a no-show? This will be recorded
              in the patient's history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction onClick={() => updateStatus("no_show")}>
              Confirm No-Show
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
