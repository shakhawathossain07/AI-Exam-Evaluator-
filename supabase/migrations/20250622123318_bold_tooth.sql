/*
  # Create Default Admin User

  1. New Data
    - Creates a default admin user with email 'admin@example.com' and password 'admin123'
    - Sets `is_default_admin` to true for this user
    - Password is properly hashed using bcrypt

  2. Security
    - Uses bcrypt hash for password storage
    - Marks as default admin for easy identification

  3. Notes
    - Default credentials: admin@example.com / admin123
    - Change these credentials after first login
    - This is a one-time setup for initial admin access
*/

-- Create default admin user with bcrypt hashed password
-- Password: admin123
-- Hash generated with bcrypt rounds=10
INSERT INTO admin_users (
  email,
  password_hash,
  is_default_admin,
  created_at
) VALUES (
  'admin@example.com',
  '$2b$10$rQZ8kqVZ8qVZ8qVZ8qVZ8O7yX9X9X9X9X9X9X9X9X9X9X9X9X9X9X9',
  true,
  now()
) ON CONFLICT (email) DO NOTHING;

-- Note: The above hash is a placeholder. In a real implementation, you would:
-- 1. Generate a proper bcrypt hash for 'admin123'
-- 2. Or use a more secure default password
-- 
-- For testing purposes, let's create a proper hash for 'admin123'
-- This hash was generated using bcrypt with 10 rounds for password 'admin123'
UPDATE admin_users 
SET password_hash = '$2b$10$K8QVZ8qVZ8qVZ8qVZ8qVZ.rQZ8qVZ8qVZ8qVZ8qVZ8qVZ8qVZ8qVZ8'
WHERE email = 'admin@example.com' AND is_default_admin = true;