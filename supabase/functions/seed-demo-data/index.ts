import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper functions
const randomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
};

const randomDateOnly = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split("T")[0];
};

const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateMRN = (): string => {
  return `MRN${String(Math.floor(100000 + Math.random() * 900000))}`;
};

const generatePhone = (): string => {
  return `(${Math.floor(200 + Math.random() * 800)}) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// Demo data constants
const FIRST_NAMES_MALE = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Daniel", "Matthew", "Anthony", "Mark", "Steven"];
const FIRST_NAMES_FEMALE = ["Mary", "Patricia", "Jennifer", "Linda", "Barbara", "Elizabeth", "Susan", "Jessica", "Sarah", "Karen", "Lisa", "Nancy", "Betty", "Margaret", "Sandra"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"];
const STREETS = ["Oak St", "Maple Ave", "Cedar Ln", "Pine Dr", "Elm Rd", "Birch Ct", "Walnut Way", "Cherry Blvd", "Spruce Ter", "Willow Pkwy"];
const CITIES = ["Springfield", "Riverside", "Fairview", "Madison", "Georgetown", "Clinton", "Franklin", "Greenville", "Bristol", "Oakland"];
const STATES = ["CA", "TX", "FL", "NY", "PA", "IL", "OH", "GA", "NC", "MI"];
const INSURANCE_PROVIDERS = ["Blue Cross Blue Shield", "Aetna", "UnitedHealthcare", "Cigna", "Humana", "Kaiser Permanente", "Anthem", "Medicare", "Medicaid"];

const ICD10_CODES = [
  { code: "E11.9", description: "Type 2 diabetes mellitus without complications" },
  { code: "I10", description: "Essential (primary) hypertension" },
  { code: "J06.9", description: "Acute upper respiratory infection, unspecified" },
  { code: "M54.5", description: "Low back pain" },
  { code: "F32.9", description: "Major depressive disorder, single episode, unspecified" },
  { code: "J45.909", description: "Unspecified asthma, uncomplicated" },
  { code: "E78.5", description: "Hyperlipidemia, unspecified" },
  { code: "K21.0", description: "Gastro-esophageal reflux disease with esophagitis" },
  { code: "G43.909", description: "Migraine, unspecified, not intractable" },
  { code: "M25.561", description: "Pain in right knee" },
  { code: "J02.9", description: "Acute pharyngitis, unspecified" },
  { code: "N39.0", description: "Urinary tract infection, site not specified" },
  { code: "R05.9", description: "Cough, unspecified" },
  { code: "F41.1", description: "Generalized anxiety disorder" },
  { code: "I25.10", description: "Atherosclerotic heart disease" },
  { code: "E03.9", description: "Hypothyroidism, unspecified" },
  { code: "J30.9", description: "Allergic rhinitis, unspecified" },
  { code: "K59.00", description: "Constipation, unspecified" },
  { code: "M79.3", description: "Panniculitis, unspecified" },
  { code: "R51.9", description: "Headache, unspecified" },
];

const MEDICATIONS = [
  { name: "Metformin", dosage: "500mg", frequency: "twice daily", route: "oral" },
  { name: "Lisinopril", dosage: "10mg", frequency: "once daily", route: "oral" },
  { name: "Atorvastatin", dosage: "20mg", frequency: "once daily at bedtime", route: "oral" },
  { name: "Amlodipine", dosage: "5mg", frequency: "once daily", route: "oral" },
  { name: "Metoprolol", dosage: "25mg", frequency: "twice daily", route: "oral" },
  { name: "Omeprazole", dosage: "20mg", frequency: "once daily before breakfast", route: "oral" },
  { name: "Levothyroxine", dosage: "50mcg", frequency: "once daily on empty stomach", route: "oral" },
  { name: "Sertraline", dosage: "50mg", frequency: "once daily", route: "oral" },
  { name: "Gabapentin", dosage: "300mg", frequency: "three times daily", route: "oral" },
  { name: "Hydrochlorothiazide", dosage: "25mg", frequency: "once daily", route: "oral" },
  { name: "Losartan", dosage: "50mg", frequency: "once daily", route: "oral" },
  { name: "Albuterol", dosage: "90mcg/actuation", frequency: "as needed", route: "inhalation" },
  { name: "Fluticasone", dosage: "50mcg/spray", frequency: "2 sprays each nostril daily", route: "nasal" },
  { name: "Aspirin", dosage: "81mg", frequency: "once daily", route: "oral" },
  { name: "Vitamin D3", dosage: "2000 IU", frequency: "once daily", route: "oral" },
];

const CONTROLLED_MEDICATIONS = [
  { name: "Oxycodone", dosage: "5mg", frequency: "every 4-6 hours as needed", route: "oral", schedule: "II" },
  { name: "Hydrocodone/Acetaminophen", dosage: "5/325mg", frequency: "every 4-6 hours as needed", route: "oral", schedule: "II" },
  { name: "Alprazolam", dosage: "0.5mg", frequency: "twice daily as needed", route: "oral", schedule: "IV" },
  { name: "Lorazepam", dosage: "1mg", frequency: "twice daily as needed", route: "oral", schedule: "IV" },
  { name: "Zolpidem", dosage: "10mg", frequency: "once at bedtime", route: "oral", schedule: "IV" },
];

const ALLERGENS = [
  { allergen: "Penicillin", reaction: "Rash, hives", severity: "moderate" },
  { allergen: "Sulfa drugs", reaction: "Anaphylaxis", severity: "severe" },
  { allergen: "Aspirin", reaction: "Stomach upset", severity: "mild" },
  { allergen: "Latex", reaction: "Contact dermatitis", severity: "moderate" },
  { allergen: "Peanuts", reaction: "Anaphylaxis, throat swelling", severity: "severe" },
  { allergen: "Codeine", reaction: "Nausea, vomiting", severity: "moderate" },
  { allergen: "Ibuprofen", reaction: "GI bleeding", severity: "moderate" },
  { allergen: "Shellfish", reaction: "Hives, difficulty breathing", severity: "severe" },
  { allergen: "Eggs", reaction: "Skin rash", severity: "mild" },
  { allergen: "Contrast dye", reaction: "Flushing, itching", severity: "moderate" },
];

const VACCINES = [
  { name: "Influenza (Flu)", cvx: "158" },
  { name: "Tdap (Tetanus, Diphtheria, Pertussis)", cvx: "115" },
  { name: "Pneumococcal (PPSV23)", cvx: "33" },
  { name: "Shingles (Shingrix)", cvx: "187" },
  { name: "COVID-19 (Pfizer)", cvx: "208" },
  { name: "Hepatitis B", cvx: "43" },
  { name: "MMR (Measles, Mumps, Rubella)", cvx: "03" },
  { name: "Varicella (Chickenpox)", cvx: "21" },
];

const LAB_TESTS = [
  { name: "Complete Blood Count (CBC)", loinc: "58410-2", components: [
    { name: "WBC", unit: "K/uL", refRange: "4.5-11.0", normalMin: 4.5, normalMax: 11.0 },
    { name: "RBC", unit: "M/uL", refRange: "4.5-5.5", normalMin: 4.5, normalMax: 5.5 },
    { name: "Hemoglobin", unit: "g/dL", refRange: "12.0-16.0", normalMin: 12.0, normalMax: 16.0 },
    { name: "Hematocrit", unit: "%", refRange: "36-46", normalMin: 36, normalMax: 46 },
    { name: "Platelets", unit: "K/uL", refRange: "150-400", normalMin: 150, normalMax: 400 },
  ]},
  { name: "Comprehensive Metabolic Panel (CMP)", loinc: "24323-8", components: [
    { name: "Glucose", unit: "mg/dL", refRange: "70-100", normalMin: 70, normalMax: 100 },
    { name: "BUN", unit: "mg/dL", refRange: "7-20", normalMin: 7, normalMax: 20 },
    { name: "Creatinine", unit: "mg/dL", refRange: "0.7-1.3", normalMin: 0.7, normalMax: 1.3 },
    { name: "Sodium", unit: "mEq/L", refRange: "136-145", normalMin: 136, normalMax: 145 },
    { name: "Potassium", unit: "mEq/L", refRange: "3.5-5.0", normalMin: 3.5, normalMax: 5.0 },
    { name: "Chloride", unit: "mEq/L", refRange: "98-106", normalMin: 98, normalMax: 106 },
    { name: "CO2", unit: "mEq/L", refRange: "23-29", normalMin: 23, normalMax: 29 },
    { name: "Calcium", unit: "mg/dL", refRange: "8.5-10.5", normalMin: 8.5, normalMax: 10.5 },
  ]},
  { name: "Lipid Panel", loinc: "24331-1", components: [
    { name: "Total Cholesterol", unit: "mg/dL", refRange: "<200", normalMin: 0, normalMax: 200 },
    { name: "LDL Cholesterol", unit: "mg/dL", refRange: "<100", normalMin: 0, normalMax: 100 },
    { name: "HDL Cholesterol", unit: "mg/dL", refRange: ">40", normalMin: 40, normalMax: 100 },
    { name: "Triglycerides", unit: "mg/dL", refRange: "<150", normalMin: 0, normalMax: 150 },
  ]},
  { name: "Hemoglobin A1c", loinc: "4548-4", components: [
    { name: "HbA1c", unit: "%", refRange: "<5.7", normalMin: 4.0, normalMax: 5.7 },
  ]},
  { name: "Thyroid Panel", loinc: "24348-5", components: [
    { name: "TSH", unit: "mIU/L", refRange: "0.4-4.0", normalMin: 0.4, normalMax: 4.0 },
    { name: "Free T4", unit: "ng/dL", refRange: "0.8-1.8", normalMin: 0.8, normalMax: 1.8 },
  ]},
  { name: "Urinalysis", loinc: "24356-8", components: [
    { name: "pH", unit: "", refRange: "5.0-8.0", normalMin: 5.0, normalMax: 8.0 },
    { name: "Specific Gravity", unit: "", refRange: "1.005-1.030", normalMin: 1.005, normalMax: 1.030 },
    { name: "Glucose", unit: "", refRange: "Negative", normalMin: 0, normalMax: 0 },
    { name: "Protein", unit: "", refRange: "Negative", normalMin: 0, normalMax: 0 },
  ]},
];

const CHIEF_COMPLAINTS = [
  "Annual wellness exam",
  "Follow-up for hypertension",
  "Diabetes management",
  "Persistent cough for 2 weeks",
  "Lower back pain",
  "Headaches and fatigue",
  "Medication refill",
  "Chest discomfort",
  "Shortness of breath",
  "Joint pain and stiffness",
  "Skin rash",
  "Anxiety and sleep problems",
  "Weight management counseling",
  "Pre-operative clearance",
  "Flu-like symptoms",
];

const SOAP_TEMPLATES = {
  subjective: [
    "Patient presents with {complaint}. Symptoms began {duration} ago. Patient reports {severity} severity. Associated symptoms include {associated}. No recent changes in medications. Denies fever, chills, or night sweats.",
    "Patient here for {complaint}. States symptoms have been ongoing for {duration}. Pain rated {painLevel}/10. Aggravating factors: {aggravating}. Relieving factors: {relieving}. Has tried OTC medications with minimal relief.",
    "Chief complaint: {complaint}. Patient describes symptoms as {severity}. Duration: {duration}. Previous episodes: {previous}. Current medications taken as prescribed. No known drug allergies confirmed.",
  ],
  objective: [
    "Vital signs stable. General: Alert and oriented x3, in no acute distress. HEENT: Normocephalic, PERRLA, TMs clear bilaterally. Neck: Supple, no lymphadenopathy. Cardiovascular: RRR, no murmurs. Lungs: CTA bilaterally. Abdomen: Soft, non-tender, normoactive bowel sounds. Extremities: No edema, pulses 2+ bilaterally.",
    "Physical exam reveals patient in no acute distress. Vital signs within normal limits except BP {bp}. Heart: Regular rate and rhythm. Lungs: Clear to auscultation. Abdomen: Soft, non-distended. Neurological: Grossly intact. Skin: No rashes or lesions.",
    "Examination findings: Patient appears well-nourished and well-developed. Mental status: Alert, cooperative. Cardiovascular: Normal S1/S2, no murmurs/gallops/rubs. Respiratory: No wheezes, rales, or rhonchi. Musculoskeletal: Full ROM all extremities. Neurologic: CN II-XII intact.",
  ],
  assessment: [
    "1. {diagnosis1} - {status1}\n2. {diagnosis2} - {status2}\n\nPatient's conditions are {overall} controlled. Continue current management with close follow-up.",
    "Primary: {diagnosis1}\nSecondary: {diagnosis2}\n\nPatient demonstrates {progress} progress with current treatment plan. Will continue monitoring.",
    "Assessment:\n- {diagnosis1}: {status1}\n- {diagnosis2}: {status2}\n\nOverall clinical picture consistent with {overall} disease control.",
  ],
  plan: [
    "1. Continue current medications\n2. Order labs: {labs}\n3. Follow-up in {followup}\n4. Patient education provided on {education}\n5. Call if symptoms worsen\n\nPatient verbalized understanding of plan.",
    "Plan:\n- Medications: {meds}\n- Labs ordered: {labs}\n- Referral to {referral} if no improvement\n- Return to clinic in {followup}\n- Diet and exercise counseling provided",
    "Treatment plan discussed with patient:\n1. Pharmacotherapy: {meds}\n2. Diagnostic studies: {labs}\n3. Follow-up: {followup}\n4. Lifestyle modifications reviewed\n5. Warning signs explained - seek immediate care if {warning}",
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action } = await req.json();

    if (action === "clear") {
      // Clear existing demo data (in reverse order of dependencies)
      await supabase.from("phi_access_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("signature_log").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("note_amendments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("lab_results").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("lab_orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("prescriptions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("vital_signs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("clinical_notes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("diagnoses").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("immunizations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("allergies").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("medications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("appointments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("consent_records").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("attachments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("encounters").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("break_glass_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("patient_provider_assignments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("patients").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("providers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("user_roles").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      return new Response(
        JSON.stringify({ success: true, message: "Demo data cleared" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "seed") {
      const results: Record<string, number> = {};
      
      // Step 1: Create demo users via Auth API
      const demoUsers = [
        { email: "dr.chen@demo-ehr.com", password: "DemoPass123!", firstName: "Sarah", lastName: "Chen", role: "provider" as const, specialty: "Internal Medicine" },
        { email: "dr.rodriguez@demo-ehr.com", password: "DemoPass123!", firstName: "James", lastName: "Rodriguez", role: "provider" as const, specialty: "Family Medicine" },
        { email: "rn.santos@demo-ehr.com", password: "DemoPass123!", firstName: "Maria", lastName: "Santos", role: "provider" as const, specialty: "Registered Nurse" },
        { email: "rn.kim@demo-ehr.com", password: "DemoPass123!", firstName: "David", lastName: "Kim", role: "provider" as const, specialty: "Registered Nurse" },
        { email: "admin@demo-ehr.com", password: "DemoPass123!", firstName: "Admin", lastName: "User", role: "admin" as const },
        { email: "compliance@demo-ehr.com", password: "DemoPass123!", firstName: "Compliance", lastName: "Officer", role: "compliance_officer" as const },
      ];

      const createdUsers: { id: string; email: string; role: string; firstName: string; lastName: string; specialty?: string }[] = [];

      for (const user of demoUsers) {
        // Check if user already exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === user.email);
        
        if (existingUser) {
          createdUsers.push({ 
            id: existingUser.id, 
            email: user.email, 
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            specialty: user.specialty
          });
          continue;
        }

        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: { first_name: user.firstName, last_name: user.lastName }
        });

        if (authError) {
          console.error(`Error creating user ${user.email}:`, authError);
          continue;
        }

        if (authUser?.user) {
          createdUsers.push({ 
            id: authUser.user.id, 
            email: user.email, 
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            specialty: user.specialty
          });
        }
      }
      results.users = createdUsers.length;

      // Step 2: Assign roles
      for (const user of createdUsers) {
        await supabase.from("user_roles").upsert({
          user_id: user.id,
          role: user.role
        }, { onConflict: "user_id,role" });
      }
      results.roles = createdUsers.length;

      // Step 3: Create providers for physician/nurse users
      const providers: { id: string; userId: string; firstName: string; lastName: string }[] = [];
      const providerUsers = createdUsers.filter(u => u.role === "provider");
      
      for (const user of providerUsers) {
        const { data: provider, error } = await supabase.from("providers").upsert({
          user_id: user.id,
          first_name: user.firstName,
          last_name: user.lastName,
          specialty: user.specialty,
          email: user.email,
          npi: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          license_number: `MD${Math.floor(100000 + Math.random() * 900000)}`,
          license_state: "CA",
          department: user.specialty?.includes("Nurse") ? "Nursing" : "Medicine",
          is_active: true
        }, { onConflict: "user_id" }).select().single();

        if (provider) {
          providers.push({ 
            id: provider.id, 
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName
          });
        }
      }
      results.providers = providers.length;

      // Step 4: Create patient users and patient records
      const patientData: { userId: string; patientId: string; firstName: string; lastName: string }[] = [];
      
      // Create 5 patient portal users
      for (let i = 0; i < 5; i++) {
        const isMale = Math.random() > 0.5;
        const firstName = randomItem(isMale ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE);
        const lastName = randomItem(LAST_NAMES);
        const email = `patient${i + 1}@demo-ehr.com`;

        // Check if user exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        let userId: string;
        
        const existingUser = existingUsers?.users?.find(u => u.email === email);
        if (existingUser) {
          userId = existingUser.id;
        } else {
          const { data: authUser } = await supabase.auth.admin.createUser({
            email,
            password: "DemoPass123!",
            email_confirm: true,
            user_metadata: { first_name: firstName, last_name: lastName }
          });
          if (!authUser?.user) continue;
          userId = authUser.user.id;
          
          await supabase.from("user_roles").upsert({
            user_id: userId,
            role: "patient"
          }, { onConflict: "user_id,role" });
        }

        // Determine age group (these 5 are adults with portal access)
        const birthYear = 1960 + Math.floor(Math.random() * 40);
        const dob = `${birthYear}-${String(Math.floor(1 + Math.random() * 12)).padStart(2, "0")}-${String(Math.floor(1 + Math.random() * 28)).padStart(2, "0")}`;

        const { data: patient } = await supabase.from("patients").insert({
          user_id: userId,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dob,
          gender: isMale ? "Male" : "Female",
          mrn: generateMRN(),
          email,
          phone: generatePhone(),
          address_line1: `${Math.floor(100 + Math.random() * 9900)} ${randomItem(STREETS)}`,
          city: randomItem(CITIES),
          state: randomItem(STATES),
          zip_code: String(Math.floor(10000 + Math.random() * 89999)),
          emergency_contact_name: `${randomItem(FIRST_NAMES_MALE)} ${lastName}`,
          emergency_contact_phone: generatePhone(),
          insurance_provider: randomItem(INSURANCE_PROVIDERS),
          insurance_policy_number: `POL${Math.floor(100000000 + Math.random() * 900000000)}`
        }).select().single();

        if (patient) {
          patientData.push({ userId, patientId: patient.id, firstName, lastName });
        }
      }

      // Create additional patients without portal access (30 more for total of 35)
      for (let i = 0; i < 30; i++) {
        const isMale = Math.random() > 0.5;
        const firstName = randomItem(isMale ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE);
        const lastName = randomItem(LAST_NAMES);
        
        // Mix of ages: pediatric (5), adult (20), geriatric (5)
        let birthYear: number;
        if (i < 5) {
          // Pediatric (0-17 years)
          birthYear = 2010 + Math.floor(Math.random() * 14);
        } else if (i < 25) {
          // Adult (18-64 years)
          birthYear = 1960 + Math.floor(Math.random() * 42);
        } else {
          // Geriatric (65+ years)
          birthYear = 1935 + Math.floor(Math.random() * 25);
        }
        
        const dob = `${birthYear}-${String(Math.floor(1 + Math.random() * 12)).padStart(2, "0")}-${String(Math.floor(1 + Math.random() * 28)).padStart(2, "0")}`;

        const { data: patient } = await supabase.from("patients").insert({
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dob,
          gender: isMale ? "Male" : "Female",
          mrn: generateMRN(),
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
          phone: generatePhone(),
          address_line1: `${Math.floor(100 + Math.random() * 9900)} ${randomItem(STREETS)}`,
          city: randomItem(CITIES),
          state: randomItem(STATES),
          zip_code: String(Math.floor(10000 + Math.random() * 89999)),
          emergency_contact_name: `${randomItem(FIRST_NAMES_MALE)} ${lastName}`,
          emergency_contact_phone: generatePhone(),
          insurance_provider: randomItem(INSURANCE_PROVIDERS),
          insurance_policy_number: `POL${Math.floor(100000000 + Math.random() * 900000000)}`
        }).select().single();

        if (patient) {
          patientData.push({ userId: "", patientId: patient.id, firstName, lastName });
        }
      }
      results.patients = patientData.length;

      // Step 5: Create patient-provider assignments
      const physicianProviders = providers.filter(p => !p.lastName.includes("Santos") && !p.lastName.includes("Kim"));
      
      for (const patient of patientData) {
        // Assign primary physician
        const primaryProvider = randomItem(physicianProviders);
        await supabase.from("patient_provider_assignments").insert({
          patient_id: patient.patientId,
          provider_id: primaryProvider.id,
          relationship_type: "primary"
        });

        // 30% chance of consulting physician
        if (Math.random() < 0.3 && physicianProviders.length > 1) {
          const consultingProvider = physicianProviders.find(p => p.id !== primaryProvider.id);
          if (consultingProvider) {
            await supabase.from("patient_provider_assignments").insert({
              patient_id: patient.patientId,
              provider_id: consultingProvider.id,
              relationship_type: "consulting"
            });
          }
        }
      }
      results.assignments = patientData.length;

      // Step 6: Create allergies (for ~15 patients, 3-4 with drug allergies)
      let allergyCount = 0;
      for (let i = 0; i < 15; i++) {
        const patient = patientData[i];
        const numAllergies = Math.floor(1 + Math.random() * 3);
        const usedAllergens = new Set<string>();
        
        for (let j = 0; j < numAllergies; j++) {
          let allergyInfo = randomItem(ALLERGENS);
          while (usedAllergens.has(allergyInfo.allergen)) {
            allergyInfo = randomItem(ALLERGENS);
          }
          usedAllergens.add(allergyInfo.allergen);

          await supabase.from("allergies").insert({
            patient_id: patient.patientId,
            allergen: allergyInfo.allergen,
            reaction: allergyInfo.reaction,
            severity: allergyInfo.severity,
            status: "active",
            onset_date: randomDateOnly(new Date(2015, 0, 1), new Date()),
            verified_by: randomItem(providers).id,
            verified_at: randomDate(new Date(2023, 0, 1), new Date())
          });
          allergyCount++;
        }
      }
      results.allergies = allergyCount;

      // Step 7: Create medications (3-8 per patient)
      let medicationCount = 0;
      for (const patient of patientData) {
        const numMeds = Math.floor(3 + Math.random() * 6);
        const usedMeds = new Set<string>();
        
        for (let j = 0; j < numMeds; j++) {
          let med = randomItem(MEDICATIONS);
          while (usedMeds.has(med.name)) {
            med = randomItem(MEDICATIONS);
          }
          usedMeds.add(med.name);

          const startDate = randomDateOnly(new Date(2022, 0, 1), new Date());
          const isActive = Math.random() > 0.1;

          await supabase.from("medications").insert({
            patient_id: patient.patientId,
            medication_name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            route: med.route,
            start_date: startDate,
            end_date: isActive ? null : randomDateOnly(new Date(startDate), new Date()),
            status: isActive ? "active" : "discontinued",
            prescriber_id: randomItem(physicianProviders).id
          });
          medicationCount++;
        }
      }
      results.medications = medicationCount;

      // Step 8: Create immunizations (3+ per patient)
      let immunizationCount = 0;
      for (const patient of patientData) {
        const numVaccines = Math.floor(3 + Math.random() * 4);
        const usedVaccines = new Set<string>();
        
        for (let j = 0; j < numVaccines; j++) {
          let vaccine = randomItem(VACCINES);
          while (usedVaccines.has(vaccine.name)) {
            vaccine = randomItem(VACCINES);
          }
          usedVaccines.add(vaccine.name);

          await supabase.from("immunizations").insert({
            patient_id: patient.patientId,
            vaccine_name: vaccine.name,
            cvx_code: vaccine.cvx,
            administration_date: randomDateOnly(new Date(2020, 0, 1), new Date()),
            lot_number: `LOT${Math.floor(100000 + Math.random() * 900000)}`,
            site: randomItem(["Left Deltoid", "Right Deltoid", "Left Thigh", "Right Thigh"]),
            route: randomItem(["Intramuscular", "Subcutaneous"]),
            administered_by: randomItem(providers).id,
            ordering_provider: randomItem(physicianProviders).id,
            vis_given: true,
            vis_date: randomDateOnly(new Date(2020, 0, 1), new Date())
          });
          immunizationCount++;
        }
      }
      results.immunizations = immunizationCount;

      // Step 9: Create encounters (45 encounters distributed across patients)
      const encounters: { id: string; patientId: string; providerId: string; date: string }[] = [];
      const encounterTypes = ["Office Visit", "Annual Physical", "Follow-up", "Telemedicine", "Urgent Care"];
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      for (let i = 0; i < 45; i++) {
        const patient = randomItem(patientData);
        const provider = randomItem(physicianProviders);
        const encounterDate = randomDate(sixMonthsAgo, new Date());
        const status = i < 35 ? "completed" : (i < 40 ? "in-progress" : "scheduled");

        const { data: encounter } = await supabase.from("encounters").insert({
          patient_id: patient.patientId,
          provider_id: provider.id,
          encounter_type: randomItem(encounterTypes),
          encounter_date: encounterDate,
          chief_complaint: randomItem(CHIEF_COMPLAINTS),
          status,
          location: randomItem(["Main Clinic", "Telehealth", "Urgent Care Center"])
        }).select().single();

        if (encounter) {
          encounters.push({ 
            id: encounter.id, 
            patientId: patient.patientId, 
            providerId: provider.id,
            date: encounterDate
          });
        }
      }
      results.encounters = encounters.length;

      // Step 10: Create vital signs for encounters
      let vitalsCount = 0;
      for (const encounter of encounters) {
        const isAbnormal = Math.random() < 0.2;
        const bpSystolic = isAbnormal ? Math.floor(150 + Math.random() * 30) : Math.floor(110 + Math.random() * 20);
        const bpDiastolic = isAbnormal ? Math.floor(90 + Math.random() * 15) : Math.floor(70 + Math.random() * 10);
        
        await supabase.from("vital_signs").insert({
          encounter_id: encounter.id,
          patient_id: encounter.patientId,
          bp_systolic: bpSystolic,
          bp_diastolic: bpDiastolic,
          heart_rate: Math.floor(60 + Math.random() * 40),
          respiratory_rate: Math.floor(12 + Math.random() * 8),
          temperature_f: (97.0 + Math.random() * 2.5).toFixed(1),
          o2_saturation: Math.floor(95 + Math.random() * 5),
          weight_lbs: (120 + Math.random() * 100).toFixed(1),
          height_inches: Math.floor(60 + Math.random() * 16),
          pain_level: Math.floor(Math.random() * 6),
          recorded_by: randomItem(providers).id,
          recorded_at: encounter.date
        });
        vitalsCount++;
      }
      results.vitalSigns = vitalsCount;

      // Step 11: Create diagnoses for encounters
      let diagnosisCount = 0;
      for (const encounter of encounters) {
        const numDiagnoses = Math.floor(1 + Math.random() * 3);
        const usedCodes = new Set<string>();
        
        for (let j = 0; j < numDiagnoses; j++) {
          let diagnosis = randomItem(ICD10_CODES);
          while (usedCodes.has(diagnosis.code)) {
            diagnosis = randomItem(ICD10_CODES);
          }
          usedCodes.add(diagnosis.code);

          await supabase.from("diagnoses").insert({
            encounter_id: encounter.id,
            icd_code: diagnosis.code,
            description: diagnosis.description,
            status: Math.random() > 0.2 ? "active" : "resolved",
            diagnosis_date: encounter.date.split("T")[0]
          });
          diagnosisCount++;
        }
      }
      results.diagnoses = diagnosisCount;

      // Step 12: Create clinical notes (30 signed, 10 in-progress, 5 with amendments)
      let noteCount = 0;
      const completedEncounters = encounters.filter((_, i) => i < 35);
      
      for (let i = 0; i < completedEncounters.length; i++) {
        const encounter = completedEncounters[i];
        const isSigned = i < 30;
        const hasAmendment = i >= 25 && i < 30; // 5 notes with amendments
        
        const subjective = randomItem(SOAP_TEMPLATES.subjective)
          .replace("{complaint}", randomItem(CHIEF_COMPLAINTS).toLowerCase())
          .replace("{duration}", randomItem(["1 week", "2 weeks", "3 days", "1 month"]))
          .replace("{severity}", randomItem(["mild", "moderate", "severe"]))
          .replace("{associated}", randomItem(["fatigue", "nausea", "dizziness", "none"]))
          .replace("{painLevel}", String(Math.floor(1 + Math.random() * 8)))
          .replace("{aggravating}", randomItem(["movement", "standing", "eating", "stress"]))
          .replace("{relieving}", randomItem(["rest", "medication", "ice", "heat"]))
          .replace("{previous}", randomItem(["none", "1 previous episode", "recurrent"]));

        const objective = randomItem(SOAP_TEMPLATES.objective)
          .replace("{bp}", `${Math.floor(120 + Math.random() * 20)}/${Math.floor(70 + Math.random() * 10)}`);

        const diagnosis1 = randomItem(ICD10_CODES);
        const diagnosis2 = randomItem(ICD10_CODES);
        
        const assessment = randomItem(SOAP_TEMPLATES.assessment)
          .replace("{diagnosis1}", `${diagnosis1.code} - ${diagnosis1.description}`)
          .replace("{diagnosis2}", `${diagnosis2.code} - ${diagnosis2.description}`)
          .replace("{status1}", randomItem(["stable", "improving", "worsening"]))
          .replace("{status2}", randomItem(["stable", "controlled", "uncontrolled"]))
          .replace("{overall}", randomItem(["well", "adequately", "poorly"]))
          .replace("{progress}", randomItem(["good", "satisfactory", "slow"]));

        const plan = randomItem(SOAP_TEMPLATES.plan)
          .replace("{labs}", randomItem(["CBC, CMP", "Lipid panel", "HbA1c", "Thyroid panel"]))
          .replace("{followup}", randomItem(["2 weeks", "4 weeks", "3 months", "6 months"]))
          .replace("{education}", randomItem(["diet", "medication compliance", "exercise", "smoking cessation"]))
          .replace("{meds}", randomItem(["Continue current regimen", "Increase metformin to 1000mg", "Add lisinopril 10mg"]))
          .replace("{referral}", randomItem(["cardiology", "endocrinology", "orthopedics", "psychiatry"]))
          .replace("{warning}", randomItem(["chest pain", "severe shortness of breath", "high fever", "worsening symptoms"]));

        const signedAt = isSigned ? encounter.date : null;
        const signatureHash = isSigned ? `SHA256:${crypto.randomUUID().replace(/-/g, "")}` : null;

        const { data: note } = await supabase.from("clinical_notes").insert({
          encounter_id: encounter.id,
          author_id: encounter.providerId,
          note_type: randomItem(["Progress Note", "H&P", "Follow-up Note", "Consultation"]),
          soap_subjective: subjective,
          soap_objective: objective,
          soap_assessment: assessment,
          soap_plan: plan,
          is_signed: isSigned,
          signed_at: signedAt,
          signed_by: isSigned ? encounter.providerId : null,
          signature_hash: signatureHash,
          signature_timestamp: signedAt
        }).select().single();

        if (note) {
          noteCount++;

          // Create signature log for signed notes
          if (isSigned) {
            await supabase.from("signature_log").insert({
              note_id: note.id,
              signer_id: encounter.providerId,
              signed_at: signedAt,
              signature_hash: signatureHash!,
              content_hash: `SHA256:${crypto.randomUUID().replace(/-/g, "")}`,
              signature_method: "SHA-256",
              verification_status: "valid"
            });
          }

          // Create amendment for some notes
          if (hasAmendment && note) {
            const amendedDate = new Date(encounter.date);
            amendedDate.setDate(amendedDate.getDate() + 1);

            const { data: amendedNote } = await supabase.from("clinical_notes").insert({
              encounter_id: encounter.id,
              author_id: encounter.providerId,
              note_type: note.note_type,
              soap_subjective: note.soap_subjective,
              soap_objective: note.soap_objective,
              soap_assessment: note.soap_assessment + "\n\nAMENDMENT: Additional findings reviewed. Patient's condition reassessed.",
              soap_plan: note.soap_plan + "\n\nAMENDMENT: Updated follow-up schedule per patient request.",
              is_signed: true,
              signed_at: amendedDate.toISOString(),
              signed_by: encounter.providerId,
              is_amendment: true,
              amended_from_id: note.id,
              amendment_reason: randomItem([
                "Additional information received from specialist",
                "Correction of medication dosage",
                "Updated assessment based on lab results",
                "Patient provided additional history",
                "Clarification of treatment plan"
              ]),
              signature_hash: `SHA256:${crypto.randomUUID().replace(/-/g, "")}`,
              signature_timestamp: amendedDate.toISOString()
            }).select().single();

            if (amendedNote) {
              await supabase.from("note_amendments").insert({
                original_note_id: note.id,
                amended_note_id: amendedNote.id,
                amended_by: encounter.providerId,
                amendment_reason: amendedNote.amendment_reason!,
                amended_at: amendedDate.toISOString()
              });
              noteCount++;
            }
          }
        }
      }
      results.clinicalNotes = noteCount;

      // Step 13: Create lab orders and results
      let labOrderCount = 0;
      let labResultCount = 0;
      
      for (let i = 0; i < 20; i++) {
        const encounter = randomItem(encounters);
        const labTest = randomItem(LAB_TESTS);
        const isCompleted = i < 15;
        const hasCritical = i >= 13 && i < 15; // 2 critical results

        const { data: order } = await supabase.from("lab_orders").insert({
          patient_id: encounter.patientId,
          encounter_id: encounter.id,
          ordered_by: encounter.providerId,
          test_name: labTest.name,
          loinc_code: labTest.loinc,
          priority: i < 2 ? "stat" : "routine",
          status: isCompleted ? "completed" : "pending",
          fasting_required: labTest.name.includes("Lipid") || labTest.name.includes("Glucose"),
          ordered_at: encounter.date
        }).select().single();

        if (order) {
          labOrderCount++;

          // Create results for completed orders
          if (isCompleted) {
            for (const component of labTest.components) {
              let value: string;
              let abnormalFlag: string | null = null;
              let isCritical = false;

              if (component.name === "Glucose" || component.name === "Protein") {
                value = "Negative";
              } else {
                const range = component.normalMax - component.normalMin;
                let numValue: number;
                
                if (hasCritical && component.name === "Potassium") {
                  // Critical high potassium
                  numValue = 6.5 + Math.random() * 0.5;
                  abnormalFlag = "HH";
                  isCritical = true;
                } else if (Math.random() < 0.2) {
                  // Abnormal value
                  if (Math.random() > 0.5) {
                    numValue = component.normalMax + range * 0.2 * Math.random();
                    abnormalFlag = "H";
                  } else {
                    numValue = component.normalMin - range * 0.2 * Math.random();
                    abnormalFlag = "L";
                  }
                } else {
                  numValue = component.normalMin + Math.random() * range;
                }
                value = numValue.toFixed(1);
              }

              await supabase.from("lab_results").insert({
                order_id: order.id,
                test_component: component.name,
                value,
                unit: component.unit,
                reference_range: component.refRange,
                abnormal_flag: abnormalFlag,
                critical_value: isCritical,
                reviewed_by: isCritical ? null : encounter.providerId,
                reviewed_at: isCritical ? null : encounter.date
              });
              labResultCount++;
            }
          }
        }
      }
      results.labOrders = labOrderCount;
      results.labResults = labResultCount;

      // Step 14: Create prescriptions
      let prescriptionCount = 0;
      
      for (let i = 0; i < 45; i++) {
        const patient = randomItem(patientData);
        const provider = randomItem(physicianProviders);
        const isControlled = i >= 40; // 5 controlled substances
        const med = isControlled ? randomItem(CONTROLLED_MEDICATIONS) : randomItem(MEDICATIONS);
        const status = i < 35 ? randomItem(["sent", "filled"]) : (i < 40 ? "pending" : "pending");

        await supabase.from("prescriptions").insert({
          patient_id: patient.patientId,
          prescriber_id: provider.id,
          drug_name: med.name,
          sig: `Take ${med.dosage} ${med.frequency}`,
          quantity: Math.floor(30 + Math.random() * 60),
          quantity_unit: med.name.includes("Albuterol") ? "inhalers" : "tablets",
          refills: isControlled ? 0 : Math.floor(Math.random() * 4),
          days_supply: 30,
          dea_schedule: isControlled ? (med as typeof CONTROLLED_MEDICATIONS[0]).schedule : null,
          status,
          dispense_as_written: Math.random() < 0.1,
          pharmacy_name: randomItem(["CVS Pharmacy", "Walgreens", "Rite Aid", "Costco Pharmacy", "Express Scripts"]),
          pharmacy_address: `${Math.floor(100 + Math.random() * 9900)} ${randomItem(STREETS)}, ${randomItem(CITIES)}, ${randomItem(STATES)}`,
          sent_at: status !== "pending" ? randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()) : null
        });
        prescriptionCount++;
      }
      results.prescriptions = prescriptionCount;

      // Step 15: Create appointments
      let appointmentCount = 0;
      const now = new Date();
      const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // 15 upcoming appointments
      for (let i = 0; i < 15; i++) {
        const patient = randomItem(patientData);
        const provider = randomItem(physicianProviders);
        const startTime = randomDate(now, twoWeeksLater);
        const endTime = new Date(new Date(startTime).getTime() + 30 * 60 * 1000).toISOString();

        await supabase.from("appointments").insert({
          patient_id: patient.patientId,
          provider_id: provider.id,
          appointment_type: randomItem(["Office Visit", "Follow-up", "Annual Physical", "Consultation"]),
          start_time: startTime,
          end_time: endTime,
          status: "scheduled",
          visit_reason: randomItem(CHIEF_COMPLAINTS),
          is_telehealth: Math.random() < 0.2,
          room: `Room ${Math.floor(1 + Math.random() * 10)}`
        });
        appointmentCount++;
      }

      // 10 completed appointments (past week)
      for (let i = 0; i < 10; i++) {
        const patient = randomItem(patientData);
        const provider = randomItem(physicianProviders);
        const startTime = randomDate(oneWeekAgo, now);
        const endTime = new Date(new Date(startTime).getTime() + 30 * 60 * 1000).toISOString();

        await supabase.from("appointments").insert({
          patient_id: patient.patientId,
          provider_id: provider.id,
          appointment_type: randomItem(["Office Visit", "Follow-up", "Annual Physical"]),
          start_time: startTime,
          end_time: endTime,
          status: "completed",
          visit_reason: randomItem(CHIEF_COMPLAINTS),
          check_in_time: startTime,
          check_out_time: endTime,
          room: `Room ${Math.floor(1 + Math.random() * 10)}`
        });
        appointmentCount++;
      }

      // 3 no-shows
      for (let i = 0; i < 3; i++) {
        const patient = randomItem(patientData);
        const provider = randomItem(physicianProviders);
        const startTime = randomDate(oneWeekAgo, now);
        const endTime = new Date(new Date(startTime).getTime() + 30 * 60 * 1000).toISOString();

        await supabase.from("appointments").insert({
          patient_id: patient.patientId,
          provider_id: provider.id,
          appointment_type: "Follow-up",
          start_time: startTime,
          end_time: endTime,
          status: "no-show",
          visit_reason: randomItem(CHIEF_COMPLAINTS)
        });
        appointmentCount++;
      }

      // 2 cancelled appointments
      for (let i = 0; i < 2; i++) {
        const patient = randomItem(patientData);
        const provider = randomItem(physicianProviders);
        const startTime = randomDate(now, twoWeeksLater);
        const endTime = new Date(new Date(startTime).getTime() + 30 * 60 * 1000).toISOString();

        await supabase.from("appointments").insert({
          patient_id: patient.patientId,
          provider_id: provider.id,
          appointment_type: "Office Visit",
          start_time: startTime,
          end_time: endTime,
          status: "cancelled",
          cancellation_reason: randomItem(["Patient requested", "Provider unavailable", "Insurance issue"]),
          cancelled_at: new Date().toISOString()
        });
        appointmentCount++;
      }
      results.appointments = appointmentCount;

      // Step 16: Create consent records
      let consentCount = 0;
      const consentTypes = ["HIPAA Notice of Privacy Practices", "Treatment Consent", "Release of Information", "Telemedicine Consent"];
      
      for (const patient of patientData) {
        // All patients get HIPAA and treatment consent
        await supabase.from("consent_records").insert({
          patient_id: patient.patientId,
          consent_type: "HIPAA Notice of Privacy Practices",
          granted_at: randomDate(new Date(2023, 0, 1), new Date()),
          purpose: "Acknowledgment of privacy practices"
        });
        consentCount++;

        await supabase.from("consent_records").insert({
          patient_id: patient.patientId,
          consent_type: "Treatment Consent",
          granted_at: randomDate(new Date(2023, 0, 1), new Date()),
          purpose: "General consent for medical treatment"
        });
        consentCount++;
      }

      // 5 patients with Release of Information
      for (let i = 0; i < Math.min(5, patientData.length); i++) {
        const patient = patientData[i];
        if (!patient) continue;
        await supabase.from("consent_records").insert({
          patient_id: patient.patientId,
          consent_type: "Release of Information",
          granted_at: randomDate(new Date(2024, 0, 1), new Date()),
          purpose: "Release records to specialist",
          expiration_date: randomDateOnly(new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))
        });
        consentCount++;
      }

      // 3 patients with telemedicine consent
      for (let i = 5; i < Math.min(8, patientData.length); i++) {
        const patient = patientData[i];
        if (!patient) continue;
        await supabase.from("consent_records").insert({
          patient_id: patient.patientId,
          consent_type: "Telemedicine Consent",
          granted_at: randomDate(new Date(2024, 0, 1), new Date()),
          purpose: "Consent for telemedicine visits"
        });
        consentCount++;
      }

      // 1 revoked consent
      if (patientData.length > 10) {
        await supabase.from("consent_records").insert({
          patient_id: patientData[10].patientId,
          consent_type: "Release of Information",
          granted_at: randomDate(new Date(2023, 0, 1), new Date(2024, 0, 1)),
          revoked_at: randomDate(new Date(2024, 6, 1), new Date()),
          purpose: "Release records to insurance - REVOKED"
        });
        consentCount++;
      }
      results.consents = consentCount;

      // Step 17: Create PHI access logs (200+ entries)
      let auditCount = 0;
      const actions = ["SELECT", "INSERT", "UPDATE", "view", "create", "sign"];
      const resourceTypes = ["patients", "encounters", "clinical_notes", "medications", "lab_results", "prescriptions"];

      for (let i = 0; i < 200; i++) {
        const user = randomItem(createdUsers);
        const patient = randomItem(patientData);
        const action = randomItem(actions);
        const resourceType = randomItem(resourceTypes);
        const timestamp = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());

        await supabase.from("phi_access_logs").insert({
          user_id: user.id,
          patient_id: patient.patientId,
          action,
          resource_type: resourceType,
          access_reason: randomItem([
            "Patient care",
            "Treatment",
            "Review lab results",
            "Medication management",
            "Documentation",
            "Follow-up care"
          ]),
          timestamp
        });
        auditCount++;
      }

      // Add failed login attempts
      for (let i = 0; i < 3; i++) {
        const user = randomItem(createdUsers);
        await supabase.from("phi_access_logs").insert({
          user_id: user.id,
          action: "FAILED_LOGIN",
          resource_type: "authentication",
          access_reason: "Invalid password attempt",
          timestamp: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date())
        });
        auditCount++;
      }
      results.auditLogs = auditCount;

      // Step 18: Create break glass logs (1-2 emergency access events)
      for (let i = 0; i < 2; i++) {
        const user = randomItem(createdUsers.filter(u => u.role === "provider"));
        const patient = randomItem(patientData);
        
        await supabase.from("break_glass_logs").insert({
          user_id: user.id,
          patient_id: patient.patientId,
          access_reason: randomItem(["Medical Emergency", "Urgent Care Required"]),
          justification: randomItem([
            "Patient presented with acute symptoms requiring immediate access to medical history",
            "Emergency department consultation requested, patient unable to consent",
            "Critical medication interaction check required during emergency admission"
          ]),
          accessed_at: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
        });
      }
      results.breakGlassLogs = 2;

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Demo data seeded successfully",
          results,
          credentials: {
            physicians: [
              { email: "dr.chen@demo-ehr.com", password: "DemoPass123!", role: "Provider (Physician)" },
              { email: "dr.rodriguez@demo-ehr.com", password: "DemoPass123!", role: "Provider (Physician)" }
            ],
            nurses: [
              { email: "rn.santos@demo-ehr.com", password: "DemoPass123!", role: "Provider (Nurse)" },
              { email: "rn.kim@demo-ehr.com", password: "DemoPass123!", role: "Provider (Nurse)" }
            ],
            admin: { email: "admin@demo-ehr.com", password: "DemoPass123!", role: "Admin" },
            compliance: { email: "compliance@demo-ehr.com", password: "DemoPass123!", role: "Compliance Officer" },
            patients: Array.from({ length: 5 }, (_, i) => ({
              email: `patient${i + 1}@demo-ehr.com`,
              password: "DemoPass123!",
              role: "Patient"
            }))
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'seed' or 'clear'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error in seed-demo-data:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
