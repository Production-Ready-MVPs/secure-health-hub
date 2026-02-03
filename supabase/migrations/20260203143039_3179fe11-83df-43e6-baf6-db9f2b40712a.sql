-- Step 2: RLS for patients table only

-- Security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Security definer function to check if provider is assigned to patient
CREATE OR REPLACE FUNCTION public.is_assigned_provider(_user_id uuid, _patient_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.patient_provider_assignments ppa
    JOIN public.providers p ON p.id = ppa.provider_id
    WHERE p.user_id = _user_id
      AND ppa.patient_id = _patient_id
      AND ppa.revoked_at IS NULL
  )
$$;

-- Enable RLS on patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Patient can SELECT their own row
CREATE POLICY "Patients can view own record"
ON public.patients
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Provider can SELECT assigned patients
CREATE POLICY "Providers can view assigned patients"
ON public.patients
FOR SELECT
TO authenticated
USING (public.is_assigned_provider(auth.uid(), id));

-- Admin can SELECT all patients
CREATE POLICY "Admins can view all patients"
ON public.patients
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));