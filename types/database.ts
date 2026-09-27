/**
 * Tipos do banco (formato `supabase gen types typescript`).
 *
 * FUNDAÇÃO: escrito à mão espelhando supabase/migrations/2026092700*.sql, pois
 * ainda não há projeto Supabase remoto. Assim que houver credenciais, substituir
 * por `npm run db:types` (gerado a partir do schema real) — ver README.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type AppRole = "timp_admin" | "timp_operator" | "timp_technician" | "client_admin" | "client_user"
type AccessStatus = "pending_approval" | "active" | "suspended" | "blocked" | "revoked"

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          legal_name: string
          trade_name: string | null
          cnpj: string
          status: "active" | "inactive"
          signup_enabled: boolean
          signup_enabled_at: string | null
          signup_enabled_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          legal_name: string
          trade_name?: string | null
          cnpj: string
          status?: "active" | "inactive"
          signup_enabled?: boolean
        }
        Update: {
          legal_name?: string
          trade_name?: string | null
          status?: "active" | "inactive"
          signup_enabled?: boolean
        }
        Relationships: []
      }
      units: {
        Row: {
          id: string
          company_id: string
          name: string
          code: string | null
          status: "active" | "inactive"
          created_at: string
          updated_at: string
        }
        Insert: {
          company_id: string
          name: string
          code?: string | null
          status?: "active" | "inactive"
        }
        Update: {
          name?: string
          code?: string | null
          status?: "active" | "inactive"
        }
        Relationships: [
          {
            foreignKeyName: "units_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          timp_role: AppRole | null
          status: AccessStatus
          status_reason: string | null
          status_changed_at: string | null
          status_changed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: never
        Update: {
          full_name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      company_memberships: {
        Row: {
          id: string
          user_id: string
          company_id: string
          role: AppRole
          status: AccessStatus
          requested_at: string
          approved_at: string | null
          approved_by: string | null
          status_reason: string | null
          status_changed_at: string | null
          status_changed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: never
        Update: never
        Relationships: [
          {
            foreignKeyName: "company_memberships_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_units: {
        Row: {
          membership_id: string
          unit_id: string
          company_id: string
          created_at: string
          created_by: string | null
        }
        Insert: never
        Update: never
        Relationships: [
          {
            foreignKeyName: "membership_units_membership_fk"
            columns: ["membership_id", "company_id"]
            isOneToOne: false
            referencedRelation: "company_memberships"
            referencedColumns: ["id", "company_id"]
          },
          {
            foreignKeyName: "membership_units_unit_fk"
            columns: ["unit_id", "company_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id", "company_id"]
          },
        ]
      }
      audit_log: {
        Row: {
          id: number
          occurred_at: string
          actor_id: string | null
          actor_role: AppRole | null
          company_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          result: "success" | "denied" | "failure"
          origin: "web" | "api" | "system" | "database" | "gateway"
          request_id: string | null
          ip: string | null
          user_agent: string | null
          metadata: Json
        }
        Insert: {
          actor_id?: string | null
          actor_role?: AppRole | null
          company_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          result: "success" | "denied" | "failure"
          origin: "web" | "api" | "system" | "database" | "gateway"
          request_id?: string | null
          ip?: string | null
          user_agent?: string | null
          metadata?: Json
        }
        Update: never
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      request_company_membership: { Args: { p_cnpj: string }; Returns: string }
      approve_membership: { Args: { p_membership_id: string }; Returns: undefined }
      reject_membership: { Args: { p_membership_id: string; p_reason: string }; Returns: undefined }
      set_membership_status: {
        Args: { p_membership_id: string; p_status: AccessStatus; p_reason: string }
        Returns: undefined
      }
      set_profile_status: { Args: { p_user_id: string; p_status: AccessStatus; p_reason: string }; Returns: undefined }
      set_membership_role: { Args: { p_membership_id: string; p_role: AppRole }; Returns: undefined }
      set_timp_role: { Args: { p_user_id: string; p_role: AppRole | null }; Returns: undefined }
      set_membership_units: { Args: { p_membership_id: string; p_unit_ids: string[] }; Returns: undefined }
    }
    Enums: {
      app_role: AppRole
      access_status: AccessStatus
      company_status: "active" | "inactive"
      unit_status: "active" | "inactive"
      audit_result: "success" | "denied" | "failure"
    }
    CompositeTypes: { [_ in never]: never }
  }
}
