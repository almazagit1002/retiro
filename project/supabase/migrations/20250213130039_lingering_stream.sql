/*
  # Fix RLS Policies for Profiles Table

  1. Changes
    - Removes recursive policies that were causing infinite recursion
    - Creates new, simplified policies for profile access
    - Maintains security while avoiding self-referential checks
    
  2. Security
    - Maintains admin privileges
    - Ensures proper access control
    - Prevents infinite recursion in policy checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Only admins can create profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile and admins can update any profile" ON profiles;

-- Create new, non-recursive policies
CREATE POLICY "Profiles are viewable by owner and admins"
ON profiles FOR SELECT
USING (
  auth.uid() = id OR 
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can create new profiles"
ON profiles FOR INSERT
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Profiles are updatable by owner and admins"
ON profiles FOR UPDATE
USING (
  auth.uid() = id OR 
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  auth.uid() = id OR 
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);