import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string;
          full_name?: string;
          avatar_url?: string;
          bio?: string;
          website?: string;
          location?: string;
          reputation?: number;
          role?: 'user' | 'admin' | 'moderator';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          full_name?: string;
          avatar_url?: string;
          bio?: string;
          website?: string;
          location?: string;
          reputation?: number;
          role?: 'user' | 'admin' | 'moderator';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          full_name?: string;
          avatar_url?: string;
          bio?: string;
          website?: string;
          location?: string;
          reputation?: number;
          role?: 'user' | 'admin' | 'moderator';
          created_at?: string;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          title: string;
          content: string;
          tags: string[];
          author_id: string;
          created_at: string;
          updated_at: string;
          answer_count: number;
          vote_score: number;
          view_count: number;
          is_answered: boolean;
          accepted_answer_id?: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          tags?: string[];
          author_id: string;
          created_at?: string;
          updated_at?: string;
          answer_count?: number;
          vote_score?: number;
          view_count?: number;
          is_answered?: boolean;
          accepted_answer_id?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          tags?: string[];
          author_id?: string;
          created_at?: string;
          updated_at?: string;
          answer_count?: number;
          vote_score?: number;
          view_count?: number;
          is_answered?: boolean;
          accepted_answer_id?: string;
        };
      };
      answers: {
        Row: {
          id: string;
          question_id: string;
          content: string;
          author_id: string;
          vote_score: number;
          is_accepted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          content: string;
          author_id: string;
          vote_score?: number;
          is_accepted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          content?: string;
          author_id?: string;
          vote_score?: number;
          is_accepted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          message: string;
          type: string;
          link: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          message: string;
          type: string;
          link: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string;
          message?: string;
          type?: string;
          link?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          user_id: string;
          answer_id: string;
          vote_type: 'up' | 'down';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          answer_id: string;
          vote_type: 'up' | 'down';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          answer_id?: string;
          vote_type?: 'up' | 'down';
          created_at?: string;
        };
      };
    };
  };
};