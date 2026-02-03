import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Appointment {
  id: string;
  patient_id: string;
  provider_id: string;
  start_time: string;
  appointment_type: string;
  visit_reason: string | null;
  is_telehealth: boolean;
  telehealth_link: string | null;
  patients: {
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
  };
  providers: {
    first_name: string;
    last_name: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { action, appointment_id, hours_before = 24 } = await req.json();

    if (action === "send_single" && appointment_id) {
      // Send reminder for a single appointment
      const { data: appointment, error } = await supabase
        .from("appointments")
        .select(`
          *,
          patients(first_name, last_name, email, phone),
          providers(first_name, last_name)
        `)
        .eq("id", appointment_id)
        .single();

      if (error || !appointment) {
        return new Response(
          JSON.stringify({ error: "Appointment not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await sendReminder(appointment as unknown as Appointment, resendApiKey);
      
      // Update reminder_sent_at
      await supabase
        .from("appointments")
        .update({ 
          reminder_sent_at: new Date().toISOString(),
          reminder_type: "email"
        })
        .eq("id", appointment_id);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (action === "send_batch") {
      // Send reminders for all appointments within the specified time window
      const now = new Date();
      const reminderWindow = new Date(now.getTime() + hours_before * 60 * 60 * 1000);

      const { data: appointments, error } = await supabase
        .from("appointments")
        .select(`
          *,
          patients(first_name, last_name, email, phone),
          providers(first_name, last_name)
        `)
        .eq("status", "scheduled")
        .is("reminder_sent_at", null)
        .gte("start_time", now.toISOString())
        .lte("start_time", reminderWindow.toISOString());

      if (error) {
        throw error;
      }

      const results = [];
      for (const appointment of (appointments || []) as unknown as Appointment[]) {
        if (appointment.patients?.email) {
          const result = await sendReminder(appointment, resendApiKey);
          results.push(result);

          // Update reminder_sent_at
          await supabase
            .from("appointments")
            .update({ 
              reminder_sent_at: new Date().toISOString(),
              reminder_type: "email"
            })
            .eq("id", appointment.id);
        }
      }

      return new Response(
        JSON.stringify({ sent: results.length, results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action. Use 'send_single' or 'send_batch'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Appointment reminder error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send reminder" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function sendReminder(appointment: Appointment, apiKey: string) {
  const patientEmail = appointment.patients?.email;
  if (!patientEmail) {
    return { success: false, appointment_id: appointment.id, error: "No patient email" };
  }

  const appointmentDate = new Date(appointment.start_time);
  const formattedDate = appointmentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const providerName = `Dr. ${appointment.providers?.last_name}`;
  const patientName = `${appointment.patients?.first_name} ${appointment.patients?.last_name}`;

  const telehealthInfo = appointment.is_telehealth && appointment.telehealth_link
    ? `<p><strong>This is a telehealth appointment.</strong></p>
       <p>Join your video visit: <a href="${appointment.telehealth_link}">${appointment.telehealth_link}</a></p>`
    : "";

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Appointment Reminder</h2>
      <p>Dear ${patientName},</p>
      <p>This is a reminder for your upcoming appointment:</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${formattedTime}</p>
        <p><strong>Provider:</strong> ${providerName}</p>
        <p><strong>Type:</strong> ${appointment.appointment_type}</p>
        ${appointment.visit_reason ? `<p><strong>Reason:</strong> ${appointment.visit_reason}</p>` : ""}
        ${telehealthInfo}
      </div>
      <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        This is an automated reminder. Please do not reply to this email.
      </p>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Appointments <noreply@resend.dev>",
        to: [patientEmail],
        subject: `Appointment Reminder: ${formattedDate} at ${formattedTime}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resend API error:", errorText);
      return { success: false, appointment_id: appointment.id, error: errorText };
    }

    const result = await response.json();
    return { success: true, appointment_id: appointment.id, email_id: result.id };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, appointment_id: appointment.id, error: String(error) };
  }
}
