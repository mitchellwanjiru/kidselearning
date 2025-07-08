/*
  # AI Learning Buddy Database Schema

  1. New Tables
    - `children`
      - `id` (uuid, primary key)
      - `name` (text)
      - `age` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `learning_sessions`
      - `id` (uuid, primary key)
      - `child_id` (uuid, foreign key)
      - `module` (text)
      - `questions_answered` (integer)
      - `correct_answers` (integer)
      - `points_earned` (integer)
      - `session_date` (timestamp)
      - `ai_generated` (boolean)
    
    - `question_responses`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `question_text` (text)
      - `selected_answer` (text)
      - `correct_answer` (text)
      - `is_correct` (boolean)
      - `topic` (text)
      - `response_time` (integer)
    
    - `child_progress`
      - `id` (uuid, primary key)
      - `child_id` (uuid, foreign key)
      - `total_points` (integer)
      - `total_questions` (integer)
      - `correct_answers` (integer)
      - `current_streak` (integer)
      - `modules_completed` (jsonb)
      - `achievements` (text[])
      - `last_activity` (timestamp)
    
    - `ai_analytics`
      - `id` (uuid, primary key)
      - `child_id` (uuid, foreign key)
      - `strengths` (text[])
      - `improvement_areas` (text[])
      - `recommended_topics` (text[])
      - `personalized_tips` (text[])
      - `generated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their children's data
    - Teachers/parents can view progress of children they have access to
*/

-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer DEFAULT 5,
  parent_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create learning sessions table
CREATE TABLE IF NOT EXISTS learning_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  module text NOT NULL,
  questions_answered integer DEFAULT 0,
  correct_answers integer DEFAULT 0,
  points_earned integer DEFAULT 0,
  session_date timestamptz DEFAULT now(),
  ai_generated boolean DEFAULT false,
  session_duration integer DEFAULT 0
);

-- Create question responses table
CREATE TABLE IF NOT EXISTS question_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES learning_sessions(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  selected_answer text NOT NULL,
  correct_answer text NOT NULL,
  is_correct boolean NOT NULL,
  topic text,
  response_time integer DEFAULT 0,
  answered_at timestamptz DEFAULT now()
);

-- Create child progress table
CREATE TABLE IF NOT EXISTS child_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE UNIQUE,
  total_points integer DEFAULT 0,
  total_questions integer DEFAULT 0,
  correct_answers integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  modules_completed jsonb DEFAULT '{}',
  achievements text[] DEFAULT '{}',
  games_unlocked text[] DEFAULT '{}',
  last_activity timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create AI analytics table
CREATE TABLE IF NOT EXISTS ai_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  strengths text[] DEFAULT '{}',
  improvement_areas text[] DEFAULT '{}',
  recommended_topics text[] DEFAULT '{}',
  personalized_tips text[] DEFAULT '{}',
  accuracy_rate numeric(5,2),
  learning_velocity numeric(5,2),
  generated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for children table
CREATE POLICY "Parents can manage their children"
  ON children
  FOR ALL
  TO authenticated
  USING (parent_id = auth.uid());

-- Create policies for learning sessions
CREATE POLICY "Access sessions for own children"
  ON learning_sessions
  FOR ALL
  TO authenticated
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

-- Create policies for question responses
CREATE POLICY "Access responses for own children's sessions"
  ON question_responses
  FOR ALL
  TO authenticated
  USING (
    session_id IN (
      SELECT ls.id FROM learning_sessions ls
      JOIN children c ON ls.child_id = c.id
      WHERE c.parent_id = auth.uid()
    )
  );

-- Create policies for child progress
CREATE POLICY "Access progress for own children"
  ON child_progress
  FOR ALL
  TO authenticated
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

-- Create policies for AI analytics
CREATE POLICY "Access analytics for own children"
  ON ai_analytics
  FOR ALL
  TO authenticated
  USING (
    child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_child_progress_updated_at
  BEFORE UPDATE ON child_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_child_id ON learning_sessions(child_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_date ON learning_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_question_responses_session_id ON question_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_child_progress_child_id ON child_progress(child_id);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_child_id ON ai_analytics(child_id);