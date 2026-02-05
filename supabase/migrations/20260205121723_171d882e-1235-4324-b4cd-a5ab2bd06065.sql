-- Update the audit_phi_access function to handle service role operations (where auth.uid() is NULL)
CREATE OR REPLACE FUNCTION public.audit_phi_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid;
BEGIN
  -- Get the current user ID, or use a system UUID for service role operations
  _user_id := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);
  
  INSERT INTO public.phi_access_logs (user_id, patient_id, resource_type, resource_id, action)
  VALUES (
    _user_id,
    CASE 
      WHEN TG_TABLE_NAME = 'patients' THEN COALESCE(NEW.id, OLD.id)
      WHEN TG_TABLE_NAME IN ('encounters', 'medications', 'attachments', 'consent_records') THEN COALESCE(NEW.patient_id, OLD.patient_id)
      WHEN TG_TABLE_NAME IN ('diagnoses', 'clinical_notes') THEN (
        SELECT e.patient_id FROM public.encounters e WHERE e.id = COALESCE(NEW.encounter_id, OLD.encounter_id)
      )
      ELSE NULL
    END,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP
  );
  RETURN COALESCE(NEW, OLD);
END;
$function$;