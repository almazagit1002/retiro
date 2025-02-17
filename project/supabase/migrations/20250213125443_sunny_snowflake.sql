/*
  # Set initial admin user

  1. Changes
    - Updates the role of the first user to 'admin'
    
  2. Security
    - Only affects one user
    - Maintains existing RLS policies
*/

-- Set the first user as admin
UPDATE profiles
SET role = 'admin'
WHERE id IN (
  SELECT id 
  FROM profiles 
  ORDER BY created_at ASC 
  LIMIT 1
);