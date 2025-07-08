/**
 * Database Service - Supabase Integration
 * 
 * This service handles all database operations for the AI Learning Buddy app.
 * It provides methods for managing children, sessions, progress, and analytics.
 */

import { supabase } from '../lib/supabase';
import { 
  Child, 
  ChildInsert, 
  ChildUpdate,
  LearningSession,
  LearningSessionInsert,
  QuestionResponseInsert,
  ChildProgress,
  ChildProgressUpdate,
  AIAnalyticsInsert
} from '../types/database';

class DatabaseService {
  /**
   * CHILDREN MANAGEMENT
   */
  
  /**
   * Create a new child profile
   */
  async createChild(childData: ChildInsert): Promise<{ data: Child | null; error: any }> {
    const { data, error } = await supabase
      .from('children')
      .insert(childData)
      .select()
      .single();
    
    if (data && !error) {
      // Initialize progress for the new child
      await this.initializeChildProgress(data.id);
    }
    
    return { data, error };
  }

  /**
   * Get all children for the current parent
   */
  async getChildren(): Promise<{ data: Child[] | null; error: any }> {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data, error };
  }

  /**
   * Update child information
   */
  async updateChild(childId: string, updates: ChildUpdate): Promise<{ data: Child | null; error: any }> {
    const { data, error } = await supabase
      .from('children')
      .update(updates)
      .eq('id', childId)
      .select()
      .single();
    
    return { data, error };
  }

  /**
   * LEARNING SESSIONS
   */

  /**
   * Start a new learning session
   */
  async startLearningSession(sessionData: LearningSessionInsert): Promise<{ data: LearningSession | null; error: any }> {
    const { data, error } = await supabase
      .from('learning_sessions')
      .insert(sessionData)
      .select()
      .single();
    
    return { data, error };
  }

  /**
   * Update learning session with results
   */
  async updateLearningSession(
    sessionId: string, 
    updates: { questions_answered: number; correct_answers: number; points_earned: number; session_duration: number }
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from('learning_sessions')
      .update(updates)
      .eq('id', sessionId);
    
    return { error };
  }

  /**
   * Record individual question responses
   */
  async recordQuestionResponse(responseData: QuestionResponseInsert): Promise<{ error: any }> {
    const { error } = await supabase
      .from('question_responses')
      .insert(responseData);
    
    return { error };
  }

  /**
   * Get learning sessions for a child
   */
  async getChildSessions(childId: string, limit: number = 10): Promise<{ data: LearningSession[] | null; error: any }> {
    const { data, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('child_id', childId)
      .order('session_date', { ascending: false })
      .limit(limit);
    
    return { data, error };
  }

  /**
   * PROGRESS TRACKING
   */

  /**
   * Initialize progress for a new child
   */
  async initializeChildProgress(childId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('child_progress')
      .insert({
        child_id: childId,
        total_points: 0,
        total_questions: 0,
        correct_answers: 0,
        current_streak: 0,
        modules_completed: {},
        achievements: [],
        games_unlocked: []
      });
    
    return { error };
  }

  /**
   * Get child's current progress
   */
  async getChildProgress(childId: string): Promise<{ data: ChildProgress | null; error: any }> {
    const { data, error } = await supabase
      .from('child_progress')
      .select('*')
      .eq('child_id', childId)
      .single();
    
    return { data, error };
  }

  /**
   * Update child's progress
   */
  async updateChildProgress(childId: string, updates: ChildProgressUpdate): Promise<{ error: any }> {
    const { error } = await supabase
      .from('child_progress')
      .update({
        ...updates,
        last_activity: new Date().toISOString()
      })
      .eq('child_id', childId);
    
    return { error };
  }

  /**
   * Add points to child's progress
   */
  async addPoints(childId: string, points: number, correctAnswers: number, totalQuestions: number): Promise<{ error: any }> {
    // Get current progress
    const { data: currentProgress, error: fetchError } = await this.getChildProgress(childId);
    if (fetchError || !currentProgress) return { error: fetchError };

    // Calculate new values
    const newTotalPoints = currentProgress.total_points + points;
    const newCorrectAnswers = currentProgress.correct_answers + correctAnswers;
    const newTotalQuestions = currentProgress.total_questions + totalQuestions;

    // Check for new achievements
    const newAchievements = [...currentProgress.achievements];
    const newGamesUnlocked = [...currentProgress.games_unlocked];

    // Unlock memory game at 50 points
    if (newTotalPoints >= 50 && !newGamesUnlocked.includes('memory_game')) {
      newGamesUnlocked.push('memory_game');
      newAchievements.push('First Game Unlocked!');
    }

    // Add more achievement logic here
    if (newTotalPoints >= 100 && !newAchievements.includes('Century Club')) {
      newAchievements.push('Century Club');
    }

    const { error } = await supabase
      .from('child_progress')
      .update({
        total_points: newTotalPoints,
        correct_answers: newCorrectAnswers,
        total_questions: newTotalQuestions,
        achievements: newAchievements,
        games_unlocked: newGamesUnlocked,
        last_activity: new Date().toISOString()
      })
      .eq('child_id', childId);
    
    return { error };
  }

  /**
   * AI ANALYTICS
   */

  /**
   * Save AI-generated analytics
   */
  async saveAIAnalytics(analyticsData: AIAnalyticsInsert): Promise<{ error: any }> {
    const { error } = await supabase
      .from('ai_analytics')
      .insert(analyticsData);
    
    return { error };
  }

  /**
   * Get latest AI analytics for a child
   */
  async getLatestAnalytics(childId: string): Promise<{ data: any | null; error: any }> {
    const { data, error } = await supabase
      .from('ai_analytics')
      .select('*')
      .eq('child_id', childId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();
    
    return { data, error };
  }

  /**
   * ANALYTICS & REPORTING
   */

  /**
   * Get comprehensive child analytics for teachers/parents
   */
  async getChildAnalytics(childId: string): Promise<{
    progress: ChildProgress | null;
    recentSessions: LearningSession[] | null;
    aiAnalytics: any | null;
    error: any;
  }> {
    try {
      const [progressResult, sessionsResult, analyticsResult] = await Promise.all([
        this.getChildProgress(childId),
        this.getChildSessions(childId, 5),
        this.getLatestAnalytics(childId)
      ]);

      return {
        progress: progressResult.data,
        recentSessions: sessionsResult.data,
        aiAnalytics: analyticsResult.data,
        error: progressResult.error || sessionsResult.error || analyticsResult.error
      };
    } catch (error) {
      return {
        progress: null,
        recentSessions: null,
        aiAnalytics: null,
        error
      };
    }
  }

  /**
   * Get learning statistics for all children (for teachers)
   */
  async getAllChildrenStats(): Promise<{ data: any[] | null; error: any }> {
    const { data, error } = await supabase
      .from('children')
      .select(`
        *,
        child_progress (
          total_points,
          total_questions,
          correct_answers,
          current_streak,
          last_activity
        ),
        learning_sessions (
          session_date,
          points_earned,
          module
        )
      `);
    
    return { data, error };
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();