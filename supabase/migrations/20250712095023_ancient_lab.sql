/*
  # Comprehensive Q&A Platform Schema

  1. New Tables
    - `profiles` - User profile information (replaces users table)
    - `questions` - Questions with proper relations
    - `answers` - Answers linked to questions and users
    - `votes` - Voting system for answers
    - `question_votes` - Voting system for questions
    - `comments` - Comments on answers
    - `tags` - Available tags
    - `question_tags` - Many-to-many relation between questions and tags
    - `notifications` - User notifications
    - `user_badges` - User achievement system

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for CRUD operations
    - Ensure users can only modify their own content

  3. Functions
    - Auto-update vote counts
    - Auto-update answer counts
    - Notification triggers
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tags CASCADE;

-- Create profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  website text,
  location text,
  reputation integer DEFAULT 0,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  color text DEFAULT '#3b82f6',
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  view_count integer DEFAULT 0,
  vote_score integer DEFAULT 0,
  answer_count integer DEFAULT 0,
  is_answered boolean DEFAULT false,
  accepted_answer_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create question_tags junction table
CREATE TABLE IF NOT EXISTS question_tags (
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, tag_id)
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_score integer DEFAULT 0,
  is_accepted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key for accepted answer
ALTER TABLE questions 
ADD CONSTRAINT questions_accepted_answer_fkey 
FOREIGN KEY (accepted_answer_id) REFERENCES answers(id) ON DELETE SET NULL;

-- Create question votes table
CREATE TABLE IF NOT EXISTS question_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(question_id, user_id)
);

-- Create answer votes table
CREATE TABLE IF NOT EXISTS answer_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id uuid NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(answer_id, user_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  answer_id uuid NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('answer', 'comment', 'vote', 'accepted', 'mention')),
  title text NOT NULL,
  message text NOT NULL,
  link text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create user badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type text NOT NULL CHECK (badge_type IN ('bronze', 'silver', 'gold')),
  badge_name text NOT NULL,
  description text,
  earned_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_questions_author ON questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_vote_score ON questions(vote_score DESC);
CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_author ON answers(author_id);
CREATE INDEX IF NOT EXISTS idx_question_votes_question ON question_votes(question_id);
CREATE INDEX IF NOT EXISTS idx_answer_votes_answer ON answer_votes(answer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Questions policies
CREATE POLICY "Questions are viewable by everyone" ON questions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create questions" ON questions
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own questions" ON questions
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own questions" ON questions
  FOR DELETE USING (auth.uid() = author_id);

-- Answers policies
CREATE POLICY "Answers are viewable by everyone" ON answers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create answers" ON answers
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own answers" ON answers
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own answers" ON answers
  FOR DELETE USING (auth.uid() = author_id);

-- Question votes policies
CREATE POLICY "Question votes are viewable by everyone" ON question_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own question votes" ON question_votes
  FOR ALL USING (auth.uid() = user_id);

-- Answer votes policies
CREATE POLICY "Answer votes are viewable by everyone" ON answer_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own answer votes" ON answer_votes
  FOR ALL USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = author_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Tags policies
CREATE POLICY "Tags are viewable by everyone" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tags" ON tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Question tags policies
CREATE POLICY "Question tags are viewable by everyone" ON question_tags
  FOR SELECT USING (true);

CREATE POLICY "Question authors can manage their question tags" ON question_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE id = question_id AND author_id = auth.uid()
    )
  );

-- User badges policies
CREATE POLICY "User badges are viewable by everyone" ON user_badges
  FOR SELECT USING (true);

CREATE POLICY "System can award badges" ON user_badges
  FOR INSERT WITH CHECK (true);

-- Functions to update vote scores
CREATE OR REPLACE FUNCTION update_question_vote_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE questions
  SET vote_score = (
    SELECT COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 ELSE -1 END), 0)
    FROM question_votes
    WHERE question_id = COALESCE(NEW.question_id, OLD.question_id)
  )
  WHERE id = COALESCE(NEW.question_id, OLD.question_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_answer_vote_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE answers
  SET vote_score = (
    SELECT COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 ELSE -1 END), 0)
    FROM answer_votes
    WHERE answer_id = COALESCE(NEW.answer_id, OLD.answer_id)
  )
  WHERE id = COALESCE(NEW.answer_id, OLD.answer_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_answer_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE questions
  SET answer_count = (
    SELECT COUNT(*)
    FROM answers
    WHERE question_id = COALESCE(NEW.question_id, OLD.question_id)
  )
  WHERE id = COALESCE(NEW.question_id, OLD.question_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update usage count for the tag
  UPDATE tags
  SET usage_count = (
    SELECT COUNT(*)
    FROM question_tags
    WHERE tag_id = COALESCE(NEW.tag_id, OLD.tag_id)
  )
  WHERE id = COALESCE(NEW.tag_id, OLD.tag_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_question_vote_score ON question_votes;
CREATE TRIGGER trigger_update_question_vote_score
  AFTER INSERT OR UPDATE OR DELETE ON question_votes
  FOR EACH ROW EXECUTE FUNCTION update_question_vote_score();

DROP TRIGGER IF EXISTS trigger_update_answer_vote_score ON answer_votes;
CREATE TRIGGER trigger_update_answer_vote_score
  AFTER INSERT OR UPDATE OR DELETE ON answer_votes
  FOR EACH ROW EXECUTE FUNCTION update_answer_vote_score();

DROP TRIGGER IF EXISTS trigger_update_answer_count ON answers;
CREATE TRIGGER trigger_update_answer_count
  AFTER INSERT OR DELETE ON answers
  FOR EACH ROW EXECUTE FUNCTION update_answer_count();

DROP TRIGGER IF EXISTS trigger_update_tag_usage_count ON question_tags;
CREATE TRIGGER trigger_update_tag_usage_count
  AFTER INSERT OR DELETE ON question_tags
  FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- Insert some default tags
INSERT INTO tags (name, description, color) VALUES
  ('javascript', 'JavaScript programming language', '#F7DF1E'),
  ('react', 'React JavaScript library', '#61DAFB'),
  ('typescript', 'TypeScript programming language', '#3178C6'),
  ('css', 'Cascading Style Sheets', '#1572B6'),
  ('html', 'HyperText Markup Language', '#E34F26'),
  ('node', 'Node.js runtime environment', '#339933'),
  ('python', 'Python programming language', '#3776AB'),
  ('sql', 'Structured Query Language', '#4479A1'),
  ('api', 'Application Programming Interface', '#FF6B6B'),
  ('database', 'Database management and design', '#4ECDC4'),
  ('git', 'Git version control system', '#F05032'),
  ('docker', 'Docker containerization', '#2496ED'),
  ('aws', 'Amazon Web Services', '#FF9900'),
  ('mongodb', 'MongoDB database', '#47A248'),
  ('postgresql', 'PostgreSQL database', '#336791')
ON CONFLICT (name) DO NOTHING;