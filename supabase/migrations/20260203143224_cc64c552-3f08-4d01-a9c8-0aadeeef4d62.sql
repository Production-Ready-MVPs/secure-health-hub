-- Step 3: RLS for user_roles, patient_provider_assignments, providers

-- Helper: check if user is the provider in an assignment
CREATE OR REPLACE FUNCTION public.is_provider_for_assignment(_user_id uuid, _assignment_id uuid)
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
    WHERE ppa.id = _assignment_id
      AND p.user_id = _user_id
  )
$$;

-- Helper: check if user is the patient in an assignment
CREATE OR REPLACE FUNCTION public.is_patient_for_assignment(_user_id uuid, _assignment_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.patient_provider_assignments ppa
    JOIN public.patients pt ON pt.id = ppa.patient_id
    WHERE ppa.id = _assignment_id
      AND pt.user_id = _user_id
  )
$$;

-- ========== user_roles ==========
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Compliance officers can view roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'compliance_officer'));

-- ========== providers ==========
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all providers"
ON public.providers FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert providers"
ON public.providers FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update providers"
ON public.providers FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Compliance officers can view providers"
ON public.providers FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Providers can view own record"
ON public.providers FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- ========== patient_provider_assignments ==========
ALTER TABLE public.patient_provider_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all assignments"
ON public.patient_provider_assignments FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert assignments"
ON public.patient_provider_assignments FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update assignments"
ON public.patient_provider_assignments FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Compliance officers can view assignments"
ON public.patient_provider_assignments FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Providers can view own assignments"
ON public.patient_provider_assignments FOR SELECT TO authenticated
USING (public.is_provider_for_assignment(auth.uid(), id));

CREATE POLICY "Patients can view own assignments"
ON public.patient_provider_assignments FOR SELECT TO authenticated
USING (public.is_patient_for_assignment(auth.uid(), id));