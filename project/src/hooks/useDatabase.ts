/**
 * Database Hooks - React Integration
 * 
 * Custom React hooks for database operations with loading states and error handling.
 * These hooks provide a clean interface for components to interact with Supabase.
 */

import { useState, useEffect, useCallback } from 'react';
import { databaseService } from '../services/databaseService';
import { Child, ChildProgress, LearningSession } from '../types/database';
import { supabase } from '../lib/supabase';

/**
 * Hook for managing children
 */
export function useChildren() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChildren = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await databaseService.getChildren();
      if (error) throw error;
      setChildren(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch children');
    } finally {
      setLoading(false);
    }
  }, []);

  const createChild = useCallback(async (name: string, age: number = 5) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await databaseService.createChild({
        name,
        age,
        parent_id: user.id
      });
      
      if (error) throw error;
      if (data) {
        setChildren(prev => [data, ...prev]);
      }
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create child');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  return {
    children,
    loading,
    error,
    createChild,
    refetch: fetchChildren
  };
}

/**
 * Hook for managing child progress
 */
export function useChildProgress(childId: string | null) {
  const [progress, setProgress] = useState<ChildProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!childId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await databaseService.getChildProgress(childId);
      if (error) throw error;
      setProgress(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  }, [childId]);

  const updateProgress = useCallback(async (updates: Partial<ChildProgress>) => {
    if (!childId) return;
    
    try {
      const { error } = await databaseService.updateChildProgress(childId, updates);
      if (error) throw error;
      
      // Update local state
      setProgress(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress');
    }
  }, [childId]);

  const addPoints = useCallback(async (points: number, correctAnswers: number, totalQuestions: number) => {
    if (!childId) return;
    
    try {
      const { error } = await databaseService.addPoints(childId, points, correctAnswers, totalQuestions);
      if (error) throw error;
      
      // Refetch to get updated progress with achievements
      await fetchProgress();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add points');
    }
  }, [childId, fetchProgress]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    loading,
    error,
    updateProgress,
    addPoints,
    refetch: fetchProgress
  };
}

/**
 * Hook for managing learning sessions
 */
export function useLearningSession() {
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(async (childId: string, module: string, aiGenerated: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await databaseService.startLearningSession({
        child_id: childId,
        module,
        ai_generated: aiGenerated
      });
      
      if (error) throw error;
      setCurrentSession(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const recordResponse = useCallback(async (
    sessionId: string,
    questionText: string,
    selectedAnswer: string,
    correctAnswer: string,
    isCorrect: boolean,
    topic?: string,
    responseTime?: number
  ) => {
    try {
      const { error } = await databaseService.recordQuestionResponse({
        session_id: sessionId,
        question_text: questionText,
        selected_answer: selectedAnswer,
        correct_answer: correctAnswer,
        is_correct: isCorrect,
        topic,
        response_time: responseTime || 0
      });
      
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record response');
    }
  }, []);

  const endSession = useCallback(async (
    sessionId: string,
    questionsAnswered: number,
    correctAnswers: number,
    pointsEarned: number,
    duration: number
  ) => {
    try {
      const { error } = await databaseService.updateLearningSession(sessionId, {
        questions_answered: questionsAnswered,
        correct_answers: correctAnswers,
        points_earned: pointsEarned,
        session_duration: duration
      });
      
      if (error) throw error;
      setCurrentSession(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end session');
    }
  }, []);

  return {
    currentSession,
    loading,
    error,
    startSession,
    recordResponse,
    endSession
  };
}

/**
 * Hook for teacher/parent analytics
 */
export function useTeacherAnalytics(childId: string | null) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!childId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await databaseService.getChildAnalytics(childId);
      if (result.error) throw result.error;
      
      setAnalytics({
        progress: result.progress,
        recentSessions: result.recentSessions,
        aiAnalytics: result.aiAnalytics
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
}