/**
 * Custom React Hook for AI Integration
 * 
 * This hook provides a clean interface for components to interact with AI services.
 * It handles loading states, error handling, and caching for better performance.
 */

import { useState, useCallback } from 'react';
import { aiService } from '../services/aiService';
import { AIQuestion, AIEncouragement, LearningAnalytics, QuestionGenerationConfig } from '../types/ai';

interface UseAIQuestionsResult {
  questions: AIQuestion[];
  loading: boolean;
  error: string | null;
  generateQuestions: (config: QuestionGenerationConfig) => Promise<void>;
  isAIEnabled: boolean;
}

interface UseAIEncouragementResult {
  encouragement: AIEncouragement | null;
  loading: boolean;
  error: string | null;
  generateEncouragement: (isCorrect: boolean, childName?: string, streak?: number) => Promise<void>;
}

interface UseAIAnalyticsResult {
  analytics: LearningAnalytics | null;
  loading: boolean;
  error: string | null;
  analyzeProgress: (correctAnswers: number, totalAnswers: number, moduleProgress: Record<string, number>, recentTopics: string[]) => Promise<void>;
}

/**
 * Hook for managing AI-generated questions
 * Provides loading states and error handling for question generation
 */
export function useAIQuestions(): UseAIQuestionsResult {
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuestions = useCallback(async (config: QuestionGenerationConfig) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Hook: Generating questions with config:', config);
      const newQuestions = await aiService.generateQuestions(config);
      console.log('Hook: Received questions:', newQuestions.length, 'questions');
      console.log('Hook: First question ID check:', newQuestions[0]?.id);
      setQuestions(newQuestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate questions');
      console.error('Question generation error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    questions,
    loading,
    error,
    generateQuestions,
    isAIEnabled: aiService.isAIEnabled()
  };
}

/**
 * Hook for managing AI-generated encouragement messages
 * Provides personalized feedback based on child's performance
 */
export function useAIEncouragement(): UseAIEncouragementResult {
  const [encouragement, setEncouragement] = useState<AIEncouragement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateEncouragement = useCallback(async (
    isCorrect: boolean, 
    childName: string = "friend", 
    streak: number = 0
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const newEncouragement = await aiService.generateEncouragement(isCorrect, childName, streak);
      setEncouragement(newEncouragement);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate encouragement');
      console.error('Encouragement generation error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    encouragement,
    loading,
    error,
    generateEncouragement
  };
}

/**
 * Hook for managing AI-powered learning analytics
 * Analyzes child's progress and provides personalized recommendations
 */
export function useAIAnalytics(): UseAIAnalyticsResult {
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeProgress = useCallback(async (
    correctAnswers: number,
    totalAnswers: number,
    moduleProgress: Record<string, number>,
    recentTopics: string[]
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const newAnalytics = await aiService.analyzeLearningProgress(
        correctAnswers,
        totalAnswers,
        moduleProgress,
        recentTopics
      );
      setAnalytics(newAnalytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze progress');
      console.error('Analytics generation error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    analytics,
    loading,
    error,
    analyzeProgress
  };
}

/**
 * Combined hook that provides all AI functionality
 * Useful for components that need multiple AI features
 */
export function useAI() {
  const questions = useAIQuestions();
  const encouragement = useAIEncouragement();
  const analytics = useAIAnalytics();

  return {
    questions,
    encouragement,
    analytics,
    isAIEnabled: aiService.isAIEnabled()
  };
}