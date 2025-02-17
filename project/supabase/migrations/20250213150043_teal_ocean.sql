/*
  # Fix delete user function

  1. Changes
    - Reverse deletion order (auth.users first, then profiles)
    - Add proper error handling and transaction management
    - Add checks to prevent deleting the last admin

  2. Security
    - Maintains SECURITY DEFINER
    - Checks admin status
    - Prevents deleting last admin
*/

CREATE OR REPLACE FUNCTION delete_user_with_profile(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_is_admin boolean;
  target_is_admin boolean;
  admin_count integer;
BEGIN
  -- Check if the caller is an admin
  SELECT EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) INTO caller_is_admin;

  IF NOT caller_is_admin THEN
    RAISE EXCEPTION 'Only administrators can delete users';
  END IF;

  -- Check if target user is admin and count total admins
  SELECT 
    role = 'admin',
    (SELECT COUNT(*) FROM profiles WHERE role = 'admin')
  INTO target_is_admin, admin_count
  FROM profiles 
  WHERE id = user_id;

  -- Prevent deleting the last admin
  IF target_is_admin AND admin_count <= 1 THEN
    RAISE EXCEPTION 'Cannot delete the last administrator';
  END IF;

  -- Delete from auth.users first (this will cascade to profiles)
  DELETE FROM auth.users WHERE id = user_id;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error deleting user: %', SQLERRM;
    RETURN false;
END;
$$;