

# Step 1: Core Database Tables DDL

## Implementation Scope (Step 1 Only)

Creating PostgreSQL DDL for the foundational HIPAA-compliant EHR tables:

### Tables to Create

1. **user_roles** - Enum-based role assignment table
   - Links auth.users to defined roles (patient, provider, admin, compliance_officer)
   - Prevents privilege escalation by separating from profiles
   - Supports multiple roles per user if needed

2. **patients** - Core patient demographics table
   - PHI fields marked with comments for future encryption
   - Soft delete support (deleted_at column)
   - Links to auth.users for patient portal access

3. **providers** - Clinical staff table
   - License and NPI tracking
   - Specialty and department assignment
   - Active status management

4. **patient_provider_assignments** - Least-privilege access control
   - Links patients to their authorized providers
   - Relationship types (primary, consulting, specialist)
   - Assignment audit trail (who assigned, when revoked)

### Exclusions (Per Instructions)
- No RLS policies
- No triggers
- No audit logs
- No encryption logic
- No Edge Functions

### Output Format
Single Supabase migration file with minimal inline comments

