/*
  # Create evaluations schema

  1. New Tables
    - `evaluations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `student_paper_files` (jsonb, array of file metadata)
      - `mark_scheme_files` (jsonb, array of file metadata)
      - `total_possible_marks` (integer, nullable)
      - `evaluation_result` (jsonb, stores the AI evaluation response)
      - `status` (text, evaluation status: pending, processing, completed, failed)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `evaluations` table
    - Add policies for authenticated users to manage their own evaluations
*/

CREATE TABLE IF NOT EXISTS evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  student_paper_files jsonb NOT NULL DEFAULT '[]'::jsonb,
  mark_scheme_files jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_possible_marks integer,
  evaluation_result jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own evaluations
CREATE POLICY "Users can read own evaluations"
  ON evaluations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to create their own evaluations
CREATE POLICY "Users can create own evaluations"
  ON evaluations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own evaluations
CREATE POLICY "Users can update own evaluations"
  ON evaluations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to delete their own evaluations
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

-- Trigger to automatically update updated_at
CREATE TRIGGER update_evaluations_updated_at
  BEFORE UPDATE ON evaluations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();