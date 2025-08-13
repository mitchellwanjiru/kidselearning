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

import React, { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import {
  Star,
  Trophy,
  Heart,
  Sparkles,
  BookOpen,
  Calculator,
  Palette,
  PawPrint,
  Home,
  ChevronRight,
  Check,
  X,
  Brain,
  Loader,
  CheckCircle,
} from "lucide-react";
import { useAI } from "./hooks/useAI";
import { AuthWrapper } from "./components/AuthWrapper";
import { AIQuestion } from "./types/ai";
import { databaseService } from "./services/databaseService";
import { AIConfigStatus } from "./components/AIConfigStatus";
import {
  GameCenter,
  MemoryGame,
  ColorGame,
  MathGame,
} from "./components/games";

// Learning module types for type safety
type LearningModule =
  | "letters"
  | "numbers"
  | "colors"
  | "shapes"
  | "animals"
  | "math";

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
    description: "Learn letters, sounds, and start reading!",
  },
  numbers: {
    title: "Numbers & Counting",
    icon: Calculator,
    color: "bg-gradient-to-br from-green-400 to-green-600",
    description: "Count, add, and explore numbers!",
  },
  colors: {
    title: "Colors & Shapes",
    icon: Palette,
    color: "bg-gradient-to-br from-purple-400 to-purple-600",
    description: "Discover colors and geometric shapes!",
  },
  shapes: {
    title: "Shapes",
    icon: Palette,
    color: "bg-gradient-to-br from-indigo-400 to-indigo-600",
    description: "Learn about different shapes!",
  },
  animals: {
    title: "Animals & Nature",
    icon: PawPrint,
    color: "bg-gradient-to-br from-orange-400 to-orange-600",
    description: "Meet animals and learn about nature!",
  },
  math: {
    title: "Simple Math",
    icon: Calculator,
    color: "bg-gradient-to-br from-pink-400 to-pink-600",
    description: "Fun with numbers and basic math!",
  },
};

function App() {
  return <AuthWrapper>{(user: User) => <MainApp user={user} />}</AuthWrapper>;
}

