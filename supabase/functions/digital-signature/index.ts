import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate SHA-256 hash of content
async function generateContentHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Generate signature hash (content hash + signer ID + timestamp)
async function generateSignatureHash(
  contentHash: string,
  signerId: string,
  timestamp: string
): Promise<string> {
  const signatureData = `${contentHash}|${signerId}|${timestamp}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(signatureData);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

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

    const { note_id, action } = await req.json();

    if (!note_id) {
      return new Response(
        JSON.stringify({ error: "Missing note_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the provider ID for this user
    const { data: provider, error: providerError } = await supabase
      .from("providers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (providerError || !provider) {
      return new Response(
        JSON.stringify({ error: "User is not a provider" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the clinical note
    const { data: note, error: noteError } = await supabase
      .from("clinical_notes")
      .select("*")
      .eq("id", note_id)
      .single();

    if (noteError || !note) {
      return new Response(
        JSON.stringify({ error: "Note not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "sign") {
      // Check if note is already signed
      if (note.is_signed) {
        return new Response(
          JSON.stringify({ error: "Note is already signed" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generate content hash from note content
      const noteContent = JSON.stringify({
        soap_subjective: note.soap_subjective,
        soap_objective: note.soap_objective,
        soap_assessment: note.soap_assessment,
        soap_plan: note.soap_plan,
        content_encrypted: note.content_encrypted,
      });
      
      const contentHash = await generateContentHash(noteContent);
      const timestamp = new Date().toISOString();
      const signatureHash = await generateSignatureHash(contentHash, provider.id, timestamp);

      // Update the clinical note with signature
      const { error: updateError } = await supabase
        .from("clinical_notes")
        .update({
          is_signed: true,
          signed_at: timestamp,
          signed_by: provider.id,
          signature_hash: signatureHash,
          signature_timestamp: timestamp,
        })
        .eq("id", note_id);

      if (updateError) {
        throw updateError;
      }

      // Log the signature
      const { error: logError } = await supabase
        .from("signature_log")
        .insert({
          note_id,
          signer_id: provider.id,
          signature_hash: signatureHash,
          content_hash: contentHash,
          signed_at: timestamp,
          signature_method: "SHA-256",
          ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
          user_agent: req.headers.get("user-agent"),
        });

      if (logError) {
        console.error("Failed to log signature:", logError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          signature_hash: signatureHash,
          content_hash: contentHash,
          signed_at: timestamp,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (action === "verify") {
      // Verify the signature
      if (!note.is_signed || !note.signature_hash) {
        return new Response(
          JSON.stringify({ valid: false, reason: "Note is not signed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Regenerate content hash
      const noteContent = JSON.stringify({
        soap_subjective: note.soap_subjective,
        soap_objective: note.soap_objective,
        soap_assessment: note.soap_assessment,
        soap_plan: note.soap_plan,
        content_encrypted: note.content_encrypted,
      });
      
      const currentContentHash = await generateContentHash(noteContent);

      // Get signature log entry
      const { data: sigLog } = await supabase
        .from("signature_log")
        .select("*")
        .eq("note_id", note_id)
        .order("signed_at", { ascending: false })
        .limit(1)
        .single();

      if (!sigLog) {
        return new Response(
          JSON.stringify({ valid: false, reason: "No signature log found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if content has been tampered with
      const contentIntact = currentContentHash === sigLog.content_hash;

      return new Response(
        JSON.stringify({
          valid: contentIntact && sigLog.verification_status === "valid",
          content_intact: contentIntact,
          signature_status: sigLog.verification_status,
          signed_at: sigLog.signed_at,
          signer_id: sigLog.signer_id,
          reason: contentIntact ? null : "Content has been modified since signing",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action. Use 'sign' or 'verify'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Digital signature error:", error);
    return new Response(
      JSON.stringify({ error: "Signature operation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
