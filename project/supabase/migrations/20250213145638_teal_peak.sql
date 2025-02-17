/*
  # Add delete user function

  1. New Functions
    - `delete_user_with_profile`: Securely deletes a user and their profile
      - Requires admin role
      - Handles both auth.users and profiles deletion
      - Returns success/failure status

  2. Security
    - Function is SECURITY DEFINER to run with elevated privileges
    - Checks caller's admin status before proceeding
    - Handles rollback on failure
*/

-- Function to delete a user and their profile
CREATE OR REPLACE FUNCTION delete_user_with_profile(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_is_admin boolean;
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

  -- Delete from profiles first
  DELETE FROM profiles WHERE id = user_id;
  
  -- Delete from auth.users
  DELETE FROM auth.users WHERE id = user_id;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (optional)
    RAISE NOTICE 'Error deleting user: %', SQLERRM;
    RETURN false;
END;
$$;