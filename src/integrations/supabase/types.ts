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
