-- Fix: "Database error saving new user" on signup
-- The handle_new_user trigger needs INSERT policy on profiles table
-- and the function should handle edge cases gracefully

-- Add INSERT policy for the trigger (SECURITY DEFINER should bypass RLS,
-- but adding explicit policy as belt-and-suspenders)
CREATE POLICY "Service role inserts profiles" ON profiles
  FOR INSERT
  WITH CHECK (true);

-- Replace the trigger function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, scout_alias)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'scout_alias', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
