/**
 * Database Type Definitions
 * 
 * TypeScript interfaces for Supabase database tables and operations.
 * These types ensure type safety when working with the database.
 */

export interface Database {
  public: {
    Tables: {
      children: {
        Row: {
          id: string;
          name: string;
          age: number;
          parent_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          age?: number;
          parent_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          age?: number;
          parent_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      learning_sessions: {
        Row: {
          id: string;
          child_id: string;
          module: string;
          questions_answered: number;
          correct_answers: number;
          points_earned: number;
          session_date: string;
          ai_generated: boolean;
          session_duration: number;
        };
        Insert: {
          id?: string;
          child_id: string;
          module: string;
          questions_answered?: number;
          correct_answers?: number;
          points_earned?: number;
          session_date?: string;
          ai_generated?: boolean;
          session_duration?: number;
        };
        Update: {
          id?: string;
          child_id?: string;
          module?: string;
          questions_answered?: number;
          correct_answers?: number;
          points_earned?: number;
          session_date?: string;
          ai_generated?: boolean;
          session_duration?: number;
        };
      };
      question_responses: {
        Row: {
          id: string;
          session_id: string;
          question_text: string;
          selected_answer: string;
          correct_answer: string;
          is_correct: boolean;
          topic: string | null;
          response_time: number;
          answered_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          question_text: string;
          selected_answer: string;
          correct_answer: string;
          is_correct: boolean;
          topic?: string | null;
          response_time?: number;
          answered_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          question_text?: string;
          selected_answer?: string;
          correct_answer?: string;
          is_correct?: boolean;
          topic?: string | null;
          response_time?: number;
          answered_at?: string;
        };
      };
      child_progress: {
        Row: {
          id: string;
          child_id: string;
          total_points: number;
          total_questions: number;
          correct_answers: number;
          current_streak: number;
          modules_completed: Record<string, number>;
          achievements: string[];
          games_unlocked: string[];
          last_activity: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          total_points?: number;
          total_questions?: number;
          correct_answers?: number;
          current_streak?: number;
          modules_completed?: Record<string, number>;
          achievements?: string[];
          games_unlocked?: string[];
          last_activity?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          child_id?: string;
          total_points?: number;
          total_questions?: number;
          correct_answers?: number;
          current_streak?: number;
          modules_completed?: Record<string, number>;
          achievements?: string[];
          games_unlocked?: string[];
          last_activity?: string;
          updated_at?: string;
        };
      };
      ai_analytics: {
        Row: {
          id: string;
          child_id: string;
          strengths: string[];
          improvement_areas: string[];
          recommended_topics: string[];
          personalized_tips: string[];
          accuracy_rate: number | null;
          learning_velocity: number | null;
          generated_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          strengths?: string[];
          improvement_areas?: string[];
          recommended_topics?: string[];
          personalized_tips?: string[];
          accuracy_rate?: number | null;
          learning_velocity?: number | null;
          generated_at?: string;
        };
        Update: {
          id?: string;
          child_id?: string;
          strengths?: string[];
          improvement_areas?: string[];
          recommended_topics?: string[];
          personalized_tips?: string[];
          accuracy_rate?: number | null;
          learning_velocity?: number | null;
          generated_at?: string;
        };
      };
    };
  };
}

// Convenience types for easier use
export type Child = Database['public']['Tables']['children']['Row'];
export type ChildInsert = Database['public']['Tables']['children']['Insert'];
export type ChildUpdate = Database['public']['Tables']['children']['Update'];

export type LearningSession = Database['public']['Tables']['learning_sessions']['Row'];
export type LearningSessionInsert = Database['public']['Tables']['learning_sessions']['Insert'];
export type LearningSessionUpdate = Database['public']['Tables']['learning_sessions']['Update'];

export type QuestionResponse = Database['public']['Tables']['question_responses']['Row'];
export type QuestionResponseInsert = Database['public']['Tables']['question_responses']['Insert'];

export type ChildProgress = Database['public']['Tables']['child_progress']['Row'];
export type ChildProgressInsert = Database['public']['Tables']['child_progress']['Insert'];
export type ChildProgressUpdate = Database['public']['Tables']['child_progress']['Update'];

export type AIAnalytics = Database['public']['Tables']['ai_analytics']['Row'];
export type AIAnalyticsInsert = Database['public']['Tables']['ai_analytics']['Insert'];