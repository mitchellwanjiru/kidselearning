/**
 * AI Service - OpenAI Integration
 * 
 * This service handles all AI-powered features including:
 * - Dynamic question generation based on child's progress
 * - Personalized explanations and encouragement
 * - Adaptive difficulty adjustment
 * - Learning analytics and recommendations
 */

import OpenAI from 'openai';
import { AIQuestion, QuestionGenerationConfig, AIEncouragement, LearningAnalytics } from '../types/ai';

class AIService {
  private openai!: OpenAI;
  private isConfigured: boolean = false;

  constructor() {
    // Initialize OpenAI client - API key will be set via environment variable
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: import.meta.env.DEV // Only allow in development; use a backend proxy in production
      });
      this.isConfigured = true;
    } else {
      console.warn('OpenAI API key not found. AI features will use fallback data.');
      this.isConfigured = false;
    }
  }

  /**
   * Generates personalized questions based on child's learning progress
   * Uses GPT to create age-appropriate, engaging questions
   */
  async generateQuestions(config: QuestionGenerationConfig): Promise<AIQuestion[]> {
    if (!this.isConfigured) {
      return this.getFallbackQuestions(config.module);
    }

    try {
      const prompt = this.buildQuestionPrompt(config);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert kindergarten teacher and child development specialist. Create engaging, age-appropriate learning questions that are fun and educational."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8, // Higher creativity for varied questions
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from AI');

      return this.parseQuestionsFromResponse(content);
    } catch (error) {
      console.error('AI question generation failed:', error);
      return this.getFallbackQuestions(config.module);
    }
  }

  /**
   * Generates personalized encouragement messages based on child's performance
   * Adapts tone and content to maintain engagement and motivation
   */
  async generateEncouragement(
    isCorrect: boolean,
    childName: string = "friend",
    streak: number = 0
  ): Promise<AIEncouragement> {
    if (!this.isConfigured) {
      return this.getFallbackEncouragement(isCorrect);
    }

    try {
      const prompt = `Create an encouraging message for a kindergarten child named ${childName}. 
      They just ${isCorrect ? 'answered correctly' : 'made a mistake'} and have a streak of ${streak} correct answers.
      Make it warm, supportive, and age-appropriate. Include a relevant emoji.
      Format: {"message": "your message", "emoji": "emoji"}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a caring, enthusiastic kindergarten teacher who always encourages children positively."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 150
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from AI');

      const parsed = JSON.parse(content);
      return {
        message: parsed.message,
        emoji: parsed.emoji,
        celebrationType: isCorrect ? 'correct' : 'incorrect'
      };
    } catch (error) {
      console.error('AI encouragement generation failed:', error);
      return this.getFallbackEncouragement(isCorrect);
    }
  }

  /**
   * Analyzes child's learning patterns and provides personalized recommendations
   * Uses AI to identify strengths, weaknesses, and suggest next learning steps
   */
  async analyzeLearningProgress(
    correctAnswers: number,
    totalAnswers: number,
    moduleProgress: Record<string, number>,
    recentTopics: string[]
  ): Promise<LearningAnalytics> {
    if (!this.isConfigured) {
      return this.getFallbackAnalytics();
    }

    try {
      const prompt = `Analyze a kindergarten child's learning progress:
      - Correct answers: ${correctAnswers}/${totalAnswers}
      - Module progress: ${JSON.stringify(moduleProgress)}
      - Recent topics: ${recentTopics.join(', ')}
      
      Provide analysis in JSON format:
      {
        "strengths": ["strength1", "strength2"],
        "areasForImprovement": ["area1", "area2"],
        "recommendedNextTopics": ["topic1", "topic2"],
        "personalizedTips": ["tip1", "tip2"]
      }`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an educational data analyst specializing in early childhood learning assessment."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent analysis
        max_tokens: 500
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from AI');

      return JSON.parse(content);
    } catch (error) {
      console.error('AI learning analysis failed:', error);
      return this.getFallbackAnalytics();
    }
  }

  /**
   * Builds a comprehensive prompt for question generation
   * Includes context about child's progress and learning preferences
   */
  private buildQuestionPrompt(config: QuestionGenerationConfig): string {
    return `Generate 3 engaging ${config.difficulty} level questions for kindergarten children (age ${config.childAge}) about ${config.module}.

Requirements:
- Age-appropriate language and concepts
- Multiple choice with 4 options each
- Include fun, encouraging explanations
- Avoid topics: ${config.previousTopics.join(', ')}
- Make questions interactive and visual when possible

Format as JSON array:
[
  {
    "question": "question text",
    "options": ["option1", "option2", "option3", "option4"],
    "correct": 0,
    "explanation": "encouraging explanation",
    "topic": "specific topic covered"
  }
]`;
  }

  /**
   * Parses AI response into structured question objects
   * Handles potential formatting issues and validates data
   */
  private parseQuestionsFromResponse(response: string): AIQuestion[] {
    try {
      const parsed = JSON.parse(response);
      return parsed.map((q: any, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        question: q.question,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation,
        difficulty: 'easy' as const,
        topic: q.topic || 'general'
      }));
    } catch (error) {
      console.error('Failed to parse AI questions:', error);
      return [];
    }
  }

  /**
   * Fallback questions when AI is unavailable
   * Ensures app continues to function without AI service
   */
  private getFallbackQuestions(module: string): AIQuestion[] {
    const fallbackQuestions: Record<string, AIQuestion[]> = {
      letters: [
        {
          id: 'fallback-l1',
          question: 'What letter comes after B?',
          options: ['A', 'C', 'D', 'E'],
          correct: 1,
          explanation: 'Great job! C comes right after B in the alphabet!',
          difficulty: 'easy',
          topic: 'alphabet sequence'
        },
        {
          id: 'fallback-l2',
          question: 'Which letter makes the "mmm" sound?',
          options: ['N', 'M', 'W', 'V'],
          correct: 1,
          explanation: 'Perfect! The letter M makes the "mmm" sound!',
          difficulty: 'easy',
          topic: 'phonics'
        },
        {
          id: 'fallback-l3',
          question: 'What is the first letter of "apple"?',
          options: ['A', 'P', 'L', 'E'],
          correct: 0,
          explanation: 'Excellent! Apple starts with the letter A!',
          difficulty: 'easy',
          topic: 'beginning sounds'
        },
        {
          id: 'fallback-l4',
          question: 'How many letters are in "cat"?',
          options: ['2', '3', '4', '5'],
          correct: 1,
          explanation: 'Amazing! Cat has 3 letters: C-A-T!',
          difficulty: 'easy',
          topic: 'letter counting'
        },
        {
          id: 'fallback-l5',
          question: 'Which letter comes before D?',
          options: ['B', 'C', 'E', 'F'],
          correct: 1,
          explanation: 'Wonderful! C comes right before D!',
          difficulty: 'easy',
          topic: 'alphabet sequence'
        }
      ],
      numbers: [
        {
          id: 'fallback-n1',
          question: 'What number comes before 5?',
          options: ['3', '4', '6', '7'],
          correct: 1,
          explanation: 'Perfect! 4 comes right before 5!',
          difficulty: 'easy',
          topic: 'number sequence'
        },
        {
          id: 'fallback-n2',
          question: 'How many dots are there? ••••',
          options: ['3', '4', '5', '6'],
          correct: 1,
          explanation: 'Great counting! There are 4 dots!',
          difficulty: 'easy',
          topic: 'counting'
        },
        {
          id: 'fallback-n3',
          question: 'What is 2 + 2?',
          options: ['3', '4', '5', '6'],
          correct: 1,
          explanation: 'Fantastic! 2 + 2 = 4!',
          difficulty: 'easy',
          topic: 'addition'
        },
        {
          id: 'fallback-n4',
          question: 'Which number is bigger: 7 or 3?',
          options: ['3', '7', 'Same', 'Neither'],
          correct: 1,
          explanation: 'Correct! 7 is bigger than 3!',
          difficulty: 'easy',
          topic: 'number comparison'
        },
        {
          id: 'fallback-n5',
          question: 'What comes after 8?',
          options: ['7', '9', '10', '6'],
          correct: 1,
          explanation: 'Excellent! 9 comes after 8!',
          difficulty: 'easy',
          topic: 'number sequence'
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
        },
        {
          id: 'fallback-c2',
          question: 'What color is the sun?',
          options: ['Blue', 'Yellow', 'Green', 'Purple'],
          correct: 1,
          explanation: 'Great! The sun is yellow!',
          difficulty: 'easy',
          topic: 'colors in nature'
        },
        {
          id: 'fallback-c3',
          question: 'What color do you get when you mix yellow and red?',
          options: ['Purple', 'Orange', 'Green', 'Pink'],
          correct: 1,
          explanation: 'Amazing! Yellow and red make orange!',
          difficulty: 'easy',
          topic: 'color mixing'
        },
        {
          id: 'fallback-c4',
          question: 'What color are most leaves?',
          options: ['Red', 'Blue', 'Green', 'Purple'],
          correct: 2,
          explanation: 'Correct! Most leaves are green!',
          difficulty: 'easy',
          topic: 'colors in nature'
        },
        {
          id: 'fallback-c5',
          question: 'How many colors are in a rainbow?',
          options: ['5', '6', '7', '8'],
          correct: 2,
          explanation: 'Wonderful! A rainbow has 7 colors!',
          difficulty: 'easy',
          topic: 'rainbow colors'
        }
      ]
    };

    return fallbackQuestions[module] || [];
  }

  /**
   * Fallback encouragement messages when AI is unavailable
   */
  private getFallbackEncouragement(isCorrect: boolean): AIEncouragement {
    const messages = isCorrect 
      ? ['Great job!', 'You\'re amazing!', 'Well done!', 'Fantastic!']
      : ['Good try!', 'Keep learning!', 'You\'re getting better!', 'Nice effort!'];
    
    return {
      message: messages[Math.floor(Math.random() * messages.length)],
      emoji: isCorrect ? '🎉' : '💪',
      celebrationType: isCorrect ? 'correct' : 'incorrect'
    };
  }

  /**
   * Fallback analytics when AI is unavailable
   */
  private getFallbackAnalytics(): LearningAnalytics {
    return {
      strengths: ['Enthusiasm for learning', 'Good effort'],
      areasForImprovement: ['Continue practicing', 'Try new topics'],
      recommendedNextTopics: ['Colors', 'Shapes', 'Animals'],
      personalizedTips: ['Take breaks when needed', 'Celebrate small wins']
    };
  }

  /**
   * Checks if AI service is properly configured
   */
  isAIEnabled(): boolean {
    return this.isConfigured;
  }
}

// Export singleton instance
export const aiService = new AIService();