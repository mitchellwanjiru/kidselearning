/**
 * AI Service Debug Test
 * 
 * This file can be used to test AI connectivity and question generation
 * Run this in the browser console to debug AI issues
 */

import { aiService } from './services/aiService';

// Test AI connectivity
export async function testAI() {
  console.log('=== AI Service Debug Test ===');
  
  // Test 1: Check if AI is configured
  console.log('1. AI Enabled:', aiService.isAIEnabled());
  
  // Test 2: Test basic AI connection
  console.log('2. Testing AI connection...');
  const connectionTest = await aiService.testAIConnection();
  console.log('Connection test result:', connectionTest);
  
  if (!connectionTest.success) {
    console.error('❌ AI connection failed:', connectionTest.error);
    return;
  }
  
  // Test 3: Test question generation
  console.log('3. Testing question generation...');
  try {
    const questions = await aiService.generateQuestions({
      module: 'Letters & Phonics',
      difficulty: 'easy',
      childAge: 5,
      previousTopics: [],
      childInterests: []
    });
    
    console.log('✅ Generated questions:', questions.length);
    console.log('Sample question:', questions[0]);
    
    if (questions.length === 0) {
      console.error('❌ No questions generated - check console for AI response parsing errors');
    } else if (questions[0]?.id?.startsWith('fallback-')) {
      console.warn('⚠️ Using fallback questions instead of AI-generated ones');
    } else {
      console.log('✅ AI questions generated successfully!');
    }
    
  } catch (error) {
    console.error('❌ Question generation failed:', error);
  }
  
  console.log('=== Test Complete ===');
}

// Export for browser console testing
(window as any).testAI = testAI;

console.log('AI Debug Test loaded. Run testAI() in the console to debug.');
