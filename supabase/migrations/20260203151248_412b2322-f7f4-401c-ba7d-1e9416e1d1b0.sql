-- Clinical Tables + RLS + Audit Triggers + Storage + Compliance

-- ========== CLINICAL TABLES ==========

CREATE TABLE public.encounters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id),
  provider_id uuid NOT NULL REFERENCES public.providers(id),
  encounter_date timestamptz NOT NULL DEFAULT now(),
  encounter_type text NOT NULL,
  chief_complaint text,
  status text NOT NULL DEFAULT 'scheduled',
  location text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id uuid NOT NULL REFERENCES public.encounters(id),
  icd_code text NOT NULL,
  description text,
  diagnosis_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id),
  encounter_id uuid REFERENCES public.encounters(id),
  medication_name text NOT NULL,
  dosage text,
  frequency text,
  route text,
  start_date date NOT NULL,
  end_date date,
  prescriber_id uuid REFERENCES public.providers(id),
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.clinical_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id uuid NOT NULL REFERENCES public.encounters(id),
  author_id uuid NOT NULL REFERENCES public.providers(id),
  note_type text NOT NULL,
  content_encrypted text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  signed_at timestamptz,
  signed_by uuid REFERENCES public.providers(id)
);

CREATE TABLE public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id),
  encounter_id uuid REFERENCES public.encounters(id),
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size_bytes bigint,
  content_hash text,
  uploaded_by uuid NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  description text
);

-- ========== COMPLIANCE TABLES ==========

CREATE TABLE public.consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id),
  consent_type text NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  granted_to uuid,
  purpose text,
  expiration_date date,
  document_path text
);

CREATE TABLE public.break_glass_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  patient_id uuid NOT NULL REFERENCES public.patients(id),
  access_reason text NOT NULL,
  justification text NOT NULL,
  accessed_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_notes text
);

-- ========== ENABLE RLS ON ALL NEW TABLES ==========

ALTER TABLE public.encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.break_glass_logs ENABLE ROW LEVEL SECURITY;

-- ========== HELPER FUNCTIONS ==========

CREATE OR REPLACE FUNCTION public.is_encounter_provider(_user_id uuid, _encounter_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.encounters e
    JOIN public.providers p ON p.id = e.provider_id
    WHERE e.id = _encounter_id AND p.user_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_encounter_patient(_user_id uuid, _encounter_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.encounters e
    JOIN public.patients pt ON pt.id = e.patient_id
    WHERE e.id = _encounter_id AND pt.user_id = _user_id
  )
$$;

-- ========== RLS POLICIES: ENCOUNTERS ==========

CREATE POLICY "Admins can manage encounters" ON public.encounters FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Compliance officers can view encounters" ON public.encounters FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Providers can manage assigned patient encounters" ON public.encounters FOR ALL TO authenticated
USING (public.is_assigned_provider(auth.uid(), patient_id)) WITH CHECK (public.is_assigned_provider(auth.uid(), patient_id));

CREATE POLICY "Patients can view own encounters" ON public.encounters FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.user_id = auth.uid()));

-- ========== RLS POLICIES: DIAGNOSES ==========

CREATE POLICY "Admins can manage diagnoses" ON public.diagnoses FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Compliance officers can view diagnoses" ON public.diagnoses FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Providers can manage encounter diagnoses" ON public.diagnoses FOR ALL TO authenticated
USING (public.is_encounter_provider(auth.uid(), encounter_id)) WITH CHECK (public.is_encounter_provider(auth.uid(), encounter_id));

CREATE POLICY "Patients can view own diagnoses" ON public.diagnoses FOR SELECT TO authenticated
USING (public.is_encounter_patient(auth.uid(), encounter_id));

-- ========== RLS POLICIES: MEDICATIONS ==========

CREATE POLICY "Admins can manage medications" ON public.medications FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Compliance officers can view medications" ON public.medications FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Providers can manage assigned patient medications" ON public.medications FOR ALL TO authenticated
USING (public.is_assigned_provider(auth.uid(), patient_id)) WITH CHECK (public.is_assigned_provider(auth.uid(), patient_id));

CREATE POLICY "Patients can view own medications" ON public.medications FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.user_id = auth.uid()));

-- ========== RLS POLICIES: CLINICAL_NOTES ==========