function MainApp({ user }: { user: User }) {
  // User and child state
  const [currentChild, setCurrentChild] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [showChildSelection, setShowChildSelection] = useState(false);

  // View state management
  const [currentView, setCurrentView] = useState<
    | "home"
    | "module"
    | "quiz"
    | "analytics"
    | "teacher"
    | "game"
    | "memory"
    | "colors"
    | "math"
  >("home");
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(
    null
  );

  // Quiz state management
  const [currentQuestions, setCurrentQuestions] = useState<AIQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [, setIncorrectQuestions] = useState<AIQuestion[]>([]);
  const [, setShowPractice] = useState(false);
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
      math: 0,
    },
    currentStreak: 0,
    recentTopics: [],
    childName: currentChild?.name || "friend",
  });

  // Session tracking for database
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  // AI hooks for different AI functionalities
  const { questions, encouragement, analytics, isAIEnabled } = useAI();

  /**
   * Handles module selection and initiates AI question generation
   * Generates personalized questions based on child's progress and preferences
   */
  const handleModuleSelect = async (module: LearningModule) => {
    setSelectedModule(module);
    setCurrentView("module");

    // Generate AI-powered questions for this module
    if (isAIEnabled && currentChild) {
      await questions.generateQuestions({
        module: moduleData[module].title,
        difficulty: getDifficultyForAge(currentChild.age), // Age-appropriate difficulty
        childAge: currentChild.age, // Use actual child's age
        previousTopics: progress.recentTopics,
        childInterests: [], // Could be expanded based on user preferences
      });
    }
  };

  /**
   * Determines appropriate difficulty level based on child's age
   */
  const getDifficultyForAge = (age: number): string => {
    if (age <= 5) return "very_easy";
    if (age <= 7) return "easy";
    if (age <= 9) return "medium";
    return "medium_hard";
  };

  /**
   * Gets age-appropriate question count based on child's age and attention span
   */
  const getQuestionCountForAge = (age: number): number => {
    if (age <= 5) return 3; // Shorter sessions for younger kids
    if (age <= 7) return 4;
    if (age <= 9) return 5;
    return 6; // Longer sessions for older kids
  };

  /**
   * Starts the quiz with AI-generated or fallback questions
   * Sets up the quiz state and begins the learning session
   */
  const startQuiz = async () => {
    let questionsToUse = [];

    if (questions.questions.length > 0) {
      // Limit questions based on child's age for appropriate attention span
      const maxQuestions = getQuestionCountForAge(currentChild.age);
      questionsToUse = questions.questions.slice(0, maxQuestions);
    } else {
      // Use fallback questions if AI generation failed
      const fallbackQuestions = getFallbackQuestions();
      const maxQuestions = getQuestionCountForAge(currentChild.age);
      questionsToUse = fallbackQuestions.slice(0, maxQuestions);
    }

    setCurrentQuestions(questionsToUse);

    // Create a new learning session in the database
    try {
      const { data: sessionData, error } =
        await databaseService.startLearningSession({
          child_id: currentChild.id,
          module: selectedModule!,
          ai_generated: isAIEnabled,
          session_date: new Date().toISOString(),
          questions_answered: 0,
          correct_answers: 0,
          points_earned: 0,
          session_duration: 0,
        });

      if (sessionData && !error) {
        setCurrentSession(sessionData.id);
        setSessionStartTime(Date.now());
      }
    } catch (error) {
      console.error("Failed to create session:", error);
    }

    setCurrentView("quiz");
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
      setIncorrectQuestions((prev) => [
        ...prev,
        currentQuestions[currentQuestion],
      ]);
    }

    // Save question response to database
    if (currentSession) {
      try {
        await databaseService.recordQuestionResponse({
          session_id: currentSession,
          question_text: currentQuestions[currentQuestion].question,
          selected_answer:
            currentQuestions[currentQuestion].options[answerIndex],
          correct_answer:
            currentQuestions[currentQuestion].options[
              currentQuestions[currentQuestion].correct
            ],
          is_correct: isCorrect,
          topic: currentQuestions[currentQuestion].topic,
          response_time: 0, // Could be enhanced to track actual response time
          answered_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Failed to save question response:", error);
      }
    }

    // Update progress immediately
    setProgress((prev) => ({
      ...prev,
      totalPoints: prev.totalPoints + (isCorrect ? 10 : 0),
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      totalAnswers: prev.totalAnswers + 1,
      currentStreak: newStreak,
      moduleProgress: {
        ...prev.moduleProgress,
        [selectedModule!]:
          prev.moduleProgress[selectedModule!] + (isCorrect ? 1 : 0),
      },
      recentTopics: [
        currentQuestions[currentQuestion].topic,
        ...prev.recentTopics.slice(0, 9), // Keep last 10 topics
      ],
    }));

    // Generate AI-powered encouragement
    if (isAIEnabled) {
      await encouragement.generateEncouragement(
        isCorrect,
        progress.childName,
        newStreak
      );
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
      // Quiz completed - update session and generate learning analytics
      if (currentSession && sessionStartTime) {
        try {
          const sessionDuration = Math.floor(
            (Date.now() - sessionStartTime) / 1000
          );

          await databaseService.updateLearningSession(currentSession, {
            questions_answered: currentQuestions.length,
            correct_answers: progress.correctAnswers,
            points_earned: progress.totalPoints,
            session_duration: sessionDuration,
          });

          // Update child's overall progress
          await databaseService.updateChildProgress(currentChild.id, {
            total_points: progress.totalPoints,
            total_questions: progress.totalAnswers,
            correct_answers: progress.correctAnswers,
            current_streak: progress.currentStreak,
            modules_completed: progress.moduleProgress,
            last_activity: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Failed to update session:", error);
        }
      }

      await analytics.analyzeProgress(
        progress.correctAnswers,
        progress.totalAnswers,
        progress.moduleProgress,
        progress.recentTopics
      );
      setCurrentView("analytics");
    }
  };

  /**
   * Returns to home screen and resets quiz state
   */
  const goHome = () => {
    setCurrentView("home");
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
          id: "fallback-l1",
          question: "What letter comes after A?",
          options: ["B", "C", "D", "E"],
          correct: 0,
          explanation: "Great job! B comes right after A in the alphabet!",
          difficulty: "easy",
          topic: "alphabet sequence",
        },
        {
          id: "fallback-l2",
          question: "What letter does Bag start with?",
          options: ["B", "C", "D", "E"],
          correct: 0,
          explanation: "Great job! Bag starts with B!",
          difficulty: "easy",
          topic: "letter sounds",
        },
        {
          id: "fallback-l3",
          question: "Which letter comes before D?",
          options: ["A", "B", "C", "E"],
          correct: 2,
          explanation: "Perfect! C comes right before D!",
          difficulty: "easy",
          topic: "alphabet sequence",
        },
        {
          id: "fallback-l4",
          question: "What letter does Cat start with?",
          options: ["B", "C", "D", "E"],
          correct: 1,
          explanation: "Excellent! Cat starts with C!",
          difficulty: "easy",
          topic: "letter sounds",
        },
        {
          id: "fallback-l5",
          question: "Which is the first letter of the alphabet?",
          options: ["A", "B", "C", "D"],
          correct: 0,
          explanation: "Amazing! A is the very first letter!",
          difficulty: "easy",
          topic: "alphabet sequence",
        },
      ],
      numbers: [
        {
          id: "fallback-n1",
          question: "How many fingers do you have on one hand?",
          options: ["3", "4", "5", "6"],
          correct: 2,
          explanation: "That's right! You have 5 fingers on each hand!",
          difficulty: "easy",
          topic: "counting",
        },
        {
          id: "fallback-n2",
          question: "What number comes after 3?",
          options: ["2", "4", "5", "6"],
          correct: 1,
          explanation: "Perfect! 4 comes after 3!",
          difficulty: "easy",
          topic: "number sequence",
        },
        {
          id: "fallback-n3",
          question: "How many eyes do you have?",
          options: ["1", "2", "3", "4"],
          correct: 1,
          explanation: "Great! You have 2 eyes!",
          difficulty: "easy",
          topic: "counting",
        },
        {
          id: "fallback-n4",
          question: "What number comes before 2?",
          options: ["1", "3", "4", "5"],
          correct: 0,
          explanation: "Excellent! 1 comes before 2!",
          difficulty: "easy",
          topic: "number sequence",
        },
        {
          id: "fallback-n5",
          question: "Count the dots: • • •",
          options: ["2", "3", "4", "5"],
          correct: 1,
          explanation: "Amazing! There are 3 dots!",
          difficulty: "easy",
          topic: "counting",
        },
      ],
      colors: [
        {
          id: "fallback-c1",
          question: "What color do you get when you mix red and blue?",
          options: ["Green", "Purple", "Orange", "Yellow"],
          correct: 1,
          explanation: "Perfect! Red and blue make purple!",
          difficulty: "easy",
          topic: "color mixing",
        },
        {
          id: "fallback-c2",
          question: "What color is the sun?",
          options: ["Blue", "Green", "Yellow", "Purple"],
          correct: 2,
          explanation: "Great! The sun is yellow!",
          difficulty: "easy",
          topic: "color recognition",
        },
        {
          id: "fallback-c3",
          question: "What color do you get when you mix yellow and red?",
          options: ["Purple", "Orange", "Green", "Blue"],
          correct: 1,
          explanation: "Excellent! Yellow and red make orange!",
          difficulty: "easy",
          topic: "color mixing",
        },
        {
          id: "fallback-c4",
          question: "What color is grass?",
          options: ["Red", "Green", "Blue", "Yellow"],
          correct: 1,
          explanation: "Perfect! Grass is green!",
          difficulty: "easy",
          topic: "color recognition",
        },
        {
          id: "fallback-c5",
          question: "What color is the sky?",
          options: ["Red", "Yellow", "Blue", "Green"],
          correct: 2,
          explanation: "Amazing! The sky is blue!",
          difficulty: "easy",
          topic: "color recognition",
        },
      ],
      animals: [
        {
          id: "fallback-a1",
          question: "What sound does a cow make?",
          options: ["Woof", "Meow", "Moo", "Roar"],
          correct: 2,
          explanation: 'Perfect! Cows say "Moo"!',
          difficulty: "easy",
          topic: "animal sounds",
        },
        {
          id: "fallback-a2",
          question: "What sound does a dog make?",
          options: ["Woof", "Meow", "Moo", "Roar"],
          correct: 0,
          explanation: 'Great! Dogs say "Woof"!',
          difficulty: "easy",
          topic: "animal sounds",
        },
        {
          id: "fallback-a3",
          question: "What sound does a cat make?",
          options: ["Woof", "Meow", "Moo", "Roar"],
          correct: 1,
          explanation: 'Excellent! Cats say "Meow"!',
          difficulty: "easy",
          topic: "animal sounds",
        },
        {
          id: "fallback-a4",
          question: "Which animal has a long trunk?",
          options: ["Dog", "Cat", "Elephant", "Bird"],
          correct: 2,
          explanation: "Perfect! Elephants have long trunks!",
          difficulty: "easy",
          topic: "animal features",
        },
        {
          id: "fallback-a5",
          question: "Which animal can fly?",
          options: ["Dog", "Bird", "Cat", "Fish"],
          correct: 1,
          explanation: "Amazing! Birds can fly!",
          difficulty: "easy",
          topic: "animal abilities",
        },
      ],
      math: [
        {
          id: "fallback-m1",
          question: "What is 2 + 1?",
          options: ["2", "3", "4", "5"],
          correct: 1,
          explanation: "Amazing! 2 + 1 = 3!",
          difficulty: "easy",
          topic: "addition",
        },
        {
          id: "fallback-m2",
          question: "What is 1 + 1?",
          options: ["1", "2", "3", "4"],
          correct: 1,
          explanation: "Perfect! 1 + 1 = 2!",
          difficulty: "easy",
          topic: "addition",
        },
        {
          id: "fallback-m3",
          question: "What is 3 + 1?",
          options: ["3", "4", "5", "6"],
          correct: 1,
          explanation: "Great! 3 + 1 = 4!",
          difficulty: "easy",
          topic: "addition",
        },
        {
          id: "fallback-m4",
          question: "What is 2 + 2?",
          options: ["3", "4", "5", "6"],
          correct: 1,
          explanation: "Excellent! 2 + 2 = 4!",
          difficulty: "easy",
          topic: "addition",
        },
        {
          id: "fallback-m5",
          question: "What is 5 - 1?",
          options: ["3", "4", "5", "6"],
          correct: 1,
          explanation: "Amazing! 5 - 1 = 4!",
          difficulty: "easy",
          topic: "subtraction",
        },
      ],
      shapes: [
        {
          id: "fallback-s1",
          question: "How many sides does a triangle have?",
          options: ["2", "3", "4", "5"],
          correct: 1,
          explanation: "Excellent! A triangle has 3 sides!",
          difficulty: "easy",
          topic: "shapes",
        },
        {
          id: "fallback-s2",
          question: "How many sides does a square have?",
          options: ["2", "3", "4", "5"],
          correct: 2,
          explanation: "Perfect! A square has 4 sides!",
          difficulty: "easy",
          topic: "shapes",
        },
        {
          id: "fallback-s3",
          question: "Which shape is round?",
          options: ["Triangle", "Square", "Circle", "Rectangle"],
          correct: 2,
          explanation: "Great! A circle is round!",
          difficulty: "easy",
          topic: "shapes",
        },
        {
          id: "fallback-s4",
          question: "How many corners does a rectangle have?",
          options: ["2", "3", "4", "5"],
          correct: 2,
          explanation: "Excellent! A rectangle has 4 corners!",
          difficulty: "easy",
          topic: "shapes",
        },
        {
          id: "fallback-s5",
          question: "Which shape has no corners?",
          options: ["Triangle", "Square", "Circle", "Rectangle"],
          correct: 2,
          explanation: "Amazing! A circle has no corners!",
          difficulty: "easy",
          topic: "shapes",
        },
      ],
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
        <div className="absolute top-1/4 left-1/4 text-4xl animate-spin">
          ⭐
        </div>
        <div className="absolute top-1/3 right-1/4 text-4xl animate-bounce">
          🌟
        </div>
        <div className="absolute bottom-1/3 left-1/3 text-4xl animate-ping">
          ✨
        </div>
        <div className="absolute bottom-1/4 right-1/3 text-4xl animate-pulse">
          🎊
        </div>
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
          {/* Child Switcher */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="bg-white rounded-2xl p-3 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-lg">
                  👶
                </div>
                <span className="font-bold text-gray-800">
                  Learning as: {currentChild.name}
                </span>
                <button
                  onClick={() => setShowChildSelection(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Switch Child
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="text-yellow-500 text-4xl" />
            <h1 className="text-5xl font-bold text-purple-800">
              AI Learning Buddy
            </h1>
            <Brain
              className={`text-4xl ${
                isAIEnabled ? "text-green-500" : "text-gray-400"
              }`}
            />
          </div>
          <p className="text-xl text-purple-600 font-medium">
            {isAIEnabled
              ? "Personalized learning!"
              : "Fun learning adventures await!"}
          </p>
        </div>

        {/* Progress Dashboard */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-500 text-2xl" />
              <span className="text-lg font-bold text-gray-800">
                Your Amazing Progress
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="text-yellow-500 text-xl" />
                <span className="text-lg font-bold text-purple-600">
                  {progress.totalPoints} points
                </span>
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
                <span className="text-sm font-medium text-gray-700">
                  {module.title}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < progress.moduleProgress[key as LearningModule]
                          ? "bg-green-500"
                          : "bg-gray-300"
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
                <h3 className="text-xl font-bold text-center">
                  {module.title}
                </h3>
                <p className="text-sm opacity-90 text-center">
                  {module.description}
                </p>
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
              onClick={() => setCurrentView("analytics")}
              className="bg-gradient-to-r from-indigo-400 to-purple-500 text-white py-3 px-6 rounded-2xl font-bold hover:from-indigo-500 hover:to-purple-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              View Learning Report 📊
            </button>
          </div>
        )}

        {/* Game Unlock Button - Updated to show game center */}
        {progress.totalPoints >= 50 && (
          <div className="text-center mt-4">
            <button
              onClick={() => setCurrentView("game")}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 px-6 rounded-2xl font-bold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              🎮 Game Center! (
              {Math.min(3, Math.floor(progress.totalPoints / 50))} games
              unlocked!)
            </button>
          </div>
        )}

        {/* Teacher/Parent View Button */}
        <div className="text-center mt-4">
          <button
            onClick={() => setCurrentView("teacher")}
            className="bg-gradient-to-r from-gray-500 to-gray-700 text-white py-2 px-4 rounded-xl font-medium hover:from-gray-600 hover:to-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg text-sm"
          >
            👨‍🏫 Teacher/Parent View
          </button>
        </div>

        {/* Fun Footer */}
        <div className="text-center mt-12 p-6 bg-white/50 rounded-3xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="text-red-500 text-2xl animate-pulse" />
            <span className="text-lg font-bold text-purple-800">
              Keep learning and growing! Earn more points to unlock games!
            </span>
            <Heart className="text-red-500 text-2xl animate-pulse" />
          </div>
          <p className="text-purple-600">
            {isAIEnabled
              ? "AI is making learning perfect just for you! 🤖✨"
              : "Every question makes you smarter! 🧠✨"}
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
    const expectedQuestions =
      questions.questions.length || getQuestionCountForAge(currentChild.age);

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
              <h1 className="text-3xl font-bold text-purple-800">
                {module.title}
              </h1>
              <p className="text-purple-600">
                {isAIEnabled
                  ? `AI is preparing ${expectedQuestions} perfect questions for ${currentChild.name} (age ${currentChild.age})!`
                  : `Ready to learn something awesome, ${currentChild.name}?`}
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
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Let's Explore {module.title}!
              </h2>
              <p className="text-lg text-gray-600">
                {questions.loading
                  ? `AI is creating ${expectedQuestions} personalized questions just right for a ${currentChild.age}-year-old...`
                  : `I have ${expectedQuestions} fun questions ready for you, ${currentChild.name}. Are you excited to show me how smart you are?`}
              </p>

              {/* Age-appropriate messaging */}
              <div className="mt-4 bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  🎯 Questions tailored for age {currentChild.age} •
                  {currentChild.age <= 5 && " Extra fun and simple!"}
                  {currentChild.age >= 6 &&
                    currentChild.age <= 8 &&
                    " Perfect for your reading level!"}
                  {currentChild.age >= 9 && " More challenging and engaging!"}
                </p>
              </div>

              {/* AI Status in Module View */}
              <AIConfigStatus
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
              {questions.loading ? "AI is preparing..." : "Start Learning! 🚀"}
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
                ? `Hi ${currentChild.name}! I'm your AI learning buddy. I'm creating special questions that are perfect for a ${currentChild.age}-year-old like you. Let's have amazing fun together!`
                : `Hi ${currentChild.name}! I'm your learning buddy. I'll help you learn with questions that are just right for you! Let's have fun together!`}
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
                <h2 className="text-2xl font-bold text-gray-800">
                  {module.title}
                </h2>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                {question.question}
              </h3>
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
                        ? "bg-green-500 text-white"
                        : index === selectedAnswer
                        ? "bg-red-500 text-white"
                        : "bg-gray-200 text-gray-500"
                      : "bg-blue-100 text-blue-800 hover:bg-blue-200 hover:scale-105"
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
                    {showAnswer &&
                      index === selectedAnswer &&
                      index !== question.correct && (
                        <X className="text-white text-xl ml-auto" />
                      )}
                  </div>
                </button>
              ))}
            </div>

            {/* AI-Powered Explanation and Encouragement */}
            {showAnswer && (
              <div
                className={`p-6 rounded-2xl ${
                  isCorrect ? "bg-green-100" : "bg-blue-100"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-lg">🤖</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    {isAIEnabled
                      ? "AI Buddy explains:"
                      : "Learning Buddy explains:"}
                  </span>
                </div>

                {/* AI-generated encouragement or fallback explanation */}
                <p className="text-gray-800 font-medium mb-4">
                  {encouragement.encouragement?.message || question.explanation}
                  {encouragement.encouragement?.emoji && (
                    <span className="ml-2 text-2xl">
                      {encouragement.encouragement.emoji}
                    </span>
                  )}
                </p>

                {/* Show correct answer when wrong */}
                {!isCorrect && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-green-800 font-medium">
                      💡 The correct answer is:{" "}
                      <span className="font-bold">
                        {question.options[question.correct]}
                      </span>
                    </p>
                  </div>
                )}

                {/* Show AI thinking indicator */}
                {encouragement.loading && (
                  <div className="flex items-center gap-2 text-blue-600 mb-4">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-sm">
                      AI is thinking of something special to say...
                    </span>
                  </div>
                )}

                <button
                  onClick={nextQuestion}
                  className="w-full bg-gradient-to-r from-purple-400 to-blue-500 text-white py-3 px-6 rounded-xl text-lg font-bold hover:from-purple-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-300"
                >
                  {currentQuestion < currentQuestions.length - 1
                    ? "Next Question! 🎯"
                    : "Finish Quiz! 🎉"}
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
    // Show loading state while analytics are being generated
    if (analytics.loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={goHome}
                className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <Home className="text-purple-600 text-xl" />
              </button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-purple-800">
                  Creating Your Learning Report
                </h1>
                <p className="text-purple-600">
                  {isAIEnabled
                    ? "AI is analyzing your progress..."
                    : "Analyzing your progress..."}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
              <div className="mb-6">
                <Loader className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {isAIEnabled
                    ? "AI is Creating Your Report..."
                    : "Creating Your Report..."}
                </h2>
                <p className="text-gray-600">
                  {isAIEnabled
                    ? "AI is carefully analyzing your learning patterns and progress to create personalized insights just for you!"
                    : "Analyzing your learning patterns and progress to create personalized insights just for you!"}
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span>Analyzing strengths</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <span>Finding improvement areas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                  <span>Creating recommendations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

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
              <h1 className="text-3xl font-bold text-purple-800">
                Your Learning Report
              </h1>
              <p className="text-purple-600">
                {isAIEnabled
                  ? "AI analyzed your progress and has special insights!"
                  : "Here's your personalized learning summary!"}
              </p>
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
                <h3 className="text-xl font-bold text-gray-800">
                  Your Superpowers!
                </h3>
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
                <h3 className="text-xl font-bold text-gray-800">
                  Let's Practice More!
                </h3>
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
                <h3 className="text-xl font-bold text-gray-800">
                  Try These Next!
                </h3>
              </div>
              <ul className="space-y-2">
                {analytics.analytics.recommendedNextTopics.map(
                  (topic, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Heart className="text-pink-500 text-sm" />
                      <span className="text-gray-700">{topic}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Personalized Tips */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  {isAIEnabled ? "AI Tips Just for You!" : "Tips Just for You!"}
                </h3>
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

          {/* Report Generation Info */}
          <div className="mt-6 text-center">
            <div className="bg-white/50 rounded-lg p-3 text-sm text-gray-600 max-w-md mx-auto">
              {isAIEnabled ? (
                <div className="flex items-center justify-center gap-2">
                  <Brain className="w-4 h-4 text-green-500" />
                  <span>
                    This report was personalized by AI based on your performance
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span>
                    This report was created based on your learning progress
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Game Selection View - Shows available games based on learning points only
   */
  const GameSelectionView = () => (
    <GameCenter
      progress={progress}
      onBack={goHome}
      onSelectGame={(gameId) => setCurrentView(gameId as any)}
    />
  );

  /**
   * Memory Game View
   */
  const MemoryGameView = () => (
    <MemoryGame onBack={() => setCurrentView("game")} />
  );

  /**
   * Color Game View
   */
  const ColorGameView = () => (
    <ColorGame onBack={() => setCurrentView("game")} />
  );

  /**
   * Math Game View
   */
  const MathGameView = () => <MathGame onBack={() => setCurrentView("game")} />;

  /**
   * Teacher/Parent Progress View
   */
  const TeacherView = () => {
    const accuracyRate =
      progress.totalAnswers > 0
        ? Math.round((progress.correctAnswers / progress.totalAnswers) * 100)
        : 0;
    const totalModulesStarted = Object.values(progress.moduleProgress).filter(
      (p) => p > 0
    ).length;

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
              <h1 className="text-3xl font-bold text-slate-800">
                👨‍🏫 Progress Dashboard
              </h1>
              <p className="text-slate-600">
                Detailed learning analytics for educators and parents
              </p>
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
              <div className="text-3xl font-bold text-blue-600">
                {progress.totalPoints}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-600 text-lg" />
                </div>
                <span className="font-bold text-gray-800">Accuracy</span>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {accuracyRate}%
              </div>
              <div className="text-sm text-gray-500">
                {progress.correctAnswers}/{progress.totalAnswers} correct
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <BookOpen className="text-purple-600 text-lg" />
                </div>
                <span className="font-bold text-gray-800">Modules</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {totalModulesStarted}
              </div>
              <div className="text-sm text-gray-500">modules started</div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Sparkles className="text-orange-600 text-lg" />
                </div>
                <span className="font-bold text-gray-800">Streak</span>
              </div>
              <div className="text-3xl font-bold text-orange-600">
                {progress.currentStreak}
              </div>
              <div className="text-sm text-gray-500">in a row</div>
            </div>
          </div>

          {/* Detailed Module Progress */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Module Progress Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(moduleData).map(([key, module]) => {
                const moduleProgress =
                  progress.moduleProgress[key as LearningModule];
                const progressPercentage = Math.min(
                  (moduleProgress / 5) * 100,
                  100
                );

                return (
                  <div
                    key={key}
                    className="border border-gray-200 rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`${module.color} p-3 rounded-full`}>
                        <module.icon className="text-white text-xl" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">
                          {module.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {moduleProgress}/5 questions correct
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {Math.round(progressPercentage)}% complete
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Learning Topics */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Recent Learning Activity
            </h3>
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
              <p className="text-gray-500 italic">
                No learning activity yet. Start a quiz to see topics here!
              </p>
            )}
          </div>

          {/* AI Status for Teachers */}
          <div className="mt-8">
            <AIConfigStatus
              isEnabled={isAIEnabled}
              loading={
                questions.loading || encouragement.loading || analytics.loading
              }
              error={questions.error || encouragement.error || analytics.error}
              className="bg-white/80 mx-auto max-w-md"
            />
          </div>
        </div>
      </div>
    );
  };

  /**
   * Child Selection View - Choose which child is playing
   */
  const ChildSelectionView = () => {
    const [newChildName, setNewChildName] = useState("");
    const [newChildAge, setNewChildAge] = useState(5);
    const [showCreateForm, setShowCreateForm] = useState(false);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-purple-800 mb-2">
              👨‍👩‍👧‍👦 Who's Learning Today?
            </h1>
            <p className="text-purple-600">
              Select a child to start their learning adventure!
            </p>
          </div>

          {/* Existing Children */}
          {children.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Choose Your Child
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => selectChild(child)}
                    className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl">
                        👶
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {child.name}
                        </h3>
                        <p className="text-gray-600">Age {child.age}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add New Child */}
          <div className="bg-white rounded-3xl shadow-lg p-6">
            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white p-4 rounded-2xl font-bold hover:from-green-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-300"
              >
                + Add New Child
              </button>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Add New Child
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Child's Name
                    </label>
                    <input
                      type="text"
                      value={newChildName}
                      onChange={(e) => setNewChildName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter child's name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age
                    </label>
                    <select
                      value={newChildAge}
                      onChange={(e) => setNewChildAge(Number(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={5}>5 years old</option>
                      <option value={6}>6 years old</option>
                      <option value={7}>7 years old</option>
                      <option value={8}>8 years old</option>
                      <option value={9}>9 years old</option>
                      <option value={10}>10 years old</option>
                      <option value={11}>11 years old</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (newChildName.trim()) {
                          createNewChild(newChildName.trim(), newChildAge);
                          setNewChildName("");
                          setShowCreateForm(false);
                        }
                      }}
                      className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 text-white py-3 px-6 rounded-xl font-bold hover:from-green-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-300"
                    >
                      Create Child
                    </button>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-bold hover:bg-gray-300 transform hover:scale-105 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Load children on component mount
  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const { data, error } = await databaseService.getChildren();
      if (error) {
        console.error("Error loading children:", error);
        return;
      }
      setChildren(data || []);

      // If only one child, select it automatically
      if (data && data.length === 1) {
        await selectChild(data[0]);
      } else if (data && data.length > 1) {
        setShowChildSelection(true);
      }
    } catch (error) {
      console.error("Failed to load children:", error);
    }
  };

  const createNewChild = async (name: string, age: number) => {
    try {
      const { data, error } = await databaseService.createChild({
        name,
        age,
        parent_id: user.id,
      });

      if (error) {
        console.error("Error creating child:", error);
        return;
      }

      if (data) {
        setChildren((prev) => [...prev, data]);
        setCurrentChild(data);
        setShowChildSelection(false);
      }
    } catch (error) {
      console.error("Failed to create child:", error);
    }
  };

  const selectChild = async (child: any) => {
    setCurrentChild(child);
    setShowChildSelection(false);

    // Load child's progress from database
    try {
      const childProgress = await loadChildProgress(child);
      setProgress(childProgress);
    } catch (error) {
      console.error("Failed to load child progress:", error);
      // Set default progress if loading fails
      setProgress({
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
          math: 0,
        },
        currentStreak: 0,
        recentTopics: [],
        childName: child.name,
      });
    }
  };

  /**
   * Loads child's progress from database and converts to UserProgress format
   */
  const loadChildProgress = async (child: any): Promise<UserProgress> => {
    try {
      const { data: progressData, error } =
        await databaseService.getChildProgress(child.id);

      if (error) {
        console.error("Error loading child progress:", error);
        // Return default progress if error
        return {
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
            math: 0,
          },
          currentStreak: 0,
          recentTopics: [],
          childName: child.name,
        };
      }

      if (progressData) {
        // Convert database progress to UserProgress format
        const modulesCompleted = progressData.modules_completed || {};
        return {
          totalPoints: progressData.total_points || 0,
          correctAnswers: progressData.correct_answers || 0,
          totalAnswers: progressData.total_questions || 0,
          achievements: progressData.achievements || [],
          moduleProgress: {
            letters: modulesCompleted.letters || 0,
            numbers: modulesCompleted.numbers || 0,
            colors: modulesCompleted.colors || 0,
            shapes: modulesCompleted.shapes || 0,
            animals: modulesCompleted.animals || 0,
            math: modulesCompleted.math || 0,
          },
          currentStreak: progressData.current_streak || 0,
          recentTopics: [], // Note: recent_topics not in database schema, keeping empty for now
          childName: child.name,
        };
      } else {
        // No progress data found, return default
        return {
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
            math: 0,
          },
          currentStreak: 0,
          recentTopics: [],
          childName: child.name,
        };
      }
    } catch (error) {
      console.error("Failed to load child progress:", error);
      // Return default progress on error
      return {
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
          math: 0,
        },
        currentStreak: 0,
        recentTopics: [],
        childName: child.name,
      };
    }
  };

  // Show child selection if no child is selected
  if (showChildSelection || !currentChild) {
    return <ChildSelectionView />;
  }

  return (
    <div className="font-sans">
      {/* Celebration Animation */}
      {showCelebration && <CelebrationAnimation />}

      {/* View Router */}
      {currentView === "home" && <HomeView />}
      {currentView === "module" && <ModuleView />}
      {currentView === "quiz" && <QuizView />}
      {currentView === "analytics" && <AnalyticsView />}
      {currentView === "teacher" && <TeacherView />}
      {currentView === "game" && <GameSelectionView />}
      {currentView === "memory" && <MemoryGameView />}
      {currentView === "colors" && <ColorGameView />}
      {currentView === "math" && <MathGameView />}

      {/* Developer AI Configuration Status (only in development) */}
      <AIConfigStatus />
    </div>
  );
}

export default App;
