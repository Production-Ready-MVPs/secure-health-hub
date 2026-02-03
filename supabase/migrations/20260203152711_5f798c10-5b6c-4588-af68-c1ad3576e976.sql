-- Phase 1: Enhanced Clinical Schema
-- Tables: allergies, vital_signs, lab_orders, lab_results, prescriptions, appointments, immunizations

-- ========== ALLERGIES ==========
CREATE TABLE public.allergies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id),
  allergen text NOT NULL,
  reaction text,
  severity text CHECK (severity IN ('mild', 'moderate', 'severe', 'life-threatening')),
  onset_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'resolved')),
  verified_by uuid REFERENCES public.providers(id),
  verified_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ========== VITAL SIGNS ==========
CREATE TABLE public.vital_signs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id uuid NOT NULL REFERENCES public.encounters(id),
  patient_id uuid NOT NULL REFERENCES public.patients(id),
  bp_systolic integer,
  bp_diastolic integer,
  heart_rate integer,
  temperature_f numeric(4,1),
  respiratory_rate integer,
  o2_saturation integer,
  height_inches numeric(5,2),
  weight_lbs numeric(6,2),
  bmi numeric(4,1),
  pain_level integer CHECK (pain_level >= 0 AND pain_level <= 10),
  recorded_by uuid NOT NULL REFERENCES public.providers(id),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

-- ========== LAB ORDERS ==========
CREATE TABLE public.lab_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id),
  encounter_id uuid REFERENCES public.encounters(id),
  test_name text NOT NULL,
  loinc_code text,
  ordered_by uuid NOT NULL REFERENCES public.providers(id),
  ordered_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'collected', 'processing', 'completed', 'cancelled')),
  priority text NOT NULL DEFAULT 'routine' CHECK (priority IN ('routine', 'urgent', 'stat')),
  specimen_type text,
  collection_instructions text,
  fasting_required boolean DEFAULT false,
  scheduled_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ========== LAB RESULTS ==========
CREATE TABLE public.lab_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.lab_orders(id),
  test_component text NOT NULL,
  value text NOT NULL,
  unit text,
  reference_range text,
  abnormal_flag text CHECK (abnormal_flag IN ('normal', 'low', 'high', 'critical_low', 'critical_high', 'abnormal')),
  resulted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid REFERENCES public.providers(id),
  reviewed_at timestamptz,
  comments text,
  critical_value boolean DEFAULT false,
  critical_notified_at timestamptz,
  critical_notified_to uuid REFERENCES public.providers(id)
);

-- ========== PRESCRIPTIONS ==========
CREATE TABLE public.prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id),
  encounter_id uuid REFERENCES public.encounters(id),
  medication_id uuid REFERENCES public.medications(id),
  drug_name text NOT NULL,
  drug_ndc text,
  sig text NOT NULL,
  quantity integer NOT NULL,
  quantity_unit text DEFAULT 'tablets',
  refills integer NOT NULL DEFAULT 0,
  days_supply integer,
  dea_schedule text CHECK (dea_schedule IN ('II', 'III', 'IV', 'V', NULL)),
  prescriber_id uuid NOT NULL REFERENCES public.providers(id),
  pharmacy_name text,
  pharmacy_npi text,
  pharmacy_address text,
  sent_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'filled', 'cancelled', 'denied')),
  epcs_signature text,
  dispense_as_written boolean DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ========== APPOINTMENTS ==========
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id),
  provider_id uuid NOT NULL REFERENCES public.providers(id),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  appointment_type text NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show')),
  visit_reason text,
  room text,
  notes text,
  reminder_sent_at timestamptz,
  reminder_type text,
  check_in_time timestamptz,
  check_out_time timestamptz,
  cancellation_reason text,
  cancelled_by uuid,
  cancelled_at timestamptz,
  is_telehealth boolean DEFAULT false,
  telehealth_link text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_appointment_times CHECK (end_time > start_time)
);

-- ========== IMMUNIZATIONS ==========
CREATE TABLE public.immunizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id),
  encounter_id uuid REFERENCES public.encounters(id),
  vaccine_name text NOT NULL,
  cvx_code text,
  manufacturer text,
  lot_number text,
  expiration_date date,
  administration_date date NOT NULL,
  site text,
  route text,
  dose text,
  dose_number integer,
  series_complete boolean DEFAULT false,
  administered_by uuid REFERENCES public.providers(id),
  ordering_provider uuid REFERENCES public.providers(id),
  vis_given boolean DEFAULT true,
  vis_date date,
  notes text,
  reaction text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ========== ENABLE RLS ==========
ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immunizations ENABLE ROW LEVEL SECURITY;

-- ========== HELPER FUNCTION: Check if user is patient for lab order ==========
CREATE OR REPLACE FUNCTION public.is_patient_for_lab_order(_user_id uuid, _order_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.lab_orders lo
    JOIN public.patients p ON p.id = lo.patient_id
    WHERE lo.id = _order_id AND p.user_id = _user_id
  )
$$;

-- ========== RLS: ALLERGIES ==========
CREATE POLICY "Admins can manage allergies" ON public.allergies FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Compliance officers can view allergies" ON public.allergies FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Providers can manage assigned patient allergies" ON public.allergies FOR ALL TO authenticated
USING (public.is_assigned_provider(auth.uid(), patient_id)) WITH CHECK (public.is_assigned_provider(auth.uid(), patient_id));

CREATE POLICY "Patients can view own allergies" ON public.allergies FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.user_id = auth.uid()));

-- ========== RLS: VITAL SIGNS ==========
CREATE POLICY "Admins can manage vital signs" ON public.vital_signs FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Compliance officers can view vital signs" ON public.vital_signs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Providers can manage assigned patient vitals" ON public.vital_signs FOR ALL TO authenticated
USING (public.is_assigned_provider(auth.uid(), patient_id)) WITH CHECK (public.is_assigned_provider(auth.uid(), patient_id));

