-- First add unique constraint on providers.user_id
ALTER TABLE public.providers ADD CONSTRAINT providers_user_id_unique UNIQUE (user_id);

-- Create providers for the existing demo users
INSERT INTO public.providers (user_id, first_name, last_name, specialty, department, email, npi, license_number, license_state, is_active)
VALUES 
  ('7d512992-ec22-4c41-a7c9-50a720cb9143', 'Sarah', 'Chen', 'Internal Medicine', 'Medicine', 'dr.chen@demo-ehr.com', '1234567890', 'MD123456', 'CA', true),
  ('c6e9ba49-c044-4918-9586-b231ace0a603', 'James', 'Rodriguez', 'Family Medicine', 'Medicine', 'dr.rodriguez@demo-ehr.com', '1234567891', 'MD123457', 'CA', true),
  ('8e7344bb-1dc3-4d84-8983-d9fe9a2efc53', 'Maria', 'Santos', 'Registered Nurse', 'Nursing', 'rn.santos@demo-ehr.com', '1234567892', 'RN123456', 'CA', true),
  ('b7c47c20-86b3-4abb-a931-c50c2e62b139', 'David', 'Kim', 'Registered Nurse', 'Nursing', 'rn.kim@demo-ehr.com', '1234567893', 'RN123457', 'CA', true)
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  specialty = EXCLUDED.specialty,
  department = EXCLUDED.department,
  email = EXCLUDED.email;