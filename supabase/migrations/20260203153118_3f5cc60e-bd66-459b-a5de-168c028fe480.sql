-- Phase 3: Clinical Documentation Enhancement
-- SOAP templates, digital signatures, amendment chain

-- ========== NOTE TEMPLATES ==========
CREATE TABLE public.note_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  note_type text NOT NULL,
  template_content jsonb NOT NULL DEFAULT '{}'::jsonb,
  specialty text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.providers(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Default SOAP template content structure:
-- {
--   "subjective": { "label": "Subjective", "placeholder": "Chief complaint, HPI, ROS..." },
--   "objective": { "label": "Objective", "placeholder": "Vitals, physical exam findings..." },
--   "assessment": { "label": "Assessment", "placeholder": "Diagnoses, clinical impression..." },
--   "plan": { "label": "Plan", "placeholder": "Treatment plan, medications, follow-up..." }
-- }

-- ========== ADD COLUMNS TO CLINICAL_NOTES ==========
ALTER TABLE public.clinical_notes 
ADD COLUMN IF NOT EXISTS soap_subjective text,
ADD COLUMN IF NOT EXISTS soap_objective text,
ADD COLUMN IF NOT EXISTS soap_assessment text,
ADD COLUMN IF NOT EXISTS soap_plan text,
ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES public.note_templates(id),
ADD COLUMN IF NOT EXISTS signature_hash text,
ADD COLUMN IF NOT EXISTS signature_timestamp timestamptz,
ADD COLUMN IF NOT EXISTS signature_certificate text,
ADD COLUMN IF NOT EXISTS amended_from_id uuid REFERENCES public.clinical_notes(id),
ADD COLUMN IF NOT EXISTS amendment_reason text,
ADD COLUMN IF NOT EXISTS is_amendment boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_signed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS dictation_audio_path text,
ADD COLUMN IF NOT EXISTS transcription_method text CHECK (transcription_method IN ('manual', 'voice', 'template'));

-- ========== NOTE AMENDMENTS TABLE ==========
CREATE TABLE public.note_amendments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_note_id uuid NOT NULL REFERENCES public.clinical_notes(id),
  amended_note_id uuid NOT NULL REFERENCES public.clinical_notes(id),
  amendment_reason text NOT NULL,
  amended_by uuid NOT NULL REFERENCES public.providers(id),
  amended_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(original_note_id, amended_note_id)
);

-- ========== DIGITAL SIGNATURE LOG ==========
CREATE TABLE public.signature_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES public.clinical_notes(id),
  signer_id uuid NOT NULL REFERENCES public.providers(id),
  signature_hash text NOT NULL,
  content_hash text NOT NULL,
  signed_at timestamptz NOT NULL DEFAULT now(),
  signature_method text NOT NULL DEFAULT 'SHA-256',
  ip_address inet,
  user_agent text,
  verification_status text NOT NULL DEFAULT 'valid' CHECK (verification_status IN ('valid', 'invalid', 'revoked'))
);

-- ========== ENABLE RLS ==========
ALTER TABLE public.note_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signature_log ENABLE ROW LEVEL SECURITY;

-- ========== RLS: NOTE TEMPLATES ==========
CREATE POLICY "Anyone can view active templates" ON public.note_templates FOR SELECT TO authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage templates" ON public.note_templates FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Providers can create templates" ON public.note_templates FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'provider') OR public.has_role(auth.uid(), 'admin'));

-- ========== RLS: NOTE AMENDMENTS ==========
CREATE POLICY "Admins can view all amendments" ON public.note_amendments FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Compliance can view all amendments" ON public.note_amendments FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Providers can view related amendments" ON public.note_amendments FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.clinical_notes cn
  JOIN public.providers p ON p.id = cn.author_id
  WHERE cn.id = original_note_id AND p.user_id = auth.uid()
));

CREATE POLICY "Providers can create amendments" ON public.note_amendments FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'provider') OR public.has_role(auth.uid(), 'admin'));

-- ========== RLS: SIGNATURE LOG ==========
CREATE POLICY "Admins can view all signatures" ON public.signature_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Compliance can view all signatures" ON public.signature_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'compliance_officer'));

CREATE POLICY "Providers can view own signatures" ON public.signature_log FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.providers p WHERE p.id = signer_id AND p.user_id = auth.uid()));

CREATE POLICY "Providers can create signatures" ON public.signature_log FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.providers p WHERE p.id = signer_id AND p.user_id = auth.uid()));

-- ========== INDEXES ==========
CREATE INDEX idx_clinical_notes_amended_from ON public.clinical_notes(amended_from_id);
CREATE INDEX idx_clinical_notes_signed ON public.clinical_notes(is_signed);
CREATE INDEX idx_note_amendments_original ON public.note_amendments(original_note_id);
CREATE INDEX idx_signature_log_note ON public.signature_log(note_id);

-- ========== INSERT DEFAULT SOAP TEMPLATE ==========
INSERT INTO public.note_templates (name, description, note_type, template_content, specialty, is_active)
VALUES 
(
  'Standard SOAP Note',
  'Standard Subjective, Objective, Assessment, Plan format',
  'progress_note',
  '{
    "subjective": {
      "label": "Subjective",
      "placeholder": "Chief complaint, history of present illness, review of systems, medications, allergies...",
      "sections": ["Chief Complaint", "HPI", "ROS", "Current Medications", "Allergies"]
    },
    "objective": {
      "label": "Objective", 
      "placeholder": "Vital signs, physical examination findings, lab results, imaging...",
      "sections": ["Vital Signs", "Physical Exam", "Lab Results", "Imaging"]
    },
    "assessment": {
      "label": "Assessment",
      "placeholder": "Diagnoses, differential diagnoses, clinical impression...",
      "sections": ["Primary Diagnosis", "Secondary Diagnoses", "Differential"]
    },
    "plan": {
      "label": "Plan",
      "placeholder": "Treatment plan, medications prescribed, procedures, referrals, follow-up...",
      "sections": ["Medications", "Procedures", "Referrals", "Patient Education", "Follow-up"]
    }
  }'::jsonb,
  'general',
  true
),
(
  'Brief Progress Note',
  'Abbreviated note for routine follow-ups',
  'progress_note',
  '{
    "subjective": {"label": "Subjective", "placeholder": "Interval history, current symptoms..."},
    "objective": {"label": "Objective", "placeholder": "Pertinent findings..."},
    "assessment": {"label": "Assessment", "placeholder": "Status of conditions..."},
    "plan": {"label": "Plan", "placeholder": "Adjustments to treatment, next steps..."}
  }'::jsonb,
  'general',
  true
),
(
  'Initial Consultation',
  'Comprehensive new patient evaluation',
  'consultation',
  '{
    "subjective": {
      "label": "History",
      "placeholder": "Complete medical history, family history, social history...",
      "sections": ["Chief Complaint", "HPI", "PMH", "PSH", "Family History", "Social History", "ROS"]
    },
    "objective": {
      "label": "Examination",
      "placeholder": "Complete physical examination...",
      "sections": ["Vital Signs", "General", "HEENT", "Cardiovascular", "Respiratory", "Abdomen", "Extremities", "Neurological"]
    },
    "assessment": {
      "label": "Assessment",
      "placeholder": "Diagnoses and medical decision making..."
    },
    "plan": {
      "label": "Plan",
      "placeholder": "Diagnostic workup, treatment plan, patient education..."
    }
  }'::jsonb,
  'general',
  true
);