CREATE POLICY "Patients can view own vital signs" ON public.vital_signs FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.user_id = auth.uid()));

-- ========== RLS: LAB ORDERS ==========
CREATE POLICY "Admins can manage lab orders" ON public.lab_orders FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Compliance officers can view lab orders" ON public.lab_orders FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Providers can manage assigned patient lab orders" ON public.lab_orders FOR ALL TO authenticated
USING (public.is_assigned_provider(auth.uid(), patient_id)) WITH CHECK (public.is_assigned_provider(auth.uid(), patient_id));

CREATE POLICY "Patients can view own lab orders" ON public.lab_orders FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.user_id = auth.uid()));

-- ========== RLS: LAB RESULTS ==========
CREATE POLICY "Admins can manage lab results" ON public.lab_results FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Compliance officers can view lab results" ON public.lab_results FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Providers can manage results for assigned patients" ON public.lab_results FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.lab_orders lo
  WHERE lo.id = order_id AND public.is_assigned_provider(auth.uid(), lo.patient_id)
)) WITH CHECK (EXISTS (
  SELECT 1 FROM public.lab_orders lo
  WHERE lo.id = order_id AND public.is_assigned_provider(auth.uid(), lo.patient_id)
));

CREATE POLICY "Patients can view own lab results" ON public.lab_results FOR SELECT TO authenticated
USING (public.is_patient_for_lab_order(auth.uid(), order_id));

-- ========== RLS: PRESCRIPTIONS ==========
CREATE POLICY "Admins can manage prescriptions" ON public.prescriptions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Compliance officers can view prescriptions" ON public.prescriptions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Providers can manage assigned patient prescriptions" ON public.prescriptions FOR ALL TO authenticated
USING (public.is_assigned_provider(auth.uid(), patient_id)) WITH CHECK (public.is_assigned_provider(auth.uid(), patient_id));

CREATE POLICY "Patients can view own prescriptions" ON public.prescriptions FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.user_id = auth.uid()));

-- ========== RLS: APPOINTMENTS ==========
CREATE POLICY "Admins can manage appointments" ON public.appointments FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Compliance officers can view appointments" ON public.appointments FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Providers can manage assigned patient appointments" ON public.appointments FOR ALL TO authenticated
USING (public.is_assigned_provider(auth.uid(), patient_id)) WITH CHECK (public.is_assigned_provider(auth.uid(), patient_id));

CREATE POLICY "Providers can view own appointments" ON public.appointments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.providers p WHERE p.id = provider_id AND p.user_id = auth.uid()));

CREATE POLICY "Patients can view own appointments" ON public.appointments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.user_id = auth.uid()));

-- ========== RLS: IMMUNIZATIONS ==========
CREATE POLICY "Admins can manage immunizations" ON public.immunizations FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Compliance officers can view immunizations" ON public.immunizations FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Providers can manage assigned patient immunizations" ON public.immunizations FOR ALL TO authenticated
USING (public.is_assigned_provider(auth.uid(), patient_id)) WITH CHECK (public.is_assigned_provider(auth.uid(), patient_id));

CREATE POLICY "Patients can view own immunizations" ON public.immunizations FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.user_id = auth.uid()));

-- ========== AUDIT TRIGGERS ==========
CREATE TRIGGER audit_allergies_access AFTER INSERT OR UPDATE OR DELETE ON public.allergies
FOR EACH ROW EXECUTE FUNCTION public.audit_phi_access();

CREATE TRIGGER audit_vital_signs_access AFTER INSERT OR UPDATE OR DELETE ON public.vital_signs
FOR EACH ROW EXECUTE FUNCTION public.audit_phi_access();

CREATE TRIGGER audit_lab_orders_access AFTER INSERT OR UPDATE OR DELETE ON public.lab_orders
FOR EACH ROW EXECUTE FUNCTION public.audit_phi_access();

CREATE TRIGGER audit_lab_results_access AFTER INSERT OR UPDATE OR DELETE ON public.lab_results
FOR EACH ROW EXECUTE FUNCTION public.audit_phi_access();

CREATE TRIGGER audit_prescriptions_access AFTER INSERT OR UPDATE OR DELETE ON public.prescriptions
FOR EACH ROW EXECUTE FUNCTION public.audit_phi_access();

CREATE TRIGGER audit_appointments_access AFTER INSERT OR UPDATE OR DELETE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.audit_phi_access();

CREATE TRIGGER audit_immunizations_access AFTER INSERT OR UPDATE OR DELETE ON public.immunizations
FOR EACH ROW EXECUTE FUNCTION public.audit_phi_access();

-- ========== INDEXES FOR PERFORMANCE ==========
CREATE INDEX idx_allergies_patient ON public.allergies(patient_id);
CREATE INDEX idx_vital_signs_encounter ON public.vital_signs(encounter_id);
CREATE INDEX idx_vital_signs_patient ON public.vital_signs(patient_id);
CREATE INDEX idx_lab_orders_patient ON public.lab_orders(patient_id);
CREATE INDEX idx_lab_orders_status ON public.lab_orders(status);
CREATE INDEX idx_lab_results_order ON public.lab_results(order_id);
CREATE INDEX idx_lab_results_critical ON public.lab_results(critical_value) WHERE critical_value = true;
CREATE INDEX idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX idx_prescriptions_status ON public.prescriptions(status);
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_appointments_provider ON public.appointments(provider_id);
CREATE INDEX idx_appointments_start ON public.appointments(start_time);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_immunizations_patient ON public.immunizations(patient_id);

-- ========== REALTIME FOR APPOINTMENTS ==========
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;