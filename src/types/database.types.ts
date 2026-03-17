export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: "admin" | "editor";
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role: "admin" | "editor";
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: "admin" | "editor";
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      contact_leads: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          company: string | null;
          subject: string;
          message: string;
          page_url: string | null;
          source: string;
          referrer: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          status:
            | "nuevo"
            | "leido"
            | "respondido"
            | "resuelto"
            | "archivado"
            | "spam";
          is_read: boolean;
          assigned_to: string | null;
          sent_to_email: string | null;
          email_notification_status: "pendiente" | "enviado" | "error" | "omitido";
          email_notification_provider_id: string | null;
          ip_hash: string | null;
          user_agent: string | null;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          company?: string | null;
          subject: string;
          message: string;
          page_url?: string | null;
          source?: string;
          referrer?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          status?:
            | "nuevo"
            | "leido"
            | "respondido"
            | "resuelto"
            | "archivado"
            | "spam";
          is_read?: boolean;
          assigned_to?: string | null;
          sent_to_email?: string | null;
          email_notification_status?: "pendiente" | "enviado" | "error" | "omitido";
          email_notification_provider_id?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          company?: string | null;
          subject?: string;
          message?: string;
          page_url?: string | null;
          source?: string;
          referrer?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          status?:
            | "nuevo"
            | "leido"
            | "respondido"
            | "resuelto"
            | "archivado"
            | "spam";
          is_read?: boolean;
          assigned_to?: string | null;
          sent_to_email?: string | null;
          email_notification_status?: "pendiente" | "enviado" | "error" | "omitido";
          email_notification_provider_id?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contact_leads_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      analytics_events: {
        Row: {
          id: string;
          created_at: string;
          session_id: string;
          visitor_id: string;
          event_type:
            | "page_view"
            | "project_view"
            | "cta_click"
            | "contact_form_view"
            | "contact_form_submit";
          path: string;
          page_title: string | null;
          referrer: string | null;
          device_type: string | null;
          country: string | null;
          browser: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          value_json: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          session_id: string;
          visitor_id: string;
          event_type:
            | "page_view"
            | "project_view"
            | "cta_click"
            | "contact_form_view"
            | "contact_form_submit";
          path: string;
          page_title?: string | null;
          referrer?: string | null;
          device_type?: string | null;
          country?: string | null;
          browser?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          value_json?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          session_id?: string;
          visitor_id?: string;
          event_type?:
            | "page_view"
            | "project_view"
            | "cta_click"
            | "contact_form_view"
            | "contact_form_submit";
          path?: string;
          page_title?: string | null;
          referrer?: string | null;
          device_type?: string | null;
          country?: string | null;
          browser?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          value_json?: Json;
        };
        Relationships: [];
      };
      analytics_daily_rollups: {
        Row: {
          date: string;
          page_views: number;
          unique_visitors: number;
          sessions: number;
          contacts: number;
          cta_clicks: number;
          conversion_rate: number;
          updated_at: string;
        };
        Insert: {
          date: string;
          page_views?: number;
          unique_visitors?: number;
          sessions?: number;
          contacts?: number;
          cta_clicks?: number;
          conversion_rate?: number;
          updated_at?: string;
        };
        Update: {
          date?: string;
          page_views?: number;
          unique_visitors?: number;
          sessions?: number;
          contacts?: number;
          cta_clicks?: number;
          conversion_rate?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      analytics_monthly_rollups: {
        Row: {
          month: string;
          page_views: number;
          unique_visitors: number;
          sessions: number;
          contacts: number;
          cta_clicks: number;
          conversion_rate: number;
          updated_at: string;
        };
        Insert: {
          month: string;
          page_views?: number;
          unique_visitors?: number;
          sessions?: number;
          contacts?: number;
          cta_clicks?: number;
          conversion_rate?: number;
          updated_at?: string;
        };
        Update: {
          month?: string;
          page_views?: number;
          unique_visitors?: number;
          sessions?: number;
          contacts?: number;
          cta_clicks?: number;
          conversion_rate?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      platform_usage_snapshots: {
        Row: {
          id: string;
          created_at: string;
          platform: "vercel" | "supabase" | "cloudflare_r2" | "email";
          metric_key: string;
          metric_value: number;
          metric_unit: string;
          period_start: string | null;
          period_end: string | null;
          bucket_or_project: string | null;
          source: string;
          meta_json: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          platform: "vercel" | "supabase" | "cloudflare_r2" | "email";
          metric_key: string;
          metric_value?: number;
          metric_unit: string;
          period_start?: string | null;
          period_end?: string | null;
          bucket_or_project?: string | null;
          source?: string;
          meta_json?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          platform?: "vercel" | "supabase" | "cloudflare_r2" | "email";
          metric_key?: string;
          metric_value?: number;
          metric_unit?: string;
          period_start?: string | null;
          period_end?: string | null;
          bucket_or_project?: string | null;
          source?: string;
          meta_json?: Json;
        };
        Relationships: [];
      };
      platform_alerts: {
        Row: {
          id: string;
          created_at: string;
          platform: "vercel" | "supabase" | "cloudflare_r2" | "email";
          metric_key: string;
          severity: "verde" | "amarillo" | "naranja" | "rojo";
          threshold_percent: number;
          current_percent: number;
          status: "abierta" | "resuelta";
          message: string;
          help_copy: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          platform: "vercel" | "supabase" | "cloudflare_r2" | "email";
          metric_key: string;
          severity: "verde" | "amarillo" | "naranja" | "rojo";
          threshold_percent: number;
          current_percent: number;
          status?: "abierta" | "resuelta";
          message: string;
          help_copy: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          platform?: "vercel" | "supabase" | "cloudflare_r2" | "email";
          metric_key?: string;
          severity?: "verde" | "amarillo" | "naranja" | "rojo";
          threshold_percent?: number;
          current_percent?: number;
          status?: "abierta" | "resuelta";
          message?: string;
          help_copy?: string;
        };
        Relationships: [];
      };
      site_sections: {
        Row: {
          id: string;
          page_key: string;
          section_key: string;
          position: number;
          enabled: boolean;
          status: "draft" | "published" | "archived";
          data_json: Json;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_key: string;
          section_key: string;
          position?: number;
          enabled?: boolean;
          status?: "draft" | "published" | "archived";
          data_json?: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          page_key?: string;
          section_key?: string;
          position?: number;
          enabled?: boolean;
          status?: "draft" | "published" | "archived";
          data_json?: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "site_sections_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: {
          key: string;
          value_json: Json;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value_json?: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value_json?: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "site_settings_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          id: string;
          slug: string;
          title: string;
          subtitle: string | null;
          excerpt: string | null;
          body_markdown: string | null;
          year: number | null;
          client_name: string | null;
          category: string | null;
          featured: boolean;
          status: "draft" | "published" | "archived";
          seo_json: Json;
          published_at: string | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          subtitle?: string | null;
          excerpt?: string | null;
          body_markdown?: string | null;
          year?: number | null;
          client_name?: string | null;
          category?: string | null;
          featured?: boolean;
          status?: "draft" | "published" | "archived";
          seo_json?: Json;
          published_at?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          subtitle?: string | null;
          excerpt?: string | null;
          body_markdown?: string | null;
          year?: number | null;
          client_name?: string | null;
          category?: string | null;
          featured?: boolean;
          status?: "draft" | "published" | "archived";
          seo_json?: Json;
          published_at?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      project_media: {
        Row: {
          id: string;
          project_id: string;
          kind: "image" | "video";
          role: "cover" | "hero" | "gallery" | "detail";
          storage_key: string;
          public_url: string;
          alt_text: string | null;
          caption: string | null;
          width: number | null;
          height: number | null;
          duration_seconds: number | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          kind: "image" | "video";
          role: "cover" | "hero" | "gallery" | "detail";
          storage_key: string;
          public_url: string;
          alt_text?: string | null;
          caption?: string | null;
          width?: number | null;
          height?: number | null;
          duration_seconds?: number | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          kind?: "image" | "video";
          role?: "cover" | "hero" | "gallery" | "detail";
          storage_key?: string;
          public_url?: string;
          alt_text?: string | null;
          caption?: string | null;
          width?: number | null;
          height?: number | null;
          duration_seconds?: number | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_media_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      cms_assets: {
        Row: {
          id: string;
          filename: string;
          kind: "image" | "video";
          storage_key: string;
          public_url: string;
          content_type: string;
          file_size: number | null;
          width: number | null;
          height: number | null;
          duration_seconds: number | null;
          alt_text: string | null;
          tags: string[];
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          filename: string;
          kind: "image" | "video";
          storage_key: string;
          public_url: string;
          content_type: string;
          file_size?: number | null;
          width?: number | null;
          height?: number | null;
          duration_seconds?: number | null;
          alt_text?: string | null;
          tags?: string[];
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          filename?: string;
          kind?: "image" | "video";
          storage_key?: string;
          public_url?: string;
          content_type?: string;
          file_size?: number | null;
          width?: number | null;
          height?: number | null;
          duration_seconds?: number | null;
          alt_text?: string | null;
          tags?: string[];
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cms_assets_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      releases: {
        Row: {
          id: string;
          label: string;
          snapshot_json: Json;
          notes: string | null;
          published_by: string | null;
          published_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          snapshot_json: Json;
          notes?: string | null;
          published_by?: string | null;
          published_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          snapshot_json?: Json;
          notes?: string | null;
          published_by?: string | null;
          published_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "releases_published_by_fkey";
            columns: ["published_by"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          before_json: Json | null;
          after_json: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          before_json?: Json | null;
          after_json?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          before_json?: Json | null;
          after_json?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "admin_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_database_size_bytes: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      get_storage_usage_summary: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      get_monthly_active_users_estimate: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      refresh_analytics_rollups: {
        Args: { p_from?: string };
        Returns: undefined;
      };
      is_admin_user: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_editor_user: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database["public"];

export type Tables<
  TableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends TableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[TableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = TableNameOrOptions extends { schema: keyof Database }
  ? Database[TableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Row: infer Row;
    }
    ? Row
    : never
  : TableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][TableNameOrOptions] extends { Row: infer Row }
      ? Row
      : never
    : never;

export type TablesInsert<
  TableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends TableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[TableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = TableNameOrOptions extends { schema: keyof Database }
  ? Database[TableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer Insert;
    }
    ? Insert
    : never
  : TableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][TableNameOrOptions] extends {
        Insert: infer Insert;
      }
      ? Insert
      : never
    : never;

export type TablesUpdate<
  TableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends TableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[TableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = TableNameOrOptions extends { schema: keyof Database }
  ? Database[TableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer Update;
    }
    ? Update
    : never
  : TableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][TableNameOrOptions] extends {
        Update: infer Update;
      }
      ? Update
      : never
    : never;
