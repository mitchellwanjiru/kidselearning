/**
 * Main Application Component - AI-Powered Learning App
 * 
 * This is the root component that orchestrates the entire learning experience.
 * It integrates AI services to provide:
 * - Dynamic question generation based on child's progress
 * - Personalized encouragement and feedback
 * - Adaptive learning analytics and recommendations
 * - Real-time difficulty adjustment
 */

import React, { useState, useEffect } from 'react';
import { Star, Trophy, Heart, Sparkles, BookOpen, Calculator, Palette, PawPrint, Home, ChevronRight, Check, X, Brain, Loader, CheckCircle } from 'lucide-react';
import { useAI } from './hooks/useAI';
import { AIStatus, AIConfigStatus } from './components/AIStatus';
import { AIQuestion } from './types/ai';

// Learning module types for type safety
type LearningModule = 'letters' | 'numbers' | 'colors' | 'shapes' | 'animals' | 'math';

// User progress tracking interface
interface UserProgress {
  totalPoints: number;
  correctAnswers: number;
  totalAnswers: number;
  achievements: string[];
  moduleProgress: Record<LearningModule, number>;
  currentStreak: number;
  recentTopics: string[];
  childName: string;
}

// Static module configuration (used as fallback and for UI)
const moduleData = {
  letters: {
    title: "Letters & Phonics",
    icon: BookOpen,
    color: "bg-gradient-to-br from-blue-400 to-blue-600",
    description: "Learn letters, sounds, and start reading!"
  },
  numbers: {
    title: "Numbers & Counting",
    icon: Calculator,
    color: "bg-gradient-to-br from-green-400 to-green-600",
    description: "Count, add, and explore numbers!"
  },
  colors: {
    title: "Colors & Shapes",
    icon: Palette,
    color: "bg-gradient-to-br from-purple-400 to-purple-600",
    description: "Discover colors and geometric shapes!"
  },
  animals: {
    title: "Animals & Nature",
    icon: PawPrint,
    color: "bg-gradient-to-br from-orange-400 to-orange-600",
    description: "Meet animals and learn about nature!"
  },
  math: {
    title: "Simple Math",
    icon: Calculator,
    color: "bg-gradient-to-br from-pink-400 to-pink-600",
    description: "Fun with numbers and basic math!"
  }
};

