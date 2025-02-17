-- Drop existing function and policies
DROP FUNCTION IF EXISTS is_admin CASCADE;
DROP POLICY IF EXISTS "View profiles" ON profiles;
DROP POLICY IF EXISTS "Create profiles" ON profiles;
DROP POLICY IF EXISTS "Update profiles" ON profiles;

-- Create a simpler is_admin function
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new policies
CREATE POLICY "Anyone can create a profile"
ON profiles FOR INSERT
WITH CHECK (true);

CREATE POLICY "Profiles are viewable by owner and admins"
ON profiles FOR SELECT
USING (
  auth.uid() = id OR is_admin(auth.uid())
);

CREATE POLICY "Profiles are updatable by owner and admins"
ON profiles FOR UPDATE
USING (
  auth.uid() = id OR is_admin(auth.uid())
)
WITH CHECK (
  auth.uid() = id OR is_admin(auth.uid())
);

-- Add phone column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;
END $$;

-- Update the handle_new_user function to include phone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, email, phone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'role', 'employee'),
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'phone', null)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;