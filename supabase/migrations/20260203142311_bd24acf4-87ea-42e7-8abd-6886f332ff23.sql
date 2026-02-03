-- Step 1: Core Database Tables DDL
-- HIPAA-compliant EHR foundation tables

-- Enum for user roles
CREATE TYPE public.app_role AS ENUM ('patient', 'provider', 'admin', 'compliance_officer');

-- Enum for relationship types
CREATE TYPE public.relationship_type AS ENUM ('primary', 'consulting', 'specialist');

-- User roles table (separate from profiles to prevent privilege escalation)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Patients table (core demographics, PHI marked for future encryption)
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- optional patient portal access
    mrn TEXT NOT NULL UNIQUE, -- Medical Record Number
    first_name TEXT NOT NULL, -- PHI
    last_name TEXT NOT NULL, -- PHI
    date_of_birth DATE NOT NULL, -- PHI
    gender TEXT,
    email TEXT, -- PHI
    phone TEXT, -- PHI
    address_line1 TEXT, -- PHI
    address_line2 TEXT, -- PHI
    city TEXT,
    state TEXT,
    zip_code TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT, -- PHI
    insurance_provider TEXT,
    insurance_policy_number TEXT, -- PHI
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE -- soft delete
);

-- Providers table (clinical staff)
CREATE TABLE public.providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    npi TEXT UNIQUE, -- National Provider Identifier
    license_number TEXT,
    license_state TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    specialty TEXT,
    department TEXT,
    email TEXT,
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Patient-provider assignments (least-privilege access control)
CREATE TABLE public.patient_provider_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
    relationship_type public.relationship_type NOT NULL DEFAULT 'primary',
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    UNIQUE (patient_id, provider_id, relationship_type)
);

-- Indexes for common queries
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_patients_user_id ON public.patients(user_id);
CREATE INDEX idx_patients_mrn ON public.patients(mrn);
CREATE INDEX idx_patients_deleted_at ON public.patients(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_providers_user_id ON public.providers(user_id);
CREATE INDEX idx_providers_npi ON public.providers(npi);
CREATE INDEX idx_providers_is_active ON public.providers(is_active) WHERE is_active = true;
CREATE INDEX idx_patient_provider_assignments_patient_id ON public.patient_provider_assignments(patient_id);
CREATE INDEX idx_patient_provider_assignments_provider_id ON public.patient_provider_assignments(provider_id);
CREATE INDEX idx_patient_provider_assignments_active ON public.patient_provider_assignments(patient_id, provider_id) WHERE revoked_at IS NULL;