function App() {
  // View state management
  const [currentView, setCurrentView] = useState<'home' | 'module' | 'quiz' | 'analytics' | 'teacher' | 'game'>('home');
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  
  // Quiz state management
  const [currentQuestions, setCurrentQuestions] = useState<AIQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [incorrectQuestions, setIncorrectQuestions] = useState<AIQuestion[]>([]);
  const [showPractice, setShowPractice] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  
  // User progress state
  const [progress, setProgress] = useState<UserProgress>({
    totalPoints: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    achievements: [],
    moduleProgress: {
      letters: 0,
      numbers: 0,
      colors: 0,
      shapes: 0,
      animals: 0,
      math: 0
    },
    currentStreak: 0,
    recentTopics: [],
    childName: 'friend'
  });

  // AI hooks for different AI functionalities
  const { questions, encouragement, analytics, isAIEnabled } = useAI();

  /**
   * Handles module selection and initiates AI question generation
   * Generates personalized questions based on child's progress and preferences
   */
  const handleModuleSelect = async (module: LearningModule) => {
    setSelectedModule(module);
    setCurrentView('module');
    
    // Generate AI-powered questions for this module
    if (isAIEnabled) {
      await questions.generateQuestions({
        module: moduleData[module].title,
        difficulty: 'easy', // Start with easy, AI will adapt
        childAge: 5, // Kindergarten age
        previousTopics: progress.recentTopics,
        childInterests: [] // Could be expanded based on user preferences
      });
    }
  };

  /**
   * Starts the quiz with AI-generated or fallback questions
   * Sets up the quiz state and begins the learning session
   */
  const startQuiz = () => {
    if (questions.questions.length > 0) {
      setCurrentQuestions(questions.questions);
    } else {
      // Use fallback questions if AI generation failed
      setCurrentQuestions(getFallbackQuestions());
    }
    
    setCurrentView('quiz');
    setCurrentQuestion(0);
    setShowAnswer(false);
    setSelectedAnswer(null);
  };

  /**
   * Handles answer selection with AI-powered feedback
   * Generates personalized encouragement and updates progress tracking
   */
  const handleAnswerSelect = async (answerIndex: number) => {
    if (showAnswer) return;
    
    setSelectedAnswer(answerIndex);
    setShowAnswer(true);
    
    const isCorrect = answerIndex === currentQuestions[currentQuestion].correct;
    const newStreak = isCorrect ? progress.currentStreak + 1 : 0;
    
    // Track incorrect questions for practice
    if (!isCorrect && !isPracticeMode) {
      setIncorrectQuestions(prev => [...prev, currentQuestions[currentQuestion]]);
    }
    
    // Update progress immediately
    setProgress(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + (isCorrect ? 10 : 0),
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      totalAnswers: prev.totalAnswers + 1,
      currentStreak: newStreak,
      moduleProgress: {
        ...prev.moduleProgress,
        [selectedModule!]: prev.moduleProgress[selectedModule!] + (isCorrect ? 1 : 0)
      },
      recentTopics: [
        currentQuestions[currentQuestion].topic,
        ...prev.recentTopics.slice(0, 9) // Keep last 10 topics
      ]
    }));

    // Generate AI-powered encouragement
    if (isAIEnabled) {
      await encouragement.generateEncouragement(isCorrect, progress.childName, newStreak);
    }
    
    if (isCorrect) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
  };

  /**
   * Advances to next question or completes the quiz
   * Triggers learning analytics when quiz is completed
   */
  const nextQuestion = async () => {
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowAnswer(false);
      setSelectedAnswer(null);
    } else {
      // Quiz completed - generate learning analytics
      if (isAIEnabled) {
        await analytics.analyzeProgress(
          progress.correctAnswers,
          progress.totalAnswers,
          progress.moduleProgress,
          progress.recentTopics
        );
        setCurrentView('analytics');
      } else {
        setCurrentView('home');
      }
    }
  };

  /**
   * Returns to home screen and resets quiz state
   */
  const goHome = () => {
    setCurrentView('home');
    setSelectedModule(null);
    setCurrentQuestion(0);
    setShowAnswer(false);
    setSelectedAnswer(null);
    setCurrentQuestions([]);
    setIncorrectQuestions([]);
    setShowPractice(false);
    setIsPracticeMode(false);
  };

  /**
   * Fallback questions when AI is unavailable
   * Ensures the app continues to function without AI services
   */
  const getFallbackQuestions = (): AIQuestion[] => {
    if (!selectedModule) return [];
    
    const fallbackData: Record<LearningModule, AIQuestion[]> = {
      letters: [
        {
          id: 'fallback-l1',
          question: 'What letter comes after A?',
          options: ['B', 'C', 'D', 'E'],
          correct: 0,
          explanation: 'Great job! B comes right after A in the alphabet!',
          difficulty: 'easy',
          topic: 'alphabet sequence'
        },
        {
          id: 'fallback-lp',
          question: 'What letter does Bag start with?',
          options: ['B', 'C', 'D', 'E'],
          correct: 0,
          explanation: 'Great job! Bag starts with B!',
          difficulty: 'easy',
          topic: 'alphabet sequence'
        }
      ],
      numbers: [
        {
          id: 'fallback-n1',
          question: 'How many fingers do you have on one hand?',
          options: ['3', '4', '5', '6'],
          correct: 2,
          explanation: 'That\'s right! You have 5 fingers on each hand!',
          difficulty: 'easy',
          topic: 'counting'
        }
      ],
      colors: [
        {
          id: 'fallback-c1',
          question: 'What color do you get when you mix red and blue?',
          options: ['Green', 'Purple', 'Orange', 'Yellow'],
          correct: 1,
          explanation: 'Perfect! Red and blue make purple!',
          difficulty: 'easy',
          topic: 'color mixing'
        }
      ],
      animals: [
        {
          id: 'fallback-a1',
          question: 'What sound does a cow make?',
          options: ['Woof', 'Meow', 'Moo', 'Roar'],
          correct: 2,
          explanation: 'Perfect! Cows say "Moo"!',
          difficulty: 'easy',
          topic: 'animal sounds'
        }
      ],
      math: [
        {
          id: 'fallback-m1',
          question: 'What is 2 + 1?',
          options: ['2', '3', '4', '5'],
          correct: 1,
          explanation: 'Amazing! 2 + 1 = 3!',
          difficulty: 'easy',
          topic: 'addition'
        }
      ],
      shapes: [
        {
          id: 'fallback-s1',
          question: 'How many sides does a triangle have?',
          options: ['2', '3', '4', '5'],
          correct: 1,
          explanation: 'Excellent! A triangle has 3 sides!',
          difficulty: 'easy',
          topic: 'shapes'
        }
      ]
    };

    return fallbackData[selectedModule] || [];
  };

  /**
   * Celebration animation component for correct answers
   * Provides visual feedback to keep children engaged
   */
  const CelebrationAnimation = () => (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="animate-bounce">
        <div className="text-6xl">🎉</div>
      </div>
      <div className="absolute inset-0 animate-pulse">
        <div className="absolute top-1/4 left-1/4 text-4xl animate-spin">⭐</div>
        <div className="absolute top-1/3 right-1/4 text-4xl animate-bounce">🌟</div>
        <div className="absolute bottom-1/3 left-1/3 text-4xl animate-ping">✨</div>
        <div className="absolute bottom-1/4 right-1/3 text-4xl animate-pulse">🎊</div>
      </div>
    </div>
  );

  /**
   * Home view component - Main dashboard with module selection
   * Shows progress, AI status, and available learning modules
   */
  const HomeView = () => (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-pink-200 to-blue-200 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with AI status */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="text-yellow-500 text-4xl" />
            <h1 className="text-5xl font-bold text-purple-800">AI Learning Buddy</h1>
            <Brain className={`text-4xl ${isAIEnabled ? 'text-green-500' : 'text-gray-400'}`} />
          </div>
          <p className="text-xl text-purple-600 font-medium">
            {isAIEnabled ? 'AI-powered personalized learning!' : 'Fun learning adventures await!'}
          </p>
          <AIStatus 
            isEnabled={isAIEnabled} 
            loading={questions.loading || encouragement.loading}
            error={questions.error || encouragement.error}
            className="mt-2 bg-white/50 mx-auto max-w-md"
          />
        </div>

        {/* Progress Dashboard */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-500 text-2xl" />
              <span className="text-lg font-bold text-gray-800">Your Amazing Progress</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="text-yellow-500 text-xl" />
                <span className="text-lg font-bold text-purple-600">{progress.totalPoints} points</span>
              </div>
              <div className="text-sm text-gray-600">
                {progress.correctAnswers}/{progress.totalAnswers} correct
              </div>
            </div>
          </div>
          
          {/* Module Progress Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(moduleData).map(([key, module]) => (
              <div key={key} className="flex items-center gap-2">
                <module.icon className="text-gray-600 text-sm" />
                <span className="text-sm font-medium text-gray-700">{module.title}</span>
                <div className="flex gap-1">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < progress.moduleProgress[key as LearningModule] ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(moduleData).map(([key, module]) => (
            <button
              key={key}
              onClick={() => handleModuleSelect(key as LearningModule)}
              disabled={questions.loading}
              className={`${module.color} p-6 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-white group disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white/20 p-4 rounded-full">
                  {questions.loading && selectedModule === key ? (
                    <Loader className="text-4xl animate-spin" />
                  ) : (
                    <module.icon className="text-4xl" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-center">{module.title}</h3>
                <p className="text-sm opacity-90 text-center">{module.description}</p>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <span>AI-powered questions</span>
                  <ChevronRight className="text-lg group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Analytics Button */}
        {analytics.analytics && (
          <div className="text-center mt-8">
            <button
              onClick={() => setCurrentView('analytics')}
              className="bg-gradient-to-r from-indigo-400 to-purple-500 text-white py-3 px-6 rounded-2xl font-bold hover:from-indigo-500 hover:to-purple-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              View Learning Report 📊
            </button>
          </div>
        )}

        {/* Game Unlock Button */}
        {progress.totalPoints >= 50 && (
          <div className="text-center mt-4">
            <button
              onClick={() => setCurrentView('game')}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 px-6 rounded-2xl font-bold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              🎮 Play Memory Game! (Unlocked!)
            </button>
          </div>
        )}

        {/* Teacher/Parent View Button */}
        <div className="text-center mt-4">
          <button
            onClick={() => setCurrentView('teacher')}
            className="bg-gradient-to-r from-gray-500 to-gray-700 text-white py-2 px-4 rounded-xl font-medium hover:from-gray-600 hover:to-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg text-sm"
          >
            👨‍🏫 Teacher/Parent View
          </button>
        </div>

        {/* Fun Footer */}
        <div className="text-center mt-12 p-6 bg-white/50 rounded-3xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="text-red-500 text-2xl animate-pulse" />
            <span className="text-lg font-bold text-purple-800">Keep learning and growing!</span>
            <Heart className="text-red-500 text-2xl animate-pulse" />
          </div>
          <p className="text-purple-600">
            {isAIEnabled ? 'AI is making learning perfect just for you! 🤖✨' : 'Every question makes you smarter! 🧠✨'}
          </p>
        </div>
      </div>
    </div>
  );

  /**
   * Module introduction view - Shows selected module details
   * Displays AI-generated content preview and starts quiz
   */
  const ModuleView = () => {
    if (!selectedModule) return null;
    const module = moduleData[selectedModule];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={goHome}
              className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <Home className="text-purple-600 text-xl" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-purple-800">{module.title}</h1>
              <p className="text-purple-600">
                {isAIEnabled ? 'AI is preparing perfect questions for you!' : 'Ready to learn something awesome?'}
              </p>
            </div>
          </div>

          {/* Module Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <div className={`${module.color} p-6 rounded-2xl mb-6`}>
              <div className="flex items-center justify-center">
                {questions.loading ? (
                  <Loader className="text-white text-8xl animate-spin" />
                ) : (
                  <module.icon className="text-white text-8xl" />
                )}
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Let's Explore {module.title}!</h2>
              <p className="text-lg text-gray-600">
                {questions.loading 
                  ? 'AI is creating personalized questions just for you...'
                  : `I have ${questions.questions.length || 3} fun questions ready. Are you excited to show me how smart you are?`
                }
              </p>
              
              {/* AI Status in Module View */}
              <AIStatus 
                isEnabled={isAIEnabled} 
                loading={questions.loading}
                error={questions.error}
                className="mt-4 bg-blue-50 mx-auto max-w-md"
              />
            </div>

            <button
              onClick={startQuiz}
              disabled={questions.loading}
              className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-4 px-8 rounded-2xl text-xl font-bold hover:from-green-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {questions.loading ? 'AI is preparing...' : 'Start Learning! 🚀'}
            </button>
          </div>

          {/* AI Buddy Message */}
          <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 rounded-2xl p-6 border-4 border-yellow-400">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <span className="font-bold text-yellow-800">AI Buddy says:</span>
            </div>
            <p className="text-yellow-800 font-medium">
              {isAIEnabled 
                ? "Hi there! I'm your AI learning buddy. I'm creating special questions that are perfect for you based on what you like to learn. Let's have amazing fun together!"
                : "Hi there! I'm your learning buddy. I'll help you learn by asking questions and celebrating when you do great! Let's have fun together!"
              }
            </p>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Quiz view component - Interactive question and answer interface
   * Features AI-generated questions and personalized feedback
   */
  const QuizView = () => {
    if (!selectedModule || currentQuestions.length === 0) return null;
    
    const module = moduleData[selectedModule];
    const question = currentQuestions[currentQuestion];
    const isCorrect = selectedAnswer === question.correct;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={goHome}
              className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <Home className="text-purple-600 text-xl" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-purple-800">
                Question {currentQuestion + 1} of {currentQuestions.length}
              </span>
              {isAIEnabled && <Brain className="text-green-500 text-lg" />}
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <module.icon className="text-4xl text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-800">{module.title}</h2>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">{question.question}</h3>
              {isAIEnabled && (
                <div className="text-sm text-gray-500 bg-blue-50 rounded-lg p-2">
                  AI-generated question about: {question.topic}
                </div>
              )}
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showAnswer}
                  className={`p-4 rounded-2xl text-lg font-bold transition-all duration-300 ${
                    showAnswer
                      ? index === question.correct
                        ? 'bg-green-500 text-white'
                        : index === selectedAnswer
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200 hover:scale-105'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-800 font-bold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                    {showAnswer && index === question.correct && (
                      <Check className="text-white text-xl ml-auto" />
                    )}
                    {showAnswer && index === selectedAnswer && index !== question.correct && (
                      <X className="text-white text-xl ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* AI-Powered Explanation and Encouragement */}
            {showAnswer && (
              <div className={`p-6 rounded-2xl ${isCorrect ? 'bg-green-100' : 'bg-blue-100'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-lg">🤖</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    {isAIEnabled ? 'AI Buddy explains:' : 'Learning Buddy explains:'}
                  </span>
                </div>
                
                {/* AI-generated encouragement or fallback explanation */}
                <p className="text-gray-800 font-medium mb-4">
                  {encouragement.encouragement?.message || question.explanation}
                  {encouragement.encouragement?.emoji && (
                    <span className="ml-2 text-2xl">{encouragement.encouragement.emoji}</span>
                  )}
                </p>
                
                {/* Show AI thinking indicator */}
                {encouragement.loading && (
                  <div className="flex items-center gap-2 text-blue-600 mb-4">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-sm">AI is thinking of something special to say...</span>
                  </div>
                )}
                
                <button
                  onClick={nextQuestion}
                  className="w-full bg-gradient-to-r from-purple-400 to-blue-500 text-white py-3 px-6 rounded-xl text-lg font-bold hover:from-purple-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-300"
                >
                  {currentQuestion < currentQuestions.length - 1 ? 'Next Question! 🎯' : 'Finish Quiz! 🎉'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Analytics view component - AI-powered learning insights
   * Shows personalized recommendations and progress analysis
   */
  const AnalyticsView = () => {
    if (!analytics.analytics) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={goHome}
              className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <Home className="text-purple-600 text-xl" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-purple-800">Your Learning Report</h1>
              <p className="text-purple-600">AI analyzed your progress and has special insights!</p>
            </div>
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Trophy className="text-green-600 text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Your Superpowers!</h3>
              </div>
              <ul className="space-y-2">
                {analytics.analytics.strengths.map((strength, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Star className="text-yellow-500 text-sm" />
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Brain className="text-blue-600 text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Let's Practice More!</h3>
              </div>
              <ul className="space-y-2">
                {analytics.analytics.areasForImprovement.map((area, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <ChevronRight className="text-blue-500 text-sm" />
                    <span className="text-gray-700">{area}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Topics */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Sparkles className="text-purple-600 text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Try These Next!</h3>
              </div>
              <ul className="space-y-2">
                {analytics.analytics.recommendedNextTopics.map((topic, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Heart className="text-pink-500 text-sm" />
                    <span className="text-gray-700">{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Personalized Tips */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">AI Tips Just for You!</h3>
              </div>
              <ul className="space-y-2">
                {analytics.analytics.personalizedTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-500 text-sm mt-1">💡</span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Continue Learning Button */}
          <div className="text-center mt-8">
            <button
              onClick={goHome}
              className="bg-gradient-to-r from-green-400 to-blue-500 text-white py-4 px-8 rounded-2xl text-xl font-bold hover:from-green-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Continue Learning! 🚀
            </button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Memory Game component - Unlocked when child reaches certain points
   */
  const GameView = () => {
    const [gameCards, setGameCards] = useState<{ id: number; emoji: string; isFlipped: boolean; isMatched: boolean }[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [gameScore, setGameScore] = useState(0);
    const [gameComplete, setGameComplete] = useState(false);

    // Initialize game on component mount
    React.useEffect(() => {
      const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
      const shuffledCards = [...emojis, ...emojis]
        .sort(() => Math.random() - 0.5)
        .map((emoji, index) => ({
          id: index,
          emoji,
          isFlipped: false,
          isMatched: false
        }));
      setGameCards(shuffledCards);
    }, []);

    const handleCardClick = (cardId: number) => {
      if (flippedCards.length === 2 || gameCards[cardId].isMatched || gameCards[cardId].isFlipped) {
        return;
      }

      const newCards = [...gameCards];
      newCards[cardId].isFlipped = true;
      setGameCards(newCards);

      const newFlippedCards = [...flippedCards, cardId];
      setFlippedCards(newFlippedCards);

      if (newFlippedCards.length === 2) {
        const [first, second] = newFlippedCards;
        if (gameCards[first].emoji === gameCards[second].emoji) {
          // Match found
          setTimeout(() => {
            const updatedCards = [...newCards];
            updatedCards[first].isMatched = true;
            updatedCards[second].isMatched = true;
            setGameCards(updatedCards);
            setGameScore(prev => prev + 10);
            setFlippedCards([]);

            // Check if game is complete
            if (updatedCards.every(card => card.isMatched)) {
              setGameComplete(true);
              setProgress(prev => ({ ...prev, totalPoints: prev.totalPoints + 50 }));
            }
          }, 1000);
        } else {
          // No match
          setTimeout(() => {
            const updatedCards = [...newCards];
            updatedCards[first].isFlipped = false;
            updatedCards[second].isFlipped = false;
            setGameCards(updatedCards);
            setFlippedCards([]);
          }, 1000);
        }
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={goHome}
              className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <Home className="text-purple-600 text-xl" />
            </button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-orange-800">🎮 Memory Game</h1>
              <p className="text-orange-600">Score: {gameScore} points</p>
            </div>
            <div className="w-12"></div>
          </div>

          {gameComplete ? (
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">Congratulations!</h2>
              <p className="text-xl text-gray-700 mb-6">
                You completed the memory game and earned 50 bonus points!
              </p>
              <button
                onClick={goHome}
                className="bg-gradient-to-r from-green-400 to-blue-500 text-white py-3 px-6 rounded-2xl text-lg font-bold hover:from-green-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-300"
              >
                Back to Learning! 🚀
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Find the Matching Pairs!</h2>
                <p className="text-gray-600">Click on cards to flip them and find matches</p>
              </div>
              
              <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
                {gameCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className={`aspect-square rounded-xl text-3xl font-bold transition-all duration-300 ${
                      card.isFlipped || card.isMatched
                        ? 'bg-white border-2 border-orange-300 shadow-lg'
                        : 'bg-gradient-to-br from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 shadow-md hover:shadow-lg transform hover:scale-105'
                    }`}
                    disabled={card.isMatched}
                  >
                    {card.isFlipped || card.isMatched ? card.emoji : '?'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Teacher/Parent Progress View
   */
  const TeacherView = () => {
    const accuracyRate = progress.totalAnswers > 0 ? Math.round((progress.correctAnswers / progress.totalAnswers) * 100) : 0;
    const totalModulesStarted = Object.values(progress.moduleProgress).filter(p => p > 0).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={goHome}
              className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <Home className="text-purple-600 text-xl" />
            </button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-800">👨‍🏫 Progress Dashboard</h1>
              <p className="text-slate-600">Detailed learning analytics for educators and parents</p>
            </div>
            <div className="w-12"></div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Trophy className="text-blue-600 text-lg" />
                </div>
                <span className="font-bold text-gray-800">Total Points</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">{progress.totalPoints}</div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-600 text-lg" />
                </div>
                <span className="font-bold text-gray-800">Accuracy</span>
              </div>
              <div className="text-3xl font-bold text-green-600">{accuracyRate}%</div>
              <div className="text-sm text-gray-500">{progress.correctAnswers}/{progress.totalAnswers} correct</div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <BookOpen className="text-purple-600 text-lg" />
                </div>
                <span className="font-bold text-gray-800">Modules</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">{totalModulesStarted}</div>
              <div className="text-sm text-gray-500">modules started</div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Sparkles className="text-orange-600 text-lg" />
                </div>
                <span className="font-bold text-gray-800">Streak</span>
              </div>
              <div className="text-3xl font-bold text-orange-600">{progress.currentStreak}</div>
              <div className="text-sm text-gray-500">in a row</div>
            </div>
          </div>

          {/* Detailed Module Progress */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Module Progress Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(moduleData).map(([key, module]) => {
                const moduleProgress = progress.moduleProgress[key as LearningModule];
                const progressPercentage = Math.min((moduleProgress / 5) * 100, 100);
                
                return (
                  <div key={key} className="border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`${module.color} p-3 rounded-full`}>
                        <module.icon className="text-white text-xl" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{module.title}</h4>
                        <p className="text-sm text-gray-600">{moduleProgress}/5 questions correct</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600">{Math.round(progressPercentage)}% complete</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Learning Topics */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Recent Learning Activity</h3>
            {progress.recentTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {progress.recentTopics.slice(0, 10).map((topic, index) => (
                  <span 
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No learning activity yet. Start a quiz to see topics here!</p>
            )}
          </div>

          {/* AI Status for Teachers */}
          <div className="mt-8">
            <AIStatus 
              isEnabled={isAIEnabled} 
              loading={questions.loading || encouragement.loading || analytics.loading}
              error={questions.error || encouragement.error || analytics.error}
              className="bg-white/80 mx-auto max-w-md"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans">
      {/* Celebration Animation */}
      {showCelebration && <CelebrationAnimation />}
      
      {/* View Router */}
      {currentView === 'home' && <HomeView />}
      {currentView === 'module' && <ModuleView />}
      {currentView === 'quiz' && <QuizView />}
      {currentView === 'analytics' && <AnalyticsView />}
      {currentView === 'teacher' && <TeacherView />}
      {currentView === 'game' && <GameView />}
      
      {/* Developer AI Configuration Status (only in development) */}
      <AIConfigStatus />
    </div>
  );
}

export default App;