/**
 * Hand-maintained mirror of supabase/migrations/*.sql. Once the project is
 * live, prefer regenerating with `supabase gen types typescript` and diffing
 * against this file (see README) rather than editing both by hand forever.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          website: string | null;
          location: string | null;
          industry: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          website?: string | null;
          location?: string | null;
          industry?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          website?: string | null;
          location?: string | null;
          industry?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          location: string | null;
          country: string;
          work_mode: "remote" | "hybrid" | "onsite" | null;
          salary_min: number | null;
          salary_max: number | null;
          salary_currency: string | null;
          employment_type:
            | "full_time"
            | "part_time"
            | "contract"
            | "temporary"
            | "internship"
            | "other"
            | null;
          experience_level:
            | "entry"
            | "junior"
            | "mid"
            | "senior"
            | "lead"
            | "principal"
            | "unknown"
            | null;
          job_url: string;
          date_posted: string | null;
          date_collected: string;
          source: string;
          sources: string[];
          description: string | null;
          skills: string[];
          language: string | null;
          visa_sponsorship: boolean | null;
          fingerprint: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          title: string;
          location?: string | null;
          country?: string;
          work_mode?: "remote" | "hybrid" | "onsite" | null;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string | null;
          employment_type?:
            | "full_time"
            | "part_time"
            | "contract"
            | "temporary"
            | "internship"
            | "other"
            | null;
          experience_level?:
            | "entry"
            | "junior"
            | "mid"
            | "senior"
            | "lead"
            | "principal"
            | "unknown"
            | null;
          job_url: string;
          date_posted?: string | null;
          date_collected?: string;
          source: string;
          sources?: string[];
          description?: string | null;
          skills?: string[];
          language?: string | null;
          visa_sponsorship?: boolean | null;
          fingerprint: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["jobs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      saved_jobs: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          status: "saved" | "archived" | "hidden";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id: string;
          status?: "saved" | "archived" | "hidden";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["saved_jobs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      applied_jobs: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          applied_date: string;
          status: "waiting" | "interview" | "rejected" | "offer";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id: string;
          applied_date?: string;
          status?: "waiting" | "interview" | "rejected" | "offer";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["applied_jobs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "applied_jobs_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      sync_logs: {
        Row: {
          id: string;
          source: string;
          started_at: string;
          finished_at: string | null;
          jobs_found: number;
          jobs_inserted: number;
          jobs_skipped: number;
          errors: string[];
        };
        Insert: {
          id?: string;
          source: string;
          started_at: string;
          finished_at?: string | null;
          jobs_found?: number;
          jobs_inserted?: number;
          jobs_skipped?: number;
          errors?: string[];
        };
        Update: Partial<Database["public"]["Tables"]["sync_logs"]["Insert"]>;
        Relationships: [];
      };
      job_sources: {
        Row: {
          id: string;
          name: string;
          type: string;
          enabled: boolean;
          config: Json;
          last_synced_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          enabled?: boolean;
          config?: Json;
          last_synced_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["job_sources"]["Insert"]>;
        Relationships: [];
      };
      filter_config: {
        Row: {
          id: string;
          include_keywords: string[];
          exclude_title_keywords: string[];
          allowed_countries: string[];
          updated_at: string;
        };
        Insert: {
          id?: string;
          include_keywords?: string[];
          exclude_title_keywords?: string[];
          allowed_countries?: string[];
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["filter_config"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
