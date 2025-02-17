/*
  # Fix Recursive Profile Policies

  1. Changes
    - Creates a new function to check admin status
    - Replaces recursive policies with function-based ones
    - Maintains same security model but avoids recursion
    
  2. Security
    - Maintains admin privileges
    - Ensures proper access control
    - Prevents infinite recursion
*/

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = user_id;
  
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "Profiles are viewable by owner and admins" ON profiles;
DROP POLICY IF EXISTS "Admins can create new profiles" ON profiles;
DROP POLICY IF EXISTS "Profiles are updatable by owner and admins" ON profiles;

-- Create new policies using the function
CREATE POLICY "View profiles"
ON profiles FOR SELECT
USING (
  auth.uid() = id OR is_admin(auth.uid())
);

CREATE POLICY "Create profiles"
ON profiles FOR INSERT
WITH CHECK (
  is_admin(auth.uid())
);

CREATE POLICY "Update profiles"
ON profiles FOR UPDATE
USING (
  auth.uid() = id OR is_admin(auth.uid())
)
WITH CHECK (
  auth.uid() = id OR is_admin(auth.uid())
);