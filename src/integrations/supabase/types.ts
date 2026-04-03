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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          action_taken: string | null
          alert_type: string | null
          id: string
          message: string
          session_id: string | null
          stress_score_at_alert: number | null
          triggered_at: string | null
          user_id: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          action_taken?: string | null
          alert_type?: string | null
          id?: string
          message: string
          session_id?: string | null
          stress_score_at_alert?: number | null
          triggered_at?: string | null
          user_id: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          action_taken?: string | null
          alert_type?: string | null
          id?: string
          message?: string
          session_id?: string | null
          stress_score_at_alert?: number | null
          triggered_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_alerts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "behavioral_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_insights: {
        Row: {
          body: string
          created_at: string | null
          id: string
          insight_type: string | null
          is_read: boolean | null
          metrics: Json | null
          related_session_id: string | null
          related_trade_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          insight_type?: string | null
          is_read?: boolean | null
          metrics?: Json | null
          related_session_id?: string | null
          related_trade_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          insight_type?: string | null
          is_read?: boolean | null
          metrics?: Json | null
          related_session_id?: string | null
          related_trade_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_related_session_id_fkey"
            columns: ["related_session_id"]
            isOneToOne: false
            referencedRelation: "behavioral_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insights_related_trade_id_fkey"
            columns: ["related_trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      behavioral_events: {
        Row: {
          event_time: string | null
          event_type: string | null
          id: number
          metadata: Json | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          event_time?: string | null
          event_type?: string | null
          id?: never
          metadata?: Json | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          event_time?: string | null
          event_type?: string | null
          id?: never
          metadata?: Json | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "behavioral_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "behavioral_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behavioral_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      behavioral_sessions: {
        Row: {
          avg_click_interval_ms: number | null
          created_at: string | null
          fomo_detected: boolean | null
          id: string
          mouse_event_count: number | null
          peak_stress_time: string | null
          rapid_click_count: number | null
          screen_switches: number | null
          session_end: string | null
          session_start: string
          stress_score: number | null
          trades_during_session: number | null
          user_id: string
        }
        Insert: {
          avg_click_interval_ms?: number | null
          created_at?: string | null
          fomo_detected?: boolean | null
          id?: string
          mouse_event_count?: number | null
          peak_stress_time?: string | null
          rapid_click_count?: number | null
          screen_switches?: number | null
          session_end?: string | null
          session_start?: string
          stress_score?: number | null
          trades_during_session?: number | null
          user_id: string
        }
        Update: {
          avg_click_interval_ms?: number | null
          created_at?: string | null
          fomo_detected?: boolean | null
          id?: string
          mouse_event_count?: number | null
          peak_stress_time?: string | null
          rapid_click_count?: number | null
          screen_switches?: number | null
          session_end?: string | null
          session_start?: string
          stress_score?: number | null
          trades_during_session?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "behavioral_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      economic_events: {
        Row: {
          actual_value: string | null
          country: string
          currency: string | null
          event_name: string
          event_time: string
          fetched_at: string | null
          forecast_value: string | null
          id: string
          impact_level: string | null
          previous_value: string | null
          raw_payload: Json | null
          source_api: string | null
        }
        Insert: {
          actual_value?: string | null
          country: string
          currency?: string | null
          event_name: string
          event_time: string
          fetched_at?: string | null
          forecast_value?: string | null
          id?: string
          impact_level?: string | null
          previous_value?: string | null
          raw_payload?: Json | null
          source_api?: string | null
        }
        Update: {
          actual_value?: string | null
          country?: string
          currency?: string | null
          event_name?: string
          event_time?: string
          fetched_at?: string | null
          forecast_value?: string | null
          id?: string
          impact_level?: string | null
          previous_value?: string | null
          raw_payload?: Json | null
          source_api?: string | null
        }
        Relationships: []
      }
      mental_journal: {
        Row: {
          emotional_state: string | null
          id: string
          mood_after: number | null
          mood_before: number | null
          note: string | null
          recorded_at: string | null
          trade_id: string | null
          user_id: string
        }
        Insert: {
          emotional_state?: string | null
          id?: string
          mood_after?: number | null
          mood_before?: number | null
          note?: string | null
          recorded_at?: string | null
          trade_id?: string | null
          user_id: string
        }
        Update: {
          emotional_state?: string | null
          id?: string
          mood_after?: number | null
          mood_before?: number | null
          note?: string | null
          recorded_at?: string | null
          trade_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mental_journal_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mental_journal_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_size: number | null
          avatar_url: string | null
          created_at: string | null
          experience_years: number | null
          full_name: string | null
          goals: string | null
          id: string
          is_pro: boolean | null
          onboarding_completed: boolean | null
          polar_customer_id: string | null
          primary_instruments: string[] | null
          subscription_status: string | null
          timezone: string | null
          trading_style: string | null
          updated_at: string | null
        }
        Insert: {
          account_size?: number | null
          avatar_url?: string | null
          created_at?: string | null
          experience_years?: number | null
          full_name?: string | null
          goals?: string | null
          id: string
          is_pro?: boolean | null
          onboarding_completed?: boolean | null
          polar_customer_id?: string | null
          primary_instruments?: string[] | null
          subscription_status?: string | null
          timezone?: string | null
          trading_style?: string | null
          updated_at?: string | null
        }
        Update: {
          account_size?: number | null
          avatar_url?: string | null
          created_at?: string | null
          experience_years?: number | null
          full_name?: string | null
          goals?: string | null
          id?: string
          is_pro?: boolean | null
          onboarding_completed?: boolean | null
          polar_customer_id?: string | null
          primary_instruments?: string[] | null
          subscription_status?: string | null
          timezone?: string | null
          trading_style?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      trades: {
        Row: {
          asset_class: string | null
          created_at: string | null
          direction: string | null
          entry_price: number
          entry_time: string
          exit_price: number | null
          exit_time: string | null
          id: string
          lot_size: number
          notes: string | null
          pnl: number | null
          pnl_pct: number | null
          rating: number | null
          screenshots: string[] | null
          setup_type: string | null
          status: string | null
          stop_loss: number | null
          symbol: string
          tags: string[] | null
          take_profit: number | null
          timeframe: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          asset_class?: string | null
          created_at?: string | null
          direction?: string | null
          entry_price: number
          entry_time: string
          exit_price?: number | null
          exit_time?: string | null
          id?: string
          lot_size: number
          notes?: string | null
          pnl?: number | null
          pnl_pct?: number | null
          rating?: number | null
          screenshots?: string[] | null
          setup_type?: string | null
          status?: string | null
          stop_loss?: number | null
          symbol: string
          tags?: string[] | null
          take_profit?: number | null
          timeframe?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          asset_class?: string | null
          created_at?: string | null
          direction?: string | null
          entry_price?: number
          entry_time?: string
          exit_price?: number | null
          exit_time?: string | null
          id?: string
          lot_size?: number
          notes?: string | null
          pnl?: number | null
          pnl_pct?: number | null
          rating?: number | null
          screenshots?: string[] | null
          setup_type?: string | null
          status?: string | null
          stop_loss?: number | null
          symbol?: string
          tags?: string[] | null
          take_profit?: number | null
          timeframe?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlist: {
        Row: {
          added_at: string | null
          asset_class: string | null
          display_order: number | null
          id: string
          symbol: string
          user_id: string
        }
        Insert: {
          added_at?: string | null
          asset_class?: string | null
          display_order?: number | null
          id?: string
          symbol: string
          user_id: string
        }
        Update: {
          added_at?: string | null
          asset_class?: string | null
          display_order?: number | null
          id?: string
          symbol?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
