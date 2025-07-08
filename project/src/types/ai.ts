/**
 * AI Service Type Definitions
 * 
 * This file defines TypeScript interfaces for AI-related data structures
 * used throughout the application for type safety and better development experience.
 */

// Represents a dynamically generated question from AI
export interface AIQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

// Configuration for AI question generation
export interface QuestionGenerationConfig {
  module: string;
  difficulty: 'easy' | 'medium' | 'hard';
  childAge: number;
  previousTopics: string[];
  childInterests?: string[];
}

// AI response for personalized encouragement
export interface AIEncouragement {
  message: string;
  emoji: string;
  celebrationType: 'correct' | 'incorrect' | 'progress' | 'achievement';
}

// Learning analytics from AI
export interface LearningAnalytics {
  strengths: string[];
  areasForImprovement: string[];
  recommendedNextTopics: string[];
  personalizedTips: string[];
}