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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_role: Database["public"]["Enums"]["app_role"] | null
          company_id: string | null
          entity_id: string | null
          entity_type: string
          id: number
          ip: unknown
          metadata: Json
          occurred_at: string
          origin: string
          request_id: string | null
          result: Database["public"]["Enums"]["audit_result"]
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_role?: Database["public"]["Enums"]["app_role"] | null
          company_id?: string | null
          entity_id?: string | null
          entity_type: string
          id?: never
          ip?: unknown
          metadata?: Json
          occurred_at?: string
          origin: string
          request_id?: string | null
          result: Database["public"]["Enums"]["audit_result"]
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_role?: Database["public"]["Enums"]["app_role"] | null
          company_id?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: never
          ip?: unknown
          metadata?: Json
          occurred_at?: string
          origin?: string
          request_id?: string | null
          result?: Database["public"]["Enums"]["audit_result"]
          user_agent?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          cnpj: string
          created_at: string
          id: string
          legal_name: string
          signup_enabled: boolean
          signup_enabled_at: string | null
          signup_enabled_by: string | null
          status: Database["public"]["Enums"]["company_status"]
          trade_name: string | null
          updated_at: string
        }
        Insert: {
          cnpj: string
          created_at?: string
          id?: string
          legal_name: string
          signup_enabled?: boolean
          signup_enabled_at?: string | null
          signup_enabled_by?: string | null
          status?: Database["public"]["Enums"]["company_status"]
          trade_name?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string
          created_at?: string
          id?: string
          legal_name?: string
          signup_enabled?: boolean
          signup_enabled_at?: string | null
          signup_enabled_by?: string | null
          status?: Database["public"]["Enums"]["company_status"]
          trade_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      company_memberships: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string
          created_at: string
          id: string
          requested_at: string
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["access_status"]
          status_changed_at: string | null
          status_changed_by: string | null
          status_reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          created_at?: string
          id?: string
          requested_at?: string
          role: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["access_status"]
          status_changed_at?: string | null
          status_changed_by?: string | null
          status_reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string
          id?: string
          requested_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["access_status"]
          status_changed_at?: string | null
          status_changed_by?: string | null
          status_reason?: string | null
          updated_at?: string
          user_id?: string
        }
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
          company_id: string
          created_at: string
          created_by: string | null
          membership_id: string
          unit_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          membership_id: string
          unit_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          membership_id?: string
          unit_id?: string
        }
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
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          status: Database["public"]["Enums"]["access_status"]
          status_changed_at: string | null
          status_changed_by: string | null
          status_reason: string | null
          timp_role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          status?: Database["public"]["Enums"]["access_status"]
          status_changed_at?: string | null
          status_changed_by?: string | null
          status_reason?: string | null
          timp_role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["access_status"]
          status_changed_at?: string | null
          status_changed_by?: string | null
          status_reason?: string | null
          timp_role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          code: string | null
          company_id: string
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["unit_status"]
          updated_at: string
        }
        Insert: {
          code?: string | null
          company_id: string
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["unit_status"]
          updated_at?: string
        }
        Update: {
          code?: string | null
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["unit_status"]
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_membership: {
        Args: { p_membership_id: string }
        Returns: undefined
      }
      reject_membership: {
        Args: { p_membership_id: string; p_reason: string }
        Returns: undefined
      }
      request_company_membership: { Args: { p_cnpj: string }; Returns: string }
      set_membership_role: {
        Args: {
          p_membership_id: string
          p_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: undefined
      }
      set_membership_status: {
        Args: {
          p_membership_id: string
          p_reason: string
          p_status: Database["public"]["Enums"]["access_status"]
        }
        Returns: undefined
      }
      set_membership_units: {
        Args: { p_membership_id: string; p_unit_ids: string[] }
        Returns: undefined
      }
      set_profile_status: {
        Args: {
          p_reason: string
          p_status: Database["public"]["Enums"]["access_status"]
          p_user_id: string
        }
        Returns: undefined
      }
      set_timp_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      access_status:
        | "pending_approval"
        | "active"
        | "suspended"
        | "blocked"
        | "revoked"
      app_role:
        | "timp_admin"
        | "timp_operator"
        | "timp_technician"
        | "client_admin"
        | "client_user"
      audit_result: "success" | "denied" | "failure"
      company_status: "active" | "inactive"
      unit_status: "active" | "inactive"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      access_status: [
        "pending_approval",
        "active",
        "suspended",
        "blocked",
        "revoked",
      ],
      app_role: [
        "timp_admin",
        "timp_operator",
        "timp_technician",
        "client_admin",
        "client_user",
      ],
      audit_result: ["success", "denied", "failure"],
      company_status: ["active", "inactive"],
      unit_status: ["active", "inactive"],
    },
  },
} as const
