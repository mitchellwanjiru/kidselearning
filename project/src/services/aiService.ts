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
    // Check for Azure OpenAI configuration first, then fallback to regular OpenAI
    const azureApiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
    const azureEndpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
    const azureApiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION || '2024-02-15-preview';
    
    const regularApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (azureApiKey && azureEndpoint) {
      // Use Azure OpenAI
      this.openai = new OpenAI({
        apiKey: azureApiKey,
        baseURL: `${azureEndpoint}/openai/deployments`,
        defaultQuery: { 'api-version': azureApiVersion },
        defaultHeaders: {
          'api-key': azureApiKey,
        },
        dangerouslyAllowBrowser: import.meta.env.DEV
      });
      this.isConfigured = true;
      console.log('AI Service: Configured with Azure OpenAI');
    } else if (regularApiKey) {
      // Use regular OpenAI
      this.openai = new OpenAI({
        apiKey: regularApiKey,
        dangerouslyAllowBrowser: import.meta.env.DEV
      });
      this.isConfigured = true;
      console.log('AI Service: Configured with OpenAI');
    } else {
      console.warn('No AI API key found. AI features will use fallback data.');
      this.isConfigured = false;
    }
  }

  /**
   * Generates personalized questions based on child's learning progress
   * Uses GPT to create age-appropriate, engaging questions
   */
  async generateQuestions(config: QuestionGenerationConfig): Promise<AIQuestion[]> {
    if (!this.isConfigured) {
      console.log('AI not configured, using fallback questions');
      return this.getFallbackQuestions(config.module);
    }

    try {
      console.log('Generating AI questions for module:', config.module);
      const prompt = this.buildQuestionPrompt(config);
      
      const response = await this.openai.chat.completions.create({
        model: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-35-turbo", // Azure deployment name or fallback
        messages: [
          {
            role: "system",
            content: "You are an expert kindergarten teacher and child development specialist. Create engaging, age-appropriate learning questions that are fun and educational. Always respond with valid JSON format."
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
      if (!content) {
        console.error('No content in AI response');
        return this.getFallbackQuestions(config.module);
      }

      const aiQuestions = this.parseQuestionsFromResponse(content);
      
      // If parsing failed or returned no questions, use fallback
      if (aiQuestions.length === 0) {
        console.log('AI question parsing failed, using fallback questions');
        return this.getFallbackQuestions(config.module);
      }
      
      console.log(`Successfully generated ${aiQuestions.length} AI questions`);
      return aiQuestions;
      
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
        model: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-35-turbo", // Azure deployment name or fallback
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
        model: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-35-turbo", // Azure deployment name or fallback
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

CRITICAL: Respond ONLY with a valid JSON array. Do not include any text before or after the JSON. Do not use markdown formatting.

Format as JSON array (exactly like this example):
[
  {
    "question": "creative question text with variety",
    "options": ["option1", "option2", "option3", "option4"],
    "correct": 0,
    "explanation": "encouraging explanation that shows the correct answer",
    "topic": "specific topic covered"
  },
  {
    "question": "another creative question",
    "options": ["choice1", "choice2", "choice3", "choice4"],
    "correct": 1,
    "explanation": "positive explanation for the correct answer",
    "topic": "another specific topic"
  }
]`;
  }

  /**
   * Parses AI response into structured question objects
   * Handles potential formatting issues and validates data
   */
  private parseQuestionsFromResponse(response: string): AIQuestion[] {
    try {
      console.log('AI Response received:', response); // Debug log
      
      // Clean up the response to handle potential markdown formatting
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\s*/g, '').replace(/```\s*$/g, '');
      }
      
      const parsed = JSON.parse(cleanResponse);
      
      // Validate that we have an array
      if (!Array.isArray(parsed)) {
        console.error('AI response is not an array:', parsed);
        return [];
      }
      
      // Validate each question has required fields
      const validQuestions = parsed.filter((q: any) => {
        return q.question && 
               Array.isArray(q.options) && 
               q.options.length === 4 && 
               typeof q.correct === 'number' && 
               q.correct >= 0 && 
               q.correct < 4 &&
               q.explanation;
      });
      
      if (validQuestions.length === 0) {
        console.error('No valid questions found in AI response');
        return [];
      }
      
      console.log(`Successfully parsed ${validQuestions.length} valid questions from AI`);
      
      return validQuestions.map((q: any, index: number) => ({
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
      console.error('Raw AI response:', response);
      return [];
    }
  }

  /**
   * Enhanced fallback questions with variety and randomization
   * Provides diverse questions that simulate AI-generated content
   */
  private getFallbackQuestions(module: string): AIQuestion[] {
    // Add randomization to create variety
    const timestamp = Date.now();
    const seed = Math.floor(Math.random() * 1000);
    
    const allFallbackQuestions: Record<string, AIQuestion[][]> = {
      letters: [
        // Set 1: Alphabet sequence questions
        [
          {
            id: `fallback-l1-${timestamp}`,
            question: 'What letter comes after B in the alphabet?',
            options: ['A', 'C', 'D', 'E'],
            correct: 1,
            explanation: 'Fantastic! C comes right after B in the alphabet! 🎉',
            difficulty: 'easy',
            topic: 'alphabet sequence'
          },
          {
            id: `fallback-l2-${timestamp}`,
            question: 'Which letter comes before F?',
            options: ['D', 'E', 'G', 'H'],
            correct: 1,
            explanation: 'Perfect! E comes right before F! You\'re amazing! ⭐',
            difficulty: 'easy',
            topic: 'alphabet sequence'
          },
          {
            id: `fallback-l3-${timestamp}`,
            question: 'What letter is between M and O?',
            options: ['L', 'N', 'P', 'Q'],
            correct: 1,
            explanation: 'Brilliant! N is right between M and O! 🌟',
            difficulty: 'easy',
            topic: 'alphabet sequence'
          }
        ],
        // Set 2: Phonics questions
        [
          {
            id: `fallback-l4-${timestamp}`,
            question: 'Which letter makes the "ssss" sound like a snake?',
            options: ['R', 'S', 'T', 'Z'],
            correct: 1,
            explanation: 'Excellent! The letter S makes the "ssss" sound! 🐍',
            difficulty: 'easy',
            topic: 'phonics'
          },
          {
            id: `fallback-l5-${timestamp}`,
            question: 'What sound does the letter "B" make?',
            options: ['buh', 'puh', 'duh', 'guh'],
            correct: 0,
            explanation: 'Great job! B makes the "buh" sound! 🎊',
            difficulty: 'easy',
            topic: 'phonics'
          },
          {
            id: `fallback-l6-${timestamp}`,
            question: 'Which letter sounds like "zzz" when a bee flies?',
            options: ['S', 'C', 'Z', 'X'],
            correct: 2,
            explanation: 'Amazing! Z makes the "zzz" sound like a buzzing bee! 🐝',
            difficulty: 'easy',
            topic: 'phonics'
          }
        ],
        // Set 3: Beginning sounds
        [
          {
            id: `fallback-l7-${timestamp}`,
            question: 'What is the first letter of "rainbow"?',
            options: ['R', 'A', 'I', 'N'],
            correct: 0,
            explanation: 'Wonderful! Rainbow starts with the letter R! 🌈',
            difficulty: 'easy',
            topic: 'beginning sounds'
          },
          {
            id: `fallback-l8-${timestamp}`,
            question: 'Which word starts with the letter "D"?',
            options: ['Cat', 'Dog', 'Fish', 'Bird'],
            correct: 1,
            explanation: 'Perfect! Dog starts with the letter D! 🐕',
            difficulty: 'easy',
            topic: 'beginning sounds'
          },
          {
            id: `fallback-l9-${timestamp}`,
            question: 'What letter does "butterfly" begin with?',
            options: ['B', 'F', 'L', 'T'],
            correct: 0,
            explanation: 'Superb! Butterfly begins with B! 🦋',
            difficulty: 'easy',
            topic: 'beginning sounds'
          }
        ]
      ],
      numbers: [
        // Set 1: Counting questions
        [
          {
            id: `fallback-n1-${timestamp}`,
            question: 'How many stars are here? ⭐⭐⭐',
            options: ['2', '3', '4', '5'],
            correct: 1,
            explanation: 'Excellent counting! There are 3 stars! ⭐',
            difficulty: 'easy',
            topic: 'counting'
          },
          {
            id: `fallback-n2-${timestamp}`,
            question: 'Count the hearts: ❤️❤️❤️❤️❤️',
            options: ['4', '5', '6', '7'],
            correct: 1,
            explanation: 'Amazing! You counted 5 hearts perfectly! ❤️',
            difficulty: 'easy',
            topic: 'counting'
          },
          {
            id: `fallback-n3-${timestamp}`,
            question: 'How many circles? ⚪⚪',
            options: ['1', '2', '3', '4'],
            correct: 1,
            explanation: 'Great job! There are 2 circles! ⚪',
            difficulty: 'easy',
            topic: 'counting'
          }
        ],
        // Set 2: Number sequence
        [
          {
            id: `fallback-n4-${timestamp}`,
            question: 'What number comes after 7?',
            options: ['6', '8', '9', '10'],
            correct: 1,
            explanation: 'Fantastic! 8 comes right after 7! 🎯',
            difficulty: 'easy',
            topic: 'number sequence'
          },
          {
            id: `fallback-n5-${timestamp}`,
            question: 'Which number is missing? 1, 2, ?, 4',
            options: ['2', '3', '4', '5'],
            correct: 1,
            explanation: 'Perfect! The missing number is 3! 🔥',
            difficulty: 'easy',
            topic: 'number sequence'
          },
          {
            id: `fallback-n6-${timestamp}`,
            question: 'What comes before 10?',
            options: ['8', '9', '11', '12'],
            correct: 1,
            explanation: 'Brilliant! 9 comes before 10! 🌟',
            difficulty: 'easy',
            topic: 'number sequence'
          }
        ],
        // Set 3: Simple math
        [
          {
            id: `fallback-n7-${timestamp}`,
            question: 'What is 1 + 1?',
            options: ['1', '2', '3', '4'],
            correct: 1,
            explanation: 'Awesome! 1 + 1 = 2! You\'re a math star! ✨',
            difficulty: 'easy',
            topic: 'addition'
          },
          {
            id: `fallback-n8-${timestamp}`,
            question: 'If you have 3 cookies and eat 1, how many are left?',
            options: ['1', '2', '3', '4'],
            correct: 1,
            explanation: 'Excellent thinking! 3 - 1 = 2 cookies left! 🍪',
            difficulty: 'easy',
            topic: 'subtraction'
          },
          {
            id: `fallback-n9-${timestamp}`,
            question: 'What is 2 + 3?',
            options: ['4', '5', '6', '7'],
            correct: 1,
            explanation: 'Outstanding! 2 + 3 = 5! Keep it up! 🎉',
            difficulty: 'easy',
            topic: 'addition'
          }
        ]
      ],
      colors: [
        // Set 1: Color mixing
        [
          {
            id: `fallback-c1-${timestamp}`,
            question: 'What color do you get when you mix red and yellow?',
            options: ['Purple', 'Orange', 'Green', 'Pink'],
            correct: 1,
            explanation: 'Perfect! Red and yellow make orange! 🧡',
            difficulty: 'easy',
            topic: 'color mixing'
          },
          {
            id: `fallback-c2-${timestamp}`,
            question: 'Blue + Yellow = ?',
            options: ['Purple', 'Orange', 'Green', 'Pink'],
            correct: 2,
            explanation: 'Amazing! Blue and yellow make green! 💚',
            difficulty: 'easy',
            topic: 'color mixing'
          },
          {
            id: `fallback-c3-${timestamp}`,
            question: 'What happens when you mix red and blue?',
            options: ['Orange', 'Purple', 'Green', 'Yellow'],
            correct: 1,
            explanation: 'Fantastic! Red and blue make purple! 💜',
            difficulty: 'easy',
            topic: 'color mixing'
          }
        ],
        // Set 2: Nature colors
        [
          {
            id: `fallback-c4-${timestamp}`,
            question: 'What color is grass?',
            options: ['Blue', 'Green', 'Red', 'Yellow'],
            correct: 1,
            explanation: 'Excellent! Grass is green! 🌱',
            difficulty: 'easy',
            topic: 'colors in nature'
          },
          {
            id: `fallback-c5-${timestamp}`,
            question: 'What color is the sky on a sunny day?',
            options: ['Blue', 'Green', 'Red', 'Purple'],
            correct: 0,
            explanation: 'Great observation! The sky is blue! ☀️',
            difficulty: 'easy',
            topic: 'colors in nature'
          },
          {
            id: `fallback-c6-${timestamp}`,
            question: 'What color are most tree trunks?',
            options: ['Green', 'Blue', 'Brown', 'Purple'],
            correct: 2,
            explanation: 'Perfect! Tree trunks are brown! 🌳',
            difficulty: 'easy',
            topic: 'colors in nature'
          }
        ],
        // Set 3: Fun color facts
        [
          {
            id: `fallback-c7-${timestamp}`,
            question: 'How many colors are in a rainbow?',
            options: ['5', '6', '7', '8'],
            correct: 2,
            explanation: 'Wonderful! A rainbow has 7 beautiful colors! 🌈',
            difficulty: 'easy',
            topic: 'rainbow colors'
          },
          {
            id: `fallback-c8-${timestamp}`,
            question: 'What color do you get with NO colors mixed?',
            options: ['Black', 'White', 'Gray', 'Brown'],
            correct: 1,
            explanation: 'Smart thinking! No colors make white! ⚪',
            difficulty: 'easy',
            topic: 'color theory'
          },
          {
            id: `fallback-c9-${timestamp}`,
            question: 'Which color is considered "warm"?',
            options: ['Blue', 'Red', 'Green', 'Purple'],
            correct: 1,
            explanation: 'Great! Red is a warm color like fire! 🔥',
            difficulty: 'easy',
            topic: 'color temperature'
          }
        ]
      ]
    };

    // Randomly select a question set for variety
    const questionSets = allFallbackQuestions[module] || [];
    if (questionSets.length === 0) {
      return []; // Return empty if module not found
    }
    
    // Use seed to consistently pick the same set per session but vary between sessions
    const setIndex = (seed % questionSets.length);
    const selectedSet = questionSets[setIndex];
    
    // Shuffle the questions within the set for more variety
    const shuffled = [...selectedSet].sort(() => Math.random() - 0.5);
    
    console.log(`Using fallback question set ${setIndex + 1}/${questionSets.length} for ${module}`);
    
    return shuffled.slice(0, 5); // Return up to 5 questions
  }

  /**
   * Enhanced fallback encouragement with much more variety
   */
  private getFallbackEncouragement(isCorrect: boolean, streak: number = 0): AIEncouragement {
    const timestamp = Date.now();
    
    const correctMessages = [
      'Absolutely fantastic!', 'You\'re incredible!', 'Outstanding work!', 'Phenomenal job!',
      'You\'re a superstar!', 'Brilliant thinking!', 'Magnificent!', 'You nailed it!',
      'Spectacular!', 'You\'re on fire!', 'Impressive!', 'Marvelous work!',
      'You\'re amazing!', 'Extraordinary!', 'Stupendous!', 'You\'re a genius!',
      'Fabulous!', 'You rock!', 'Incredible job!', 'You\'re unstoppable!',
      'Sensational!', 'You\'re a champion!', 'Remarkable!', 'You\'re brilliant!',
      'Exceptional work!', 'You\'re wonderful!', 'Terrific job!', 'You\'re fantastic!'
    ];
    
    const incorrectMessages = [
      'Great effort!', 'You\'re learning so well!', 'Nice try, keep going!', 'You\'re getting stronger!',
      'Every mistake helps you grow!', 'You\'re doing amazing!', 'Keep up the good work!', 'You\'re on the right track!',
      'Learning is an adventure!', 'You\'re becoming smarter!', 'Great attempt!', 'You\'re improving!',
      'Keep exploring!', 'You\'re so curious!', 'That\'s how we learn!', 'You\'re getting closer!',
      'Wonderful effort!', 'You\'re building your brain!', 'Keep thinking!', 'You\'re so brave to try!',
      'Learning takes practice!', 'You\'re getting better!', 'Keep it up!', 'You\'re doing great!',
      'Every try makes you stronger!', 'You\'re so determined!', 'Keep discovering!', 'You\'re amazing!'
    ];
    
    const correctEmojis = ['🎉', '⭐', '🌟', '👏', '🎊', '🏆', '💫', '🎯', '🔥', '✨', '💎', '🚀', '🌈', '💝', '🎪'];
    const incorrectEmojis = ['💪', '🌱', '🤗', '💡', '🌈', '🎈', '🦋', '🌸', '🎪', '🎭', '🌟', '💫', '🔍', '🎨', '🌻'];
    
    // Use timestamp to create pseudo-randomness that changes over time
    const messageIndex = Math.floor((timestamp / 1000) % (isCorrect ? correctMessages.length : incorrectMessages.length));
    const emojiIndex = Math.floor((timestamp / 2000) % (isCorrect ? correctEmojis.length : incorrectEmojis.length));
    
    const messages = isCorrect ? correctMessages : incorrectMessages;
    const emojis = isCorrect ? correctEmojis : incorrectEmojis;
    
    // Special streak messages for correct answers
    if (isCorrect && streak >= 3) {
      const streakMessages = [
        `Incredible ${streak}-question streak! You're unstoppable!`,
        `WOW! ${streak} perfect answers in a row! You're a superstar!`,
        `Amazing streak of ${streak}! Your brain is on fire!`,
        `${streak} correct answers! You're absolutely brilliant!`,
        `Phenomenal ${streak}-question streak! Keep soaring!`,
        `${streak} in a row! You're a learning champion!`,
        `Spectacular ${streak}-question streak! You're incredible!`,
        `${streak} perfect answers! You're a quiz master!`
      ];
      
      const streakIndex = Math.floor((timestamp / 1500) % streakMessages.length);
      return {
        message: streakMessages[streakIndex],
        emoji: '🔥',
        celebrationType: 'correct'
      };
    }
    
    return {
      message: messages[messageIndex],
      emoji: emojis[emojiIndex],
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

  /**
   * Test method to verify AI connectivity and response format
   * Useful for debugging AI integration issues
   */
  async testAIConnection(): Promise<{ success: boolean; error?: string; response?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'AI not configured - no API key found' };
    }

    try {
      console.log('Testing AI connection...');
      const response = await this.openai.chat.completions.create({
        model: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-35-turbo", // Azure deployment name or fallback
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant. Respond with valid JSON only."
          },
          {
            role: "user",
            content: 'Generate a simple test response in JSON format: {"test": "success", "message": "AI is working"}'
          }
        ],
        temperature: 0.1,
        max_tokens: 100
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return { success: false, error: 'No content in response' };
      }

      // Try to parse the response
      const parsed = JSON.parse(content);
      console.log('AI test successful:', parsed);
      
      return { success: true, response: content };
    } catch (error) {
      console.error('AI test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Export singleton instance
export const aiService = new AIService();