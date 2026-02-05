-- Add INSERT policy for providers table (service role operations)
CREATE POLICY "Service role can manage providers" ON public.providers
FOR ALL USING (true) WITH CHECK (true);

-- Add INSERT policy for patients table (service role operations)  
CREATE POLICY "Service role can manage patients" ON public.patients
FOR ALL USING (true) WITH CHECK (true);

-- Add INSERT policy for patient_provider_assignments table
CREATE POLICY "Admins can manage assignments" ON public.patient_provider_assignments
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));