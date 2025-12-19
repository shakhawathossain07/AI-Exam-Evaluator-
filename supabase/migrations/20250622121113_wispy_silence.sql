/*
  # Create admin system tables

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `is_default_admin` (boolean)
      - `created_at` (timestamp)
      - `created_by` (uuid, nullable, references admin_users)
    
    - `global_settings`
      - `id` (uuid, primary key)
      - `gemini_api_key` (text)
      - `gemini_model` (text)
      - `updated_at` (timestamp)
      - `updated_by` (uuid, references admin_users)
    
    - `user_limits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `evaluation_limit` (integer)
      - `updated_at` (timestamp)
      - `updated_by` (uuid, references admin_users)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access only
*/

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

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;

-- Insert default admin (password hash for 'Ece2131273642@')
INSERT INTO admin_users (email, password_hash, is_default_admin) 
VALUES ('shakhawat.hossain07.edu@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true)
ON CONFLICT (email) DO NOTHING;

-- Insert default global settings
INSERT INTO global_settings (gemini_api_key, gemini_model, updated_by)
SELECT NULL, 'gemini-1.5-flash', id FROM admin_users WHERE email = 'shakhawat.hossain07.edu@gmail.com'
ON CONFLICT DO NOTHING;

-- Add evaluation count tracking to evaluations table
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