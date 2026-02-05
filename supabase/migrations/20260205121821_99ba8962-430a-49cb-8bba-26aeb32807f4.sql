-- Fix the audit function to handle tables without patient_id column
CREATE OR REPLACE FUNCTION public.audit_phi_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid;
  _patient_id uuid;
BEGIN
  -- Get the current user ID, or use a system UUID for service role operations
  _user_id := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);
  
  -- Determine patient_id based on table
  IF TG_TABLE_NAME = 'patients' THEN
    _patient_id := COALESCE(NEW.id, OLD.id);
  ELSIF TG_TABLE_NAME IN ('encounters', 'medications', 'attachments', 'consent_records', 'allergies', 'vital_signs', 'lab_orders', 'prescriptions', 'appointments', 'immunizations') THEN
    _patient_id := COALESCE(NEW.patient_id, OLD.patient_id);
  ELSIF TG_TABLE_NAME IN ('diagnoses', 'clinical_notes') THEN
    SELECT e.patient_id INTO _patient_id FROM public.encounters e WHERE e.id = COALESCE(NEW.encounter_id, OLD.encounter_id);
  ELSIF TG_TABLE_NAME = 'lab_results' THEN
    SELECT lo.patient_id INTO _patient_id FROM public.lab_orders lo WHERE lo.id = COALESCE(NEW.order_id, OLD.order_id);
  ELSE
    _patient_id := NULL;
  END IF;
  
  INSERT INTO public.phi_access_logs (user_id, patient_id, resource_type, resource_id, action)
  VALUES (_user_id, _patient_id, TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), TG_OP);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;