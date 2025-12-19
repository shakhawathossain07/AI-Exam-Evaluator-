-- =====================================================
-- FINAL MIGRATION: Permanently Remove Gmail Admin
-- This migration ensures gmail admin never comes back
-- =====================================================

-- Remove gmail admin completely
DELETE FROM admin_users WHERE email = 'shakhawat.hossain07.edu@gmail.com';

-- Ensure only the correct admin exists
INSERT INTO admin_users (
  email, 
  password_hash, 
  is_default_admin, 
  is_super_admin,
  created_at
)
SELECT 
  'shakhawat.hossain07@northsouth.edu',
  '195fd0c58831dbd8910700aeebccc41be9ae0ae0dfb38abeb014d75c0358a44e',
  true,
  true,
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM admin_users 
  WHERE email = 'shakhawat.hossain07@northsouth.edu'
);

-- Update existing correct admin
UPDATE admin_users 
SET 
  is_super_admin = true,
  is_default_admin = true,
  password_hash = '195fd0c58831dbd8910700aeebccc41be9ae0ae0dfb38abeb014d75c0358a44e'
WHERE email = 'shakhawat.hossain07@northsouth.edu';

-- Ensure all other admins are not default
UPDATE admin_users 
SET 
  is_default_admin = false
WHERE email != 'shakhawat.hossain07@northsouth.edu';

-- Fix any global_settings references
UPDATE global_settings 
SET updated_by = (
  SELECT id FROM admin_users WHERE email = 'shakhawat.hossain07@northsouth.edu'
)
WHERE updated_by NOT IN (
  SELECT id FROM admin_users WHERE email = 'shakhawat.hossain07@northsouth.edu'
);

-- Create user profile for gmail (as regular user)
INSERT INTO user_profiles (
  email, 
  evaluation_limit, 
  evaluations_used, 
  is_active, 
  created_at
)
SELECT 
  'shakhawat.hossain07.edu@gmail.com',
  100,
  0,
  true,
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE email = 'shakhawat.hossain07.edu@gmail.com'
);

-- Final verification
SELECT 'FINAL ADMIN STATE:' as status;
SELECT 
  email,
  is_default_admin,
  is_super_admin,
  created_at
FROM admin_users 
ORDER BY is_default_admin DESC, created_at;
