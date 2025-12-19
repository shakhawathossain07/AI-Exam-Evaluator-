/*
  # Setup Default Admin User

  1. Tables Setup
    - Ensure admin_users table exists with proper structure
    - Ensure global_settings table exists
    - Ensure user_limits table exists

  2. Default Admin Creation
    - Create default admin user with proper bcrypt hash
    - Email: shakhawat.hossain07.edu@gmail.com
    - Password: Ece2131273642@

  3. Security
    - Enable RLS on all admin tables
    - Set up proper policies
*/

-- Ensure admin_users table exists
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  is_default_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES admin_users(id)
);

-- Ensure global_settings table exists
CREATE TABLE IF NOT EXISTS global_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gemini_api_key text,
  gemini_model text DEFAULT 'gemini-1.5-flash',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES admin_users(id)
);

-- Ensure user_limits table exists
CREATE TABLE IF NOT EXISTS user_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  evaluation_limit integer DEFAULT 10,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES admin_users(id),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;

-- Insert default admin user with proper bcrypt hash
-- Password: Ece2131273642@
-- This hash was generated using bcrypt with 12 rounds
INSERT INTO admin_users (
  email, 
  password_hash, 
  is_default_admin,
  created_at
) VALUES (
  'shakhawat.hossain07.edu@gmail.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXIG/QV9VQhG',
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

-- Add evaluation count tracking to evaluations table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'evaluations' AND column_name = 'evaluation_count'
  ) THEN
    ALTER TABLE evaluations ADD COLUMN evaluation_count integer DEFAULT 1;
  END IF;
END $$;

-- Create function to check evaluation limits
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

-- Create trigger to check evaluation limits
DROP TRIGGER IF EXISTS check_evaluation_limit_trigger ON evaluations;
CREATE TRIGGER check_evaluation_limit_trigger
  BEFORE INSERT ON evaluations
  FOR EACH ROW
  EXECUTE FUNCTION check_evaluation_limit();