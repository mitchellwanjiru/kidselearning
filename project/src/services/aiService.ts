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
        max_tokens: 2000
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
      return this.getFallbackEncouragement(isCorrect, streak);
    }

    try {
      // Add variety to encouragement generation
      const encouragementStyles = [
        'enthusiastic and celebratory',
        'warm and nurturing',
        'playful and fun',
        'proud and supportive',
        'motivational and inspiring'
      ];
      
      const randomStyle = encouragementStyles[Math.floor(Math.random() * encouragementStyles.length)];
      const timestamp = Date.now();
      
      let streakContext = '';
      if (streak > 0) {
        streakContext = streak >= 5 ? 'amazing streak - they are on fire!' : 
                       streak >= 3 ? 'good streak going' : 
                       'building momentum';
      }

      const prompt = `Create a ${randomStyle} encouragement message for a kindergarten child named ${childName}. 
      
      Context:
      - They just ${isCorrect ? 'answered correctly' : 'made a mistake'}
      - Current streak: ${streak} correct answers ${streakContext}
      - Generation ID: ${timestamp} (ensure uniqueness)
      - Style: ${randomStyle}
      
      Requirements:
      - Make it warm, supportive, and age-appropriate
      - Include a relevant emoji that matches the tone
      - Vary the language and approach from typical responses
      - ${isCorrect ? 'Celebrate their success with enthusiasm' : 'Encourage them to keep trying with positivity'}
      - Use different vocabulary and phrases each time
      - Keep it concise but meaningful
      
      Format: {"message": "your varied message", "emoji": "appropriate emoji"}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a caring, enthusiastic kindergarten teacher who always encourages children positively. Vary your responses to keep them fresh and engaging. Never repeat the same phrases or patterns."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9, // Higher temperature for more variety
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
      return this.getFallbackEncouragement(isCorrect, streak);
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
      return this.getFallbackAnalytics(correctAnswers, totalAnswers, moduleProgress, recentTopics);
    }

    try {
      const accuracyRate = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
      const strongModules = Object.entries(moduleProgress)
        .filter(([_, progress]) => progress >= 3)
        .map(([module, _]) => module);
      const weakModules = Object.entries(moduleProgress)
        .filter(([_, progress]) => progress > 0 && progress < 2)
        .map(([module, _]) => module);
      
      const prompt = `Analyze a kindergarten child's learning progress and provide encouraging, personalized feedback:

PERFORMANCE DATA:
- Accuracy: ${accuracyRate}% (${correctAnswers}/${totalAnswers} correct)
- Strong modules: ${strongModules.length > 0 ? strongModules.join(', ') : 'None yet'}
- Challenging modules: ${weakModules.length > 0 ? weakModules.join(', ') : 'None identified'}
- Recent topics covered: ${recentTopics.length > 0 ? recentTopics.slice(0, 5).join(', ') : 'None yet'}
- Total questions attempted: ${totalAnswers}

REQUIREMENTS:
- Use encouraging, child-friendly language
- Focus on positive reinforcement and growth mindset
- Suggest specific, actionable next steps
- Keep recommendations age-appropriate for kindergarten (ages 4-6)
- Be specific about what the child has done well
- If performance is low, emphasize effort and improvement opportunities

Provide analysis in JSON format:
{
  "strengths": ["2-3 specific strengths based on actual performance"],
  "areasForImprovement": ["2-3 gentle suggestions for growth"],
  "recommendedNextTopics": ["3-4 specific topics to try next"],
  "personalizedTips": ["3-4 encouraging tips tailored to this child's progress"]
}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a warm, encouraging kindergarten teacher who specializes in early childhood learning assessment. Your goal is to motivate children and help them feel proud of their progress while gently guiding them toward improvement. Always use positive, supportive language that builds confidence."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7, // Balanced creativity and consistency
        max_tokens: 800
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from AI');

      return JSON.parse(content);
    } catch (error) {
      console.error('AI learning analysis failed:', error);
      return this.getFallbackAnalytics(correctAnswers, totalAnswers, moduleProgress, recentTopics);
    }
  }

  /**
   * Builds a comprehensive prompt for question generation
   * Includes context about child's progress and learning preferences
   */
  private buildQuestionPrompt(config: QuestionGenerationConfig): string {
    // Add variety to question generation
    const questionStyles = [
      'multiple choice with interesting scenarios',
      'visual-based questions with descriptions',
      'story-based questions with characters',
      'puzzle-like questions that make kids think',
      'real-world application questions'
    ];
    
    const randomStyle = questionStyles[Math.floor(Math.random() * questionStyles.length)];
    
    // Add timestamp and random seed for uniqueness
    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 1000);
    
    return `Generate 5 completely unique and engaging ${config.difficulty} level questions for kindergarten children (age ${config.childAge}) about ${config.module}.

IMPORTANT: Create ${randomStyle} that are different from typical questions. Be creative and vary the format!

Requirements:
- Age-appropriate language and concepts
- Multiple choice with 4 options each
- Include fun, encouraging explanations that reveal the correct answer
- Avoid these previously covered topics: ${config.previousTopics.join(', ')}
- Make questions interactive and visual when possible
- Use variety in question structure and wording
- Include different scenarios and contexts
- Add elements of storytelling or characters when appropriate

Context for uniqueness:
- Generation ID: ${timestamp}-${randomSeed}
- Previous topics covered: ${config.previousTopics.length} topics
- Child interests: ${config.childInterests?.join(', ') || 'General learning'}

Format as JSON array:
[
  {
    "question": "creative question text with variety",
    "options": ["option1", "option2", "option3", "option4"],
    "correct": 0,
    "explanation": "encouraging explanation that shows the correct answer",
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
  private getFallbackEncouragement(isCorrect: boolean, streak: number = 0): AIEncouragement {
    const correctMessages = [
      'Great job!', 'You\'re amazing!', 'Well done!', 'Fantastic!', 'Awesome work!',
      'Perfect!', 'Brilliant!', 'Outstanding!', 'Excellent!', 'Superb!',
      'You nailed it!', 'Way to go!', 'Incredible!', 'Marvelous!', 'Terrific!'
    ];
    
    const incorrectMessages = [
      'Good try!', 'Keep learning!', 'You\'re getting better!', 'Nice effort!',
      'Almost there!', 'Try again!', 'You can do it!', 'Don\'t give up!',
      'Learning is a journey!', 'Every mistake helps you grow!', 'Keep going!',
      'You\'re doing great!', 'Practice makes perfect!', 'Stay curious!', 'Keep trying!'
    ];
    
    const correctEmojis = ['🎉', '⭐', '🌟', '👏', '🎊', '🏆', '💫', '🎯', '🔥', '✨'];
    const incorrectEmojis = ['💪', '🌱', '🤗', '💡', '🌈', '🎈', '🦋', '🌸', '🎪', '🎭'];
    
    const messages = isCorrect ? correctMessages : incorrectMessages;
    const emojis = isCorrect ? correctEmojis : incorrectEmojis;
    
    // Add special messages for streaks
    if (isCorrect && streak >= 3) {
      const streakMessages = [
        `Amazing streak of ${streak}! You're on fire!`,
        `Wow! ${streak} in a row! You're unstoppable!`,
        `Incredible! ${streak} correct answers! Keep it up!`,
        `${streak} perfect answers! You're a superstar!`
      ];
      return {
        message: streakMessages[Math.floor(Math.random() * streakMessages.length)],
        emoji: '🔥',
        celebrationType: 'correct'
      };
    }
    
    return {
      message: messages[Math.floor(Math.random() * messages.length)],
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      celebrationType: isCorrect ? 'correct' : 'incorrect'
    };
  }

  /**
   * Fallback analytics when AI is unavailable
   * Provides intelligent analysis based on actual performance data
   */
  private getFallbackAnalytics(
    correctAnswers: number = 0,
    totalAnswers: number = 0,
    moduleProgress: Record<string, number> = {},
    _recentTopics: string[] = []
  ): LearningAnalytics {
    const accuracyRate = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
    const strongModules = Object.entries(moduleProgress)
      .filter(([_, progress]) => progress >= 3)
      .map(([module, _]) => this.getModuleDisplayName(module));
    const needsPracticeModules = Object.entries(moduleProgress)
      .filter(([_, progress]) => progress > 0 && progress < 2)
      .map(([module, _]) => this.getModuleDisplayName(module));
    
    // Generate personalized strengths based on performance
    const strengths = [];
    if (accuracyRate >= 80) {
      strengths.push("Excellent accuracy - you're doing amazing!");
    } else if (accuracyRate >= 60) {
      strengths.push("Good problem-solving skills");
    } else if (totalAnswers > 0) {
      strengths.push("Great effort and persistence");
    }
    
    if (strongModules.length > 0) {
      strengths.push(`Strong performance in ${strongModules.join(', ')}`);
    }
    
    if (totalAnswers >= 10) {
      strengths.push("Wonderful dedication to learning");
    }
    
    // Default strengths if no specific achievements
    if (strengths.length === 0) {
      strengths.push("Ready and eager to learn", "Positive attitude toward challenges");
    }
    
    // Generate areas for improvement
    const areasForImprovement = [];
    if (accuracyRate < 50 && totalAnswers > 5) {
      areasForImprovement.push("Take time to read questions carefully");
    }
    if (needsPracticeModules.length > 0) {
      areasForImprovement.push(`Extra practice with ${needsPracticeModules.join(', ')}`);
    }
    if (Object.keys(moduleProgress).length < 3) {
      areasForImprovement.push("Try exploring different learning topics");
    }
    
    // Default improvements if none identified
    if (areasForImprovement.length === 0) {
      areasForImprovement.push("Continue practicing regularly", "Try new learning modules");
    }
    
    // Generate recommended next topics
    const allModules = ['Letters & Phonics', 'Numbers & Counting', 'Colors & Shapes', 'Animals & Nature', 'Simple Math', 'Shapes'];
    const attemptedModules = Object.keys(moduleProgress);
    const notAttempted = allModules.filter(module => 
      !attemptedModules.some(attempted => this.getModuleDisplayName(attempted) === module)
    );
    
    let recommendedNextTopics: string[] = [];
    if (notAttempted.length > 0) {
      recommendedNextTopics = notAttempted.slice(0, 3);
    }
    
    // Add review suggestions for modules that need practice
    if (needsPracticeModules.length > 0) {
      recommendedNextTopics.push(`Review ${needsPracticeModules[0]} questions`);
    }
    
    // Default recommendations
    if (recommendedNextTopics.length === 0) {
      recommendedNextTopics = ['Letters & Phonics', 'Numbers & Counting', 'Colors & Shapes'];
    }
    
    // Generate personalized tips
    const personalizedTips = [];
    if (accuracyRate >= 80) {
      personalizedTips.push("You're doing fantastic! Keep up the great work!");
    } else if (accuracyRate >= 60) {
      personalizedTips.push("Nice progress! Try to slow down and think about each answer.");
    } else if (totalAnswers > 0) {
      personalizedTips.push("Every mistake is a step toward learning something new!");
    }
    
    personalizedTips.push("Take breaks when you need them - learning should be fun!");
    personalizedTips.push("Remember, asking questions is a sign of curiosity and intelligence");
    
    if (strongModules.length > 0) {
      personalizedTips.push(`You're really good at ${strongModules[0]} - use that confidence in other areas!`);
    } else {
      personalizedTips.push("Every expert was once a beginner - keep practicing!");
    }
    
    return {
      strengths: strengths.slice(0, 3),
      areasForImprovement: areasForImprovement.slice(0, 3),
      recommendedNextTopics: recommendedNextTopics.slice(0, 4),
      personalizedTips: personalizedTips.slice(0, 4)
    };
  }

  /**
   * Helper method to convert module keys to display names
   */
  private getModuleDisplayName(moduleKey: string): string {
    const moduleNames: Record<string, string> = {
      'letters': 'Letters & Phonics',
      'numbers': 'Numbers & Counting',
      'colors': 'Colors & Shapes',
      'shapes': 'Shapes',
      'animals': 'Animals & Nature',
      'math': 'Simple Math'
    };
    return moduleNames[moduleKey] || moduleKey;
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