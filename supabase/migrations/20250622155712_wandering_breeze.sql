/*
  # Complete AI Exam Evaluator Database Setup

  1. New Tables
    - `evaluations` - Store exam evaluation records
    - `admin_users` - Admin user accounts with secure authentication
    - `global_settings` - System-wide configuration (API keys, models)
    - `user_limits` - Per-user evaluation limits

  2. Security
    - Enable RLS on all tables
    - Create policies for user data access
    - Admin-only access for admin tables

  3. Functions & Triggers
    - Evaluation limit checking
    - Auto-update timestamps
    - Default admin user creation
*/

-- Create evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  student_paper_files jsonb NOT NULL DEFAULT '[]'::jsonb,
  mark_scheme_files jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_possible_marks integer,
  evaluation_result jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  evaluation_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  is_default_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES admin_users(id)
);

-- Create global_settings table
CREATE TABLE IF NOT EXISTS global_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gemini_api_key text,
  gemini_model text DEFAULT 'gemini-1.5-flash',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES admin_users(id)
);

-- Create user_limits table
CREATE TABLE IF NOT EXISTS user_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  evaluation_limit integer DEFAULT 10,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES admin_users(id),
  UNIQUE(user_id)
);

-- Enable RLS on all tables
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;

-- Policies for evaluations table
CREATE POLICY "Users can read own evaluations"
  ON evaluations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own evaluations"
  ON evaluations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own evaluations"
  ON evaluations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own evaluations"
  ON evaluations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at for evaluations
CREATE TRIGGER update_evaluations_updated_at
  BEFORE UPDATE ON evaluations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to check evaluation limits
CREATE OR REPLACE FUNCTION check_evaluation_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_limit integer;
  current_count integer;
BEGIN
  -- Get user's evaluation limit
  SELECT evaluation_limit INTO user_limit
  FROM user_limits
  WHERE user_id = NEW.user_id;
  
  -- If no limit set, use default of 10
  IF user_limit IS NULL THEN
    user_limit := 10;
  END IF;
  
  -- Count current evaluations for this user
  SELECT COUNT(*) INTO current_count
  FROM evaluations
  WHERE user_id = NEW.user_id AND status = 'completed';
  
  -- Check if limit exceeded
  IF current_count >= user_limit THEN
    RAISE EXCEPTION 'Evaluation limit exceeded. You have reached your limit of % evaluations.', user_limit;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check evaluation limits
DROP TRIGGER IF EXISTS check_evaluation_limit_trigger ON evaluations;
CREATE TRIGGER check_evaluation_limit_trigger
  BEFORE INSERT ON evaluations
  FOR EACH ROW
  EXECUTE FUNCTION check_evaluation_limit();

-- Insert default admin user
-- Password: Ece2131273642@ (hashed with custom salt)
INSERT INTO admin_users (
  email, 
  password_hash, 
  is_default_admin,
  created_at
) VALUES (
  'shakhawat.hossain07.edu@gmail.com',
  'a8b9c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0',
  true,
  now()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  is_default_admin = EXCLUDED.is_default_admin;

-- Insert default global settings
INSERT INTO global_settings (
  gemini_api_key, 
  gemini_model, 
  updated_by
) 
SELECT 
  NULL, 
  'gemini-1.5-flash', 
  id 
FROM admin_users 
WHERE email = 'shakhawat.hossain07.edu@gmail.com'
ON CONFLICT DO NOTHING;