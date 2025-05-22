export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_model_settings: {
        Row: {
          additional_params: Json | null
          created_at: string | null
          frequency_penalty: number | null
          id: string
          max_output_tokens: number
          max_retries: number
          model_name: string
          platform: string | null
          presence_penalty: number | null
          stop_sequences: string[] | null
          stream_response: boolean
          temperature: number
          top_k: number
          top_p: number
          updated_at: string | null
        }
        Insert: {
          additional_params?: Json | null
          created_at?: string | null
          frequency_penalty?: number | null
          id?: string
          max_output_tokens: number
          max_retries: number
          model_name: string
          platform?: string | null
          presence_penalty?: number | null
          stop_sequences?: string[] | null
          stream_response: boolean
          temperature: number
          top_k: number
          top_p: number
          updated_at?: string | null
        }
        Update: {
          additional_params?: Json | null
          created_at?: string | null
          frequency_penalty?: number | null
          id?: string
          max_output_tokens?: number
          max_retries?: number
          model_name?: string
          platform?: string | null
          presence_penalty?: number | null
          stop_sequences?: string[] | null
          stream_response?: boolean
          temperature?: number
          top_k?: number
          top_p?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_models: {
        Row: {
          badge: string | null
          created_at: string | null
          features: string[] | null
          id: string
          knowledge_cutoff: string | null
          label: string
          latency: string | null
          model_name: string
          platform: string
          pricing: string | null
          rate_limits: Json | null
          updated_at: string | null
        }
        Insert: {
          badge?: string | null
          created_at?: string | null
          features?: string[] | null
          id?: string
          knowledge_cutoff?: string | null
          label: string
          latency?: string | null
          model_name: string
          platform: string
          pricing?: string | null
          rate_limits?: Json | null
          updated_at?: string | null
        }
        Update: {
          badge?: string | null
          created_at?: string | null
          features?: string[] | null
          id?: string
          knowledge_cutoff?: string | null
          label?: string
          latency?: string | null
          model_name?: string
          platform?: string
          pricing?: string | null
          rate_limits?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_prompts: {
        Row: {
          created_at: string | null
          id: string
          name: string
          prompt: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          prompt: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          prompt?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      articles: {
        Row: {
          author: string | null
          category: string | null
          content: string
          created_at: string | null
          id: string
          published_date: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          published_date?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          published_date?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      banks: {
        Row: {
          bank_name: string
          created_at: string | null
          credit_cards_page_url: string | null
          id: string
          logo_url: string | null
          updated_at: string | null
        }
        Insert: {
          bank_name: string
          created_at?: string | null
          credit_cards_page_url?: string | null
          id?: string
          logo_url?: string | null
          updated_at?: string | null
        }
        Update: {
          bank_name?: string
          created_at?: string | null
          credit_cards_page_url?: string | null
          id?: string
          logo_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      benefits: {
        Row: {
          benefit_name: string
          benefit_type: string | null
          created_at: string | null
          description: string | null
          id: string
          level: number
          parent_benefit_id: string | null
          path: string | null
          updated_at: string | null
        }
        Insert: {
          benefit_name: string
          benefit_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          level?: number
          parent_benefit_id?: string | null
          path?: string | null
          updated_at?: string | null
        }
        Update: {
          benefit_name?: string
          benefit_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          level?: number
          parent_benefit_id?: string | null
          path?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "benefits_parent_benefit_id_fkey"
            columns: ["parent_benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefits_parent_fk"
            columns: ["parent_benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
        ]
      }
      calculation_rules: {
        Row: {
          calculation_type: string
          cap_amount: number | null
          created_at: string | null
          id: string
          min_spend: number | null
          multiplier: number
          spend_category_id: string | null
          terms_and_conditions: string | null
          updated_at: string | null
        }
        Insert: {
          calculation_type: string
          cap_amount?: number | null
          created_at?: string | null
          id?: string
          min_spend?: number | null
          multiplier?: number
          spend_category_id?: string | null
          terms_and_conditions?: string | null
          updated_at?: string | null
        }
        Update: {
          calculation_type?: string
          cap_amount?: number | null
          created_at?: string | null
          id?: string
          min_spend?: number | null
          multiplier?: number
          spend_category_id?: string | null
          terms_and_conditions?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calculation_rules_category_fk"
            columns: ["spend_category_id"]
            isOneToOne: false
            referencedRelation: "spend_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calculation_rules_spend_category_id_fkey"
            columns: ["spend_category_id"]
            isOneToOne: false
            referencedRelation: "spend_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      card_benefits: {
        Row: {
          benefit_id: string | null
          calculation_rule_id: string | null
          card_id: string | null
          created_at: string | null
          id: string
          max_reward_amount: number | null
          reward_rate: number | null
          terms_and_conditions: string | null
          updated_at: string | null
        }
        Insert: {
          benefit_id?: string | null
          calculation_rule_id?: string | null
          card_id?: string | null
          created_at?: string | null
          id?: string
          max_reward_amount?: number | null
          reward_rate?: number | null
          terms_and_conditions?: string | null
          updated_at?: string | null
        }
        Update: {
          benefit_id?: string | null
          calculation_rule_id?: string | null
          card_id?: string | null
          created_at?: string | null
          id?: string
          max_reward_amount?: number | null
          reward_rate?: number | null
          terms_and_conditions?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_benefits_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_benefits_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_card_benefits_benefit"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_card_benefits_calculation_rule"
            columns: ["calculation_rule_id"]
            isOneToOne: false
            referencedRelation: "calculation_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_card_benefits_card"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_reward_programs: {
        Row: {
          card_id: string | null
          created_at: string | null
          id: string
          program_id: string | null
          updated_at: string | null
        }
        Insert: {
          card_id?: string | null
          created_at?: string | null
          id?: string
          program_id?: string | null
          updated_at?: string | null
        }
        Update: {
          card_id?: string | null
          created_at?: string | null
          id?: string
          program_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_reward_programs_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_reward_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "reward_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_cards: {
        Row: {
          annual_fee: number | null
          bank_id: string | null
          card_name: string
          card_network: string | null
          card_type: string | null
          created_at: string | null
          foreign_transaction_fee: number | null
          id: string
          intro_apr: string | null
          joining_fee: number | null
          official_page_url: string | null
          regular_apr: string | null
          reward_program_id: string | null
          reward_rate: number | null
          signup_bonus: string | null
          source: string | null
          updated_at: string | null
        }
        Insert: {
          annual_fee?: number | null
          bank_id?: string | null
          card_name: string
          card_network?: string | null
          card_type?: string | null
          created_at?: string | null
          foreign_transaction_fee?: number | null
          id?: string
          intro_apr?: string | null
          joining_fee?: number | null
          official_page_url?: string | null
          regular_apr?: string | null
          reward_program_id?: string | null
          reward_rate?: number | null
          signup_bonus?: string | null
          source?: string | null
          updated_at?: string | null
        }
        Update: {
          annual_fee?: number | null
          bank_id?: string | null
          card_name?: string
          card_network?: string | null
          card_type?: string | null
          created_at?: string | null
          foreign_transaction_fee?: number | null
          id?: string
          intro_apr?: string | null
          joining_fee?: number | null
          official_page_url?: string | null
          regular_apr?: string | null
          reward_program_id?: string | null
          reward_rate?: number | null
          signup_bonus?: string | null
          source?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_cards_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_cards_reward_program_fk"
            columns: ["reward_program_id"]
            isOneToOne: false
            referencedRelation: "reward_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          card_id: string | null
          created_at: string | null
          id: string
          milestone_name: string
          reward_description: string | null
          spend_requirement: number | null
          updated_at: string | null
        }
        Insert: {
          card_id?: string | null
          created_at?: string | null
          id?: string
          milestone_name: string
          reward_description?: string | null
          spend_requirement?: number | null
          updated_at?: string | null
        }
        Update: {
          card_id?: string | null
          created_at?: string | null
          id?: string
          milestone_name?: string
          reward_description?: string | null
          spend_requirement?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          mobile_number: string | null
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          mobile_number?: string | null
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          mobile_number?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reward_programs: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          program_name: string
          redemption_options: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          program_name: string
          redemption_options?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          program_name?: string
          redemption_options?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      spend_categories: {
        Row: {
          category_name: string
          created_at: string | null
          description: string | null
          id: string
          level: number
          parent_category_id: string | null
          path: string | null
          updated_at: string | null
        }
        Insert: {
          category_name: string
          created_at?: string | null
          description?: string | null
          id?: string
          level?: number
          parent_category_id?: string | null
          path?: string | null
          updated_at?: string | null
        }
        Update: {
          category_name?: string
          created_at?: string | null
          description?: string | null
          id?: string
          level?: number
          parent_category_id?: string | null
          path?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spend_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "spend_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spend_categories_parent_fk"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "spend_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          merchant_name: string | null
          reward_multiplier: number | null
          reward_points_earned: number | null
          transaction_date: string
          updated_at: string | null
          user_card_id: string | null
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          merchant_name?: string | null
          reward_multiplier?: number | null
          reward_points_earned?: number | null
          transaction_date: string
          updated_at?: string | null
          user_card_id?: string | null
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          merchant_name?: string | null
          reward_multiplier?: number | null
          reward_points_earned?: number | null
          transaction_date?: string
          updated_at?: string | null
          user_card_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "spend_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_card_id_fkey"
            columns: ["user_card_id"]
            isOneToOne: false
            referencedRelation: "user_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      update_history: {
        Row: {
          id: string
          prompt: string
          table_name: string
          timestamp: string | null
        }
        Insert: {
          id?: string
          prompt: string
          table_name: string
          timestamp?: string | null
        }
        Update: {
          id?: string
          prompt?: string
          table_name?: string
          timestamp?: string | null
        }
        Relationships: []
      }
      user_cards: {
        Row: {
          annual_spend: number | null
          billing_date: string | null
          card_id: string | null
          card_number: string | null
          created_at: string | null
          credit_limit: number | null
          current_balance: number | null
          cvv: string | null
          due_date: string | null
          expiration_date: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          annual_spend?: number | null
          billing_date?: string | null
          card_id?: string | null
          card_number?: string | null
          created_at?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          cvv?: string | null
          due_date?: string | null
          expiration_date?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          annual_spend?: number | null
          billing_date?: string | null
          card_id?: string | null
          card_number?: string | null
          created_at?: string | null
          credit_limit?: number | null
          current_balance?: number | null
          cvv?: string | null
          due_date?: string | null
          expiration_date?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_milestones: {
        Row: {
          achieved_date: string | null
          created_at: string | null
          current_spend: number | null
          id: string
          is_achieved: boolean | null
          milestone_id: string | null
          updated_at: string | null
          user_card_id: string | null
        }
        Insert: {
          achieved_date?: string | null
          created_at?: string | null
          current_spend?: number | null
          id?: string
          is_achieved?: boolean | null
          milestone_id?: string | null
          updated_at?: string | null
          user_card_id?: string | null
        }
        Update: {
          achieved_date?: string | null
          created_at?: string | null
          current_spend?: number | null
          id?: string
          is_achieved?: boolean | null
          milestone_id?: string | null
          updated_at?: string | null
          user_card_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_milestones_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_milestones_user_card_id_fkey"
            columns: ["user_card_id"]
            isOneToOne: false
            referencedRelation: "user_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          preferred_categories: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          preferred_categories?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          preferred_categories?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_user_with_fixed_password: {
        Args: { email: string; full_name: string; mobile_number: string }
        Returns: string
      }
      get_category_ancestors: {
        Args: { leaf_id: string }
        Returns: {
          id: string
          category_name: string
          level: number
          path: string
        }[]
      }
      get_category_descendants: {
        Args: { root_id: string }
        Returns: {
          id: string
          category_name: string
          level: number
          path: string
        }[]
      }
      set_all_users_password: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_ai_model_settings: {
        Args: {
          p_platform: string
          p_model_name: string
          p_temperature: number
          p_max_output_tokens: number
          p_top_p: number
          p_top_k: number
          p_stream_response: boolean
          p_max_retries: number
          p_presence_penalty: number
          p_frequency_penalty: number
          p_stop_sequences: string[]
          p_additional_params: Json
        }
        Returns: Json
      }
    }
    Enums: {
      model_badge: "NEW" | "Deprecated" | "Experimental" | "Embedding"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      model_badge: ["NEW", "Deprecated", "Experimental", "Embedding"],
    },
  },
} as const