CREATE POLICY "Admins can manage clinical notes" ON public.clinical_notes FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Compliance officers can view clinical notes" ON public.clinical_notes FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Providers can manage encounter notes" ON public.clinical_notes FOR ALL TO authenticated
USING (public.is_encounter_provider(auth.uid(), encounter_id)) WITH CHECK (public.is_encounter_provider(auth.uid(), encounter_id));

CREATE POLICY "Patients can view own clinical notes" ON public.clinical_notes FOR SELECT TO authenticated
USING (public.is_encounter_patient(auth.uid(), encounter_id));

-- ========== RLS POLICIES: ATTACHMENTS ==========

CREATE POLICY "Admins can manage attachments" ON public.attachments FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Compliance officers can view attachments" ON public.attachments FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Providers can manage assigned patient attachments" ON public.attachments FOR ALL TO authenticated
USING (public.is_assigned_provider(auth.uid(), patient_id)) WITH CHECK (public.is_assigned_provider(auth.uid(), patient_id));

CREATE POLICY "Patients can view own attachments" ON public.attachments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.user_id = auth.uid()));

-- ========== RLS POLICIES: CONSENT_RECORDS ==========

CREATE POLICY "Admins can manage consent records" ON public.consent_records FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Compliance officers can view consent records" ON public.consent_records FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Providers can view assigned patient consent" ON public.consent_records FOR SELECT TO authenticated
USING (public.is_assigned_provider(auth.uid(), patient_id));

CREATE POLICY "Patients can view own consent records" ON public.consent_records FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.user_id = auth.uid()));

-- ========== RLS POLICIES: BREAK_GLASS_LOGS ==========

CREATE POLICY "Admins can view break glass logs" ON public.break_glass_logs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert break glass logs" ON public.break_glass_logs FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'provider'));

CREATE POLICY "Compliance officers can manage break glass logs" ON public.break_glass_logs FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'compliance_officer')) WITH CHECK (public.has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Patients can view own break glass logs" ON public.break_glass_logs FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.user_id = auth.uid()));

-- ========== AUDIT TRIGGERS ==========

CREATE OR REPLACE FUNCTION public.audit_phi_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.phi_access_logs (user_id, patient_id, resource_type, resource_id, action)
  VALUES (
    auth.uid(),
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
$$;

CREATE TRIGGER audit_patients_access AFTER INSERT OR UPDATE OR DELETE ON public.patients
FOR EACH ROW EXECUTE FUNCTION public.audit_phi_access();

CREATE TRIGGER audit_encounters_access AFTER INSERT OR UPDATE OR DELETE ON public.encounters
FOR EACH ROW EXECUTE FUNCTION public.audit_phi_access();

CREATE TRIGGER audit_diagnoses_access AFTER INSERT OR UPDATE OR DELETE ON public.diagnoses
FOR EACH ROW EXECUTE FUNCTION public.audit_phi_access();

CREATE TRIGGER audit_medications_access AFTER INSERT OR UPDATE OR DELETE ON public.medications
FOR EACH ROW EXECUTE FUNCTION public.audit_phi_access();

CREATE TRIGGER audit_clinical_notes_access AFTER INSERT OR UPDATE OR DELETE ON public.clinical_notes
FOR EACH ROW EXECUTE FUNCTION public.audit_phi_access();

CREATE TRIGGER audit_attachments_access AFTER INSERT OR UPDATE OR DELETE ON public.attachments
FOR EACH ROW EXECUTE FUNCTION public.audit_phi_access();

-- ========== STORAGE BUCKET ==========

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('medical-attachments', 'medical-attachments', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/dicom']);

-- Storage RLS policies
CREATE POLICY "Admins can manage all attachments" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'medical-attachments' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'medical-attachments' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Providers can upload to assigned patients" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'medical-attachments' 
  AND public.is_assigned_provider(auth.uid(), (storage.foldername(name))[1]::uuid)
);

CREATE POLICY "Providers can view assigned patient files" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'medical-attachments' 
  AND public.is_assigned_provider(auth.uid(), (storage.foldername(name))[1]::uuid)
);

CREATE POLICY "Patients can view own files" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'medical-attachments' 
  AND EXISTS (SELECT 1 FROM public.patients p WHERE p.id = (storage.foldername(name))[1]::uuid AND p.user_id = auth.uid())
);

-- ========== REALTIME FOR ENCOUNTERS ==========

ALTER PUBLICATION supabase_realtime ADD TABLE public.encounters;