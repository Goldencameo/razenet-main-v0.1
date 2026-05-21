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
      best_friends: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: Database["public"]["Enums"]["best_friend_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: Database["public"]["Enums"]["best_friend_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: Database["public"]["Enums"]["best_friend_status"]
          user_id?: string
        }
        Relationships: []
      }
      conversation_members: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string
          muted: boolean
          notifications_enabled: boolean
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string
          muted?: boolean
          notifications_enabled?: boolean
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string
          muted?: boolean
          notifications_enabled?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string
          game_news_id: string | null
          host_id: string | null
          id: string
          image_url: string | null
          name: string | null
          type: Database["public"]["Enums"]["conversation_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          game_news_id?: string | null
          host_id?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          type: Database["public"]["Enums"]["conversation_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          game_news_id?: string | null
          host_id?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          type?: Database["public"]["Enums"]["conversation_type"]
          updated_at?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          followee_id: string
          follower_id: string
          id: string
        }
        Insert: {
          created_at?: string
          followee_id: string
          follower_id: string
          id?: string
        }
        Update: {
          created_at?: string
          followee_id?: string
          follower_id?: string
          id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: Database["public"]["Enums"]["friendship_status"]
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          age_rating: string | null
          created_at: string
          description: string | null
          developer: string | null
          genre: string | null
          id: string
          image_urls: string[] | null
          likes: number | null
          max_players: number | null
          name: string
          published_at: string | null
          subgenre: string | null
          tags: string[] | null
          text_chat: boolean | null
          trailer_url: string | null
          updated_at: string
          voice_chat: boolean | null
          dislikes: number | null
          discussions: number | null
        }
        Insert: {
          age_rating?: string | null
          created_at?: string
          description?: string | null
          developer?: string | null
          genre?: string | null
          id?: string
          image_urls?: string[] | null
          likes?: number | null
          max_players?: number | null
          name: string
          published_at?: string | null
          subgenre?: string | null
          tags?: string[] | null
          text_chat?: boolean | null
          trailer_url?: string | null
          updated_at?: string
          voice_chat?: boolean | null
          dislikes?: number | null
          discussions?: number | null
        }
        Update: {
          age_rating?: string | null
          created_at?: string
          description?: string | null
          developer?: string | null
          dislikes?: number | null
          discussions?: number | null
          genre?: string | null
          id?: string
          image_urls?: string[] | null
          likes?: number | null
          max_players?: number | null
          name?: string
          published_at?: string | null
          subgenre?: string | null
          tags?: string[] | null
          text_chat?: boolean | null
          trailer_url?: string | null
          updated_at?: string
          voice_chat?: boolean | null
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempted_at: string
          id: string
          identifier: string | null
          ip: string
        }
        Insert: {
          attempted_at?: string
          id?: string
          identifier?: string | null
          ip: string
        }
        Update: {
          attempted_at?: string
          id?: string
          identifier?: string | null
          ip?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_url: string | null
          content: string
          conversation_id: string
          created_at: string
          edited_at: string | null
          id: string
          sender_id: string
        }
        Insert: {
          attachment_url?: string | null
          content?: string
          conversation_id: string
          created_at?: string
          edited_at?: string | null
          id?: string
          sender_id: string
        }
        Update: {
          attachment_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_actions: {
        Row: {
          action: string
          created_at: string
          expires_at: string | null
          id: string
          moderator_id: string
          reason: string | null
          target_user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          expires_at?: string | null
          id?: string
          moderator_id: string
          reason?: string | null
          target_user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          moderator_id?: string
          reason?: string | null
          target_user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      privacy_settings: {
        Row: {
          allow_friend_requests: boolean
          notify_on_friend_request: boolean
          profile_visibility: Database["public"]["Enums"]["profile_visibility"]
          show_online_to: Database["public"]["Enums"]["visibility_audience"]
          show_playing_to: Database["public"]["Enums"]["visibility_audience"]
          show_playtime: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_friend_requests?: boolean
          notify_on_friend_request?: boolean
          profile_visibility?: Database["public"]["Enums"]["profile_visibility"]
          show_online_to?: Database["public"]["Enums"]["visibility_audience"]
          show_playing_to?: Database["public"]["Enums"]["visibility_audience"]
          show_playtime?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_friend_requests?: boolean
          notify_on_friend_request?: boolean
          profile_visibility?: Database["public"]["Enums"]["profile_visibility"]
          show_online_to?: Database["public"]["Enums"]["visibility_audience"]
          show_playing_to?: Database["public"]["Enums"]["visibility_audience"]
          show_playtime?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_color: string
          bio: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          last_seen_at: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
          user_id: string
          username: string
          username_lower: string
        }
        Insert: {
          avatar_color?: string
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          last_seen_at?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id: string
          username: string
          username_lower: string
        }
        Update: {
          avatar_color?: string
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          last_seen_at?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id?: string
          username?: string
          username_lower?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          content: string | null
          created_at: string
          game_id: string
          id: string
          is_incognito: boolean
          recommended: boolean
          stars: number
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          game_id: string
          id?: string
          is_incognito?: boolean
          recommended?: boolean
          stars: number
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          game_id?: string
          id?: string
          is_incognito?: boolean
          recommended?: boolean
          stars?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          reason: string
          reason_other: string | null
          recipient: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          reason: string
          reason_other?: string | null
          recipient: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          reason?: string
          reason_other?: string | null
          recipient?: string
          user_id?: string
        }
        Relationships: []
      }
      user_games: {
        Row: {
          created_at: string
          game_id: string
          hours_played: number
          id: string
          is_favorite: boolean
          last_played_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          game_id: string
          hours_played?: number
          id?: string
          is_favorite?: boolean
          last_played_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          game_id?: string
          hours_played?: number
          id?: string
          is_favorite?: boolean
          last_played_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_games_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_color: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          status: Database["public"]["Enums"]["user_status"] | null
          user_id: string | null
          username: string | null
          username_lower: string | null
        }
        Insert: {
          avatar_color?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          user_id?: string | null
          username?: string | null
          username_lower?: string | null
        }
        Update: {
          avatar_color?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          user_id?: string | null
          username?: string | null
          username_lower?: string | null
        }
        Relationships: []
      }
      safe_reviews: {
        Row: {
          content: string | null
          created_at: string | null
          game_id: string | null
          id: string | null
          is_incognito: boolean | null
          recommended: boolean | null
          stars: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          game_id?: string | null
          id?: string | null
          is_incognito?: boolean | null
          recommended?: boolean | null
          stars?: number | null
          updated_at?: string | null
          user_id?: never
        }
        Update: {
          content?: string | null
          created_at?: string | null
          game_id?: string | null
          id?: string | null
          is_incognito?: boolean | null
          recommended?: boolean | null
          stars?: number | null
          updated_at?: string | null
          user_id?: never
        }
        Relationships: [
          {
            foreignKeyName: "reviews_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      user_moderation_status: {
        Row: {
          is_banned: boolean | null
          is_muted: boolean | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      are_friends: { Args: { _a: string; _b: string }; Returns: boolean }
      check_username_available: {
        Args: { desired_username: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_conv_host: { Args: { _conv: string; _user: string }; Returns: boolean }
      is_conv_member: {
        Args: { _conv: string; _user: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "creator" | "developer"
      best_friend_status: "pending" | "accepted"
      conversation_type: "dm" | "group" | "discussion"
      friendship_status: "pending" | "accepted"
      notification_type:
        | "system"
        | "friend_request"
        | "friend_accepted"
        | "event_reminder"
        | "marketplace_receipt"
        | "group_invite"
      profile_visibility: "everyone" | "friends" | "private"
      user_status: "online" | "idle" | "dnd" | "invisible"
      visibility_audience: "everyone" | "friends" | "nobody"
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
      app_role: ["admin", "moderator", "user", "creator", "developer"],
      best_friend_status: ["pending", "accepted"],
      conversation_type: ["dm", "group", "discussion"],
      friendship_status: ["pending", "accepted"],
      notification_type: [
        "system",
        "friend_request",
        "friend_accepted",
        "event_reminder",
        "marketplace_receipt",
        "group_invite",
      ],
      profile_visibility: ["everyone", "friends", "private"],
      user_status: ["online", "idle", "dnd", "invisible"],
      visibility_audience: ["everyone", "friends", "nobody"],
    },
  },
} as const
