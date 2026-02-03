export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      allergies: {
        Row: {
          allergen: string
          created_at: string
          id: string
          notes: string | null
          onset_date: string | null
          patient_id: string
          reaction: string | null
          severity: string | null
          status: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          allergen: string
          created_at?: string
          id?: string
          notes?: string | null
          onset_date?: string | null
          patient_id: string
          reaction?: string | null
          severity?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          allergen?: string
          created_at?: string
          id?: string
          notes?: string | null
          onset_date?: string | null
          patient_id?: string
          reaction?: string | null
          severity?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "allergies_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allergies_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_type: string
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          end_time: string
          id: string
          is_telehealth: boolean | null
          notes: string | null
          patient_id: string
          provider_id: string
          reminder_sent_at: string | null
          reminder_type: string | null
          room: string | null
          start_time: string
          status: string
          telehealth_link: string | null
          updated_at: string
          visit_reason: string | null
        }
        Insert: {
          appointment_type: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          end_time: string
          id?: string
          is_telehealth?: boolean | null
          notes?: string | null
          patient_id: string
          provider_id: string
          reminder_sent_at?: string | null
          reminder_type?: string | null
          room?: string | null
          start_time: string
          status?: string
          telehealth_link?: string | null
          updated_at?: string
          visit_reason?: string | null
        }
        Update: {
          appointment_type?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          end_time?: string
          id?: string
          is_telehealth?: boolean | null
          notes?: string | null
          patient_id?: string
          provider_id?: string
          reminder_sent_at?: string | null
          reminder_type?: string | null
          room?: string | null
          start_time?: string
          status?: string
          telehealth_link?: string | null
          updated_at?: string
          visit_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          content_hash: string | null
          description: string | null
          encounter_id: string | null
          file_name: string
          file_path: string
          file_size_bytes: number | null
          file_type: string
          id: string
          patient_id: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          content_hash?: string | null
          description?: string | null
          encounter_id?: string | null
          file_name: string
          file_path: string
          file_size_bytes?: number | null
          file_type: string
          id?: string
          patient_id: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          content_hash?: string | null
          description?: string | null
          encounter_id?: string | null
          file_name?: string
          file_path?: string
          file_size_bytes?: number | null
          file_type?: string
          id?: string
          patient_id?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      break_glass_logs: {
        Row: {
          access_reason: string
          accessed_at: string
          id: string
          justification: string
          patient_id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          user_id: string
        }
        Insert: {
          access_reason: string
          accessed_at?: string
          id?: string
          justification: string
          patient_id: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          user_id: string
        }
        Update: {
          access_reason?: string
          accessed_at?: string
          id?: string
          justification?: string
          patient_id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "break_glass_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_notes: {
        Row: {
          author_id: string
          content_encrypted: string | null
          created_at: string
          encounter_id: string
          id: string
          note_type: string
          signed_at: string | null
          signed_by: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          content_encrypted?: string | null
          created_at?: string
          encounter_id: string
          id?: string
          note_type: string
          signed_at?: string | null
          signed_by?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          content_encrypted?: string | null
          created_at?: string
          encounter_id?: string
          id?: string
          note_type?: string
          signed_at?: string | null
          signed_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_signed_by_fkey"
            columns: ["signed_by"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_records: {
        Row: {
          consent_type: string
          document_path: string | null
          expiration_date: string | null
          granted_at: string
          granted_to: string | null
          id: string
          patient_id: string
          purpose: string | null
          revoked_at: string | null
        }
        Insert: {
          consent_type: string
          document_path?: string | null
          expiration_date?: string | null
          granted_at?: string
          granted_to?: string | null
          id?: string
          patient_id: string
          purpose?: string | null
          revoked_at?: string | null
        }
        Update: {
          consent_type?: string
          document_path?: string | null
          expiration_date?: string | null
          granted_at?: string
          granted_to?: string | null
          id?: string
          patient_id?: string
          purpose?: string | null
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnoses: {
        Row: {
          created_at: string
          description: string | null
          diagnosis_date: string
          encounter_id: string
          icd_code: string
          id: string
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          diagnosis_date?: string
          encounter_id: string
          icd_code: string
          id?: string
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          diagnosis_date?: string
          encounter_id?: string
          icd_code?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnoses_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
        ]
      }
      encounters: {
        Row: {
          chief_complaint: string | null
          created_at: string
          encounter_date: string
          encounter_type: string
          id: string
          location: string | null
          patient_id: string
          provider_id: string
          status: string
          updated_at: string
        }
        Insert: {
          chief_complaint?: string | null
          created_at?: string
          encounter_date?: string
          encounter_type: string
          id?: string
          location?: string | null
          patient_id: string
          provider_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          chief_complaint?: string | null
          created_at?: string
          encounter_date?: string
          encounter_type?: string
          id?: string
          location?: string | null
          patient_id?: string
          provider_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "encounters_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounters_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      immunizations: {
        Row: {
          administered_by: string | null
          administration_date: string
          created_at: string
          cvx_code: string | null
          dose: string | null
          dose_number: number | null
          encounter_id: string | null
          expiration_date: string | null
          id: string
          lot_number: string | null
          manufacturer: string | null
          notes: string | null
          ordering_provider: string | null
          patient_id: string
          reaction: string | null
          route: string | null
          series_complete: boolean | null
          site: string | null
          updated_at: string
          vaccine_name: string
          vis_date: string | null
          vis_given: boolean | null
        }
        Insert: {
          administered_by?: string | null
          administration_date: string
          created_at?: string
          cvx_code?: string | null
          dose?: string | null
          dose_number?: number | null
          encounter_id?: string | null
          expiration_date?: string | null
          id?: string
          lot_number?: string | null
          manufacturer?: string | null
          notes?: string | null
          ordering_provider?: string | null
          patient_id: string
          reaction?: string | null
          route?: string | null
          series_complete?: boolean | null
          site?: string | null
          updated_at?: string
          vaccine_name: string
          vis_date?: string | null
          vis_given?: boolean | null
        }
        Update: {
          administered_by?: string | null
          administration_date?: string
          created_at?: string
          cvx_code?: string | null
          dose?: string | null
          dose_number?: number | null
          encounter_id?: string | null
          expiration_date?: string | null
          id?: string
          lot_number?: string | null
          manufacturer?: string | null
          notes?: string | null
          ordering_provider?: string | null
          patient_id?: string
          reaction?: string | null
          route?: string | null
          series_complete?: boolean | null
          site?: string | null
          updated_at?: string
          vaccine_name?: string
          vis_date?: string | null
          vis_given?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "immunizations_administered_by_fkey"
            columns: ["administered_by"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "immunizations_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "immunizations_ordering_provider_fkey"
            columns: ["ordering_provider"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "immunizations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_orders: {
        Row: {
          collection_instructions: string | null
          created_at: string
          encounter_id: string | null
          fasting_required: boolean | null
          id: string
          loinc_code: string | null
          notes: string | null
          ordered_at: string
          ordered_by: string
          patient_id: string
          priority: string
          scheduled_date: string | null
          specimen_type: string | null
          status: string
          test_name: string
          updated_at: string
        }
        Insert: {
          collection_instructions?: string | null
          created_at?: string
          encounter_id?: string | null
          fasting_required?: boolean | null
          id?: string
          loinc_code?: string | null
          notes?: string | null
          ordered_at?: string
          ordered_by: string
          patient_id: string
          priority?: string
          scheduled_date?: string | null
          specimen_type?: string | null
          status?: string
          test_name: string
          updated_at?: string
        }
        Update: {
          collection_instructions?: string | null
          created_at?: string
          encounter_id?: string | null
          fasting_required?: boolean | null
          id?: string
          loinc_code?: string | null
          notes?: string | null
          ordered_at?: string
          ordered_by?: string
          patient_id?: string
          priority?: string
          scheduled_date?: string | null
          specimen_type?: string | null
          status?: string
          test_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_orders_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_ordered_by_fkey"
            columns: ["ordered_by"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_results: {
        Row: {
          abnormal_flag: string | null
          comments: string | null
          critical_notified_at: string | null
          critical_notified_to: string | null
          critical_value: boolean | null
          id: string
          order_id: string
          reference_range: string | null
          resulted_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          test_component: string
          unit: string | null
          value: string
        }
        Insert: {
          abnormal_flag?: string | null
          comments?: string | null
          critical_notified_at?: string | null
          critical_notified_to?: string | null
          critical_value?: boolean | null
          id?: string
          order_id: string
          reference_range?: string | null
          resulted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          test_component: string
          unit?: string | null
          value: string
        }
        Update: {
          abnormal_flag?: string | null
          comments?: string | null
          critical_notified_at?: string | null
          critical_notified_to?: string | null
          critical_value?: boolean | null
          id?: string
          order_id?: string
          reference_range?: string | null
          resulted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          test_component?: string
          unit?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_results_critical_notified_to_fkey"
            columns: ["critical_notified_to"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "lab_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string
          dosage: string | null
          encounter_id: string | null
          end_date: string | null
          frequency: string | null
          id: string
          medication_name: string
          patient_id: string
          prescriber_id: string | null
          route: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          encounter_id?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          medication_name: string
          patient_id: string
          prescriber_id?: string | null
          route?: string | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosage?: string | null
          encounter_id?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          medication_name?: string
          patient_id?: string
          prescriber_id?: string | null
          route?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medications_prescriber_id_fkey"
            columns: ["prescriber_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_provider_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          notes: string | null
          patient_id: string
          provider_id: string
          relationship_type: Database["public"]["Enums"]["relationship_type"]
          revoked_at: string | null
          revoked_by: string | null
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          provider_id: string
          relationship_type?: Database["public"]["Enums"]["relationship_type"]
          revoked_at?: string | null
          revoked_by?: string | null
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          provider_id?: string
          relationship_type?: Database["public"]["Enums"]["relationship_type"]
          revoked_at?: string | null
          revoked_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_provider_assignments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_provider_assignments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string
          date_of_birth: string
          deleted_at: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          gender: string | null
          id: string
          insurance_policy_number: string | null
          insurance_provider: string | null
          last_name: string
          mrn: string
          phone: string | null
          state: string | null
          updated_at: string
          user_id: string | null
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          date_of_birth: string
          deleted_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          gender?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          last_name: string
          mrn: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string | null
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string
          deleted_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          last_name?: string
          mrn?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      phi_access_logs: {
        Row: {
          access_reason: string | null
          action: string
          id: string
          ip_address: unknown
          patient_id: string | null
          request_hash: string | null
          resource_id: string | null
          resource_type: string
          session_id: string | null
          timestamp: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          access_reason?: string | null
          action: string
          id?: string
          ip_address?: unknown
          patient_id?: string | null
          request_hash?: string | null
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          access_reason?: string | null
          action?: string
          id?: string
          ip_address?: unknown
          patient_id?: string | null
          request_hash?: string | null
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          created_at: string
          days_supply: number | null
          dea_schedule: string | null
          dispense_as_written: boolean | null
          drug_name: string
          drug_ndc: string | null
          encounter_id: string | null
          epcs_signature: string | null
          id: string
          medication_id: string | null
          notes: string | null
          patient_id: string
          pharmacy_address: string | null
          pharmacy_name: string | null
          pharmacy_npi: string | null
          prescriber_id: string
          quantity: number
          quantity_unit: string | null
          refills: number
          sent_at: string | null
          sig: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          days_supply?: number | null
          dea_schedule?: string | null
          dispense_as_written?: boolean | null
          drug_name: string
          drug_ndc?: string | null
          encounter_id?: string | null
          epcs_signature?: string | null
          id?: string
          medication_id?: string | null
          notes?: string | null
          patient_id: string
          pharmacy_address?: string | null
          pharmacy_name?: string | null
          pharmacy_npi?: string | null
          prescriber_id: string
          quantity: number
          quantity_unit?: string | null
          refills?: number
          sent_at?: string | null
          sig: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          days_supply?: number | null
          dea_schedule?: string | null
          dispense_as_written?: boolean | null
          drug_name?: string
          drug_ndc?: string | null
          encounter_id?: string | null
          epcs_signature?: string | null
          id?: string
          medication_id?: string | null
          notes?: string | null
          patient_id?: string
          pharmacy_address?: string | null
          pharmacy_name?: string | null
          pharmacy_npi?: string | null
          prescriber_id?: string
          quantity?: number
          quantity_unit?: string | null
          refills?: number
          sent_at?: string | null
          sig?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_prescriber_id_fkey"
            columns: ["prescriber_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          created_at: string
          department: string | null
          email: string | null
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          license_number: string | null
          license_state: string | null
          npi: string | null
          phone: string | null
          specialty: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_active?: boolean
          last_name: string
          license_number?: string | null
          license_state?: string | null
          npi?: string | null
          phone?: string | null
          specialty?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          license_number?: string | null
          license_state?: string | null
          npi?: string | null
          phone?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vital_signs: {
        Row: {
          bmi: number | null
          bp_diastolic: number | null
          bp_systolic: number | null
          encounter_id: string
          heart_rate: number | null
          height_inches: number | null
          id: string
          notes: string | null
          o2_saturation: number | null
          pain_level: number | null
          patient_id: string
          recorded_at: string
          recorded_by: string
          respiratory_rate: number | null
          temperature_f: number | null
          weight_lbs: number | null
        }
        Insert: {
          bmi?: number | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          encounter_id: string
          heart_rate?: number | null
          height_inches?: number | null
          id?: string
          notes?: string | null
          o2_saturation?: number | null
          pain_level?: number | null
          patient_id: string
          recorded_at?: string
          recorded_by: string
          respiratory_rate?: number | null
          temperature_f?: number | null
          weight_lbs?: number | null
        }
        Update: {
          bmi?: number | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          encounter_id?: string
          heart_rate?: number | null
          height_inches?: number | null
          id?: string
          notes?: string | null
          o2_saturation?: number | null
          pain_level?: number | null
          patient_id?: string
          recorded_at?: string
          recorded_by?: string
          respiratory_rate?: number | null
          temperature_f?: number | null
          weight_lbs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vital_signs_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vital_signs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vital_signs_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_assigned_provider: {
        Args: { _patient_id: string; _user_id: string }
        Returns: boolean
      }
      is_encounter_patient: {
        Args: { _encounter_id: string; _user_id: string }
        Returns: boolean
      }
      is_encounter_provider: {
        Args: { _encounter_id: string; _user_id: string }
        Returns: boolean
      }
      is_patient_for_assignment: {
        Args: { _assignment_id: string; _user_id: string }
        Returns: boolean
      }
      is_patient_for_lab_order: {
        Args: { _order_id: string; _user_id: string }
        Returns: boolean
      }
      is_provider_for_assignment: {
        Args: { _assignment_id: string; _user_id: string }
        Returns: boolean
      }
      log_phi_access: {
        Args: {
          _access_reason?: string
          _action: string
          _ip_address?: unknown
          _patient_id: string
          _request_hash?: string
          _resource_id: string
          _resource_type: string
          _session_id?: string
          _user_agent?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "patient" | "provider" | "admin" | "compliance_officer"
      relationship_type: "primary" | "consulting" | "specialist"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["patient", "provider", "admin", "compliance_officer"],
      relationship_type: ["primary", "consulting", "specialist"],
    },
  },
} as const
