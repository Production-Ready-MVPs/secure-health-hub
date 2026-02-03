-- Task 1: Finalize minimal SELECT-only RLS (drop INSERT/UPDATE policies)

-- Drop INSERT/UPDATE policies from user_roles
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;

-- Drop INSERT/UPDATE policies from providers
DROP POLICY IF EXISTS "Admins can insert providers" ON public.providers;
DROP POLICY IF EXISTS "Admins can update providers" ON public.providers;

-- Drop INSERT/UPDATE policies from patient_provider_assignments
DROP POLICY IF EXISTS "Admins can insert assignments" ON public.patient_provider_assignments;
DROP POLICY IF EXISTS "Admins can update assignments" ON public.patient_provider_assignments;

-- Task 2: Create phi_access_logs table

CREATE TABLE public.phi_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  patient_id uuid,
  resource_type text NOT NULL,
  resource_id uuid,
  action text NOT NULL,
  access_reason text,
  ip_address inet,
  user_agent text,
  session_id text,
  request_hash text
);

ALTER TABLE public.phi_access_logs ENABLE ROW LEVEL SECURITY;

-- Security definer function for INSERT only
CREATE OR REPLACE FUNCTION public.log_phi_access(
  _patient_id uuid,
  _resource_type text,
  _resource_id uuid,
  _action text,
  _access_reason text DEFAULT NULL,
  _ip_address inet DEFAULT NULL,
  _user_agent text DEFAULT NULL,
  _session_id text DEFAULT NULL,
  _request_hash text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _log_id uuid;
BEGIN
  INSERT INTO public.phi_access_logs (
    user_id, patient_id, resource_type, resource_id, action,
    access_reason, ip_address, user_agent, session_id, request_hash
  ) VALUES (
    auth.uid(), _patient_id, _resource_type, _resource_id, _action,
    _access_reason, _ip_address, _user_agent, _session_id, _request_hash
  )
  RETURNING id INTO _log_id;
  
  RETURN _log_id;
END;
$$;

-- SELECT policies for phi_access_logs
CREATE POLICY "Admins can view all logs"
ON public.phi_access_logs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Compliance officers can view all logs"
ON public.phi_access_logs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Patients can view own access logs"
ON public.phi_access_logs FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = phi_access_logs.patient_id
      AND p.user_id = auth.uid()
  )
);