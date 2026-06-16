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
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          status: 'following' | 'pending' | 'friends'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          status?: 'following' | 'pending' | 'friends'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          status?: 'following' | 'pending' | 'friends'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_preferences: {
        Row: {
          user_id: string
          frequency: 'daily' | 'three_per_week' | 'weekly' | 'none'
          updated_at: string
        }
        Insert: {
          user_id: string
          frequency?: 'daily' | 'three_per_week' | 'weekly' | 'none'
          updated_at?: string
        }
        Update: {
          user_id?: string
          frequency?: 'daily' | 'three_per_week' | 'weekly' | 'none'
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      streak_freezes: {
        Row: {
          id: string
          user_id: string
          streak_id: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          streak_id: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          streak_id?: string
          date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "streak_freezes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "streak_freezes_streak_id_fkey"
            columns: ["streak_id"]
            isOneToOne: false
            referencedRelation: "streaks"
            referencedColumns: ["id"]
          },
        ]
      }
      streak_logs: {
        Row: {
          checked_at: string | null
          created_at: string
          date: string
          id: string
          is_checked: boolean
          note: string | null
          streak_id: string
        }
        Insert: {
          checked_at?: string | null
          created_at?: string
          date: string
          id?: string
          is_checked?: boolean
          note?: string | null
          streak_id: string
        }
        Update: {
          checked_at?: string | null
          created_at?: string
          date?: string
          id?: string
          is_checked?: boolean
          note?: string | null
          streak_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "streak_logs_streak_id_fkey"
            columns: ["streak_id"]
            isOneToOne: false
            referencedRelation: "streaks"
            referencedColumns: ["id"]
          },
        ]
      }
      streaks: {
        Row: {
          category_id: string | null
          count: number
          created_at: string
          end_hour: number | null
          end_minute: number | null
          id: string
          is_public: boolean
          last_checked_date: string | null
          name: string
          scheduled_hour: number | null
          scheduled_minute: number | null
          time_enforced: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          count?: number
          created_at?: string
          end_hour?: number | null
          end_minute?: number | null
          id?: string
          is_public?: boolean
          last_checked_date?: string | null
          name: string
          scheduled_hour?: number | null
          scheduled_minute?: number | null
          time_enforced?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          count?: number
          created_at?: string
          end_hour?: number | null
          end_minute?: number | null
          id?: string
          is_public?: boolean
          last_checked_date?: string | null
          name?: string
          scheduled_hour?: number | null
          scheduled_minute?: number | null
          time_enforced?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "streaks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: 'free' | 'pro'
          status: string
          current_period_end: string | null
          free_trial_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'free' | 'pro'
          status?: string
          current_period_end?: string | null
          free_trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'free' | 'pro'
          status?: string
          current_period_end?: string | null
          free_trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_admin: boolean
          username: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          is_admin?: boolean
          username?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_admin?: boolean
          username?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          streak_id: string
          streak_name: string
          count: number
          user_id: string
          user_email: string
        }[]
      }
      get_users_by_ids: {
        Args: { user_ids: string[] }
        Returns: {
          id: string
          username: string | null
        }[]
      }
      get_user_by_username: {
        Args: { lookup: string }
        Returns: {
          id: string
          username: string | null
        }[]
      }
      get_user_by_id: {
        Args: { lookup: string }
        Returns: {
          id: string
          username: string | null
        }[]
      }
      search_users: {
        Args: { query: string; current_user_id: string }
        Returns: {
          id: string
          username: string | null
        }[]
      }
      get_public_streaks: {
        Args: { owner_id: string }
        Returns: {
          id: string
          name: string
          count: number
          last_checked_date: string | null
          created_at: string
          category_id: string | null
        }[]
      }
      get_public_streak_logs: {
        Args: { streak_ids: string[] }
        Returns: {
          streak_id: string
          date: string
          is_checked: boolean
          checked_at: string | null
          note: string | null
        }[]
      }
      get_friend_feed: {
        Args: { current_user_id: string }
        Returns: {
          friend_id: string
          friend_name: string
          streak_id: string
          streak_name: string
          checked_at: string
          date: string
          note: string | null
        }[]
      }
      get_lazy_friends: {
        Args: { current_user_id: string }
        Returns: {
          friend_id: string
          friend_name: string
          streak_id: string
          streak_name: string
          last_checked_date: string
        }[]
      }
      get_friend_leaderboard: {
        Args: { current_user_id: string }
        Returns: {
          rank: number
          user_id: string
          username: string
          streak_id: string
          streak_name: string
          streak_count: number
        }[]
      }
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
