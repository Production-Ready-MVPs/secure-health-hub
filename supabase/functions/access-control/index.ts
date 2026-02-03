import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, resource, resource_id, patient_id } = await req.json();

    // Get user roles
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const userRoles = roles?.map((r) => r.role) ?? [];

    // Check permissions based on role and action
    let allowed = false;
    let reason = "";

    // Admin has full access
    if (userRoles.includes("admin")) {
      allowed = true;
      reason = "Admin access";
    }
    // Compliance officer has read access
    else if (userRoles.includes("compliance_officer") && action === "read") {
      allowed = true;
      reason = "Compliance audit access";
    }
    // Provider access - check assignment
    else if (userRoles.includes("provider") && patient_id) {
      const { data: assignment } = await supabase
        .from("patient_provider_assignments")
        .select("id")
        .eq("provider_id", user.id)
        .eq("patient_id", patient_id)
        .is("revoked_at", null)
        .single();

      if (assignment) {
        allowed = true;
        reason = "Assigned provider access";
      }
    }
    // Patient access - own records only
    else if (userRoles.includes("patient") && action === "read") {
      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user.id)
        .eq("id", patient_id)
        .single();

      if (patient) {
        allowed = true;
        reason = "Patient accessing own records";
      }
    }

    // Log the access attempt
    if (patient_id) {
      await supabase.rpc("log_phi_access", {
        _patient_id: patient_id,
        _resource_type: resource,
        _resource_id: resource_id,
        _action: allowed ? action : `DENIED:${action}`,
        _access_reason: reason || "Access denied",
      });
    }

    return new Response(
      JSON.stringify({ allowed, reason, roles: userRoles }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Access control check failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
