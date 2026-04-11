-- Fix BUG-002: "Database error saving new user" on email/password signup.
--
-- Root cause: the `handle_new_user` SECURITY DEFINER trigger from migration 003
-- has no `SET search_path`. On modern Supabase, SECURITY DEFINER functions
-- inherit an empty search_path for safety, which means `profiles` does not
-- resolve and the INSERT raises an "undefined relation" error. The auth
-- transaction rolls back and gotrue surfaces the opaque message
-- "Database error saving new user".
--
-- Fix:
--   1. Recreate the function with `SET search_path = public, auth` so it can
--      resolve both the target table and any auth.* references.
--   2. Wrap the INSERT in EXCEPTION/RAISE WARNING so a profile-row failure
--      can never block a user signup again. Worst case: the user exists in
--      auth.users with no profile row, which the API layer can self-heal on
--      first request (already true for the Stripe webhook path).
--   3. Re-assert the explicit INSERT policy on profiles so RLS can't
--      inadvertently block the trigger if a future migration drops it.
--   4. Re-grant INSERT/SELECT/UPDATE on profiles to the postgres role and
--      to authenticated as a belt-and-suspenders against migration drift.

-- 1+2: function with explicit search_path and exception handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, auth
AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, display_name, scout_alias)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NULL),
      COALESCE(NEW.raw_user_meta_data->>'scout_alias', NULL)
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Don't block auth.users insert; surface the real error in Postgres logs
    -- so we can debug it on the Supabase dashboard, but let signup succeed.
    RAISE WARNING 'handle_new_user: profile insert failed for user %: % (SQLSTATE %)',
      NEW.id, SQLERRM, SQLSTATE;
  END;
  RETURN NEW;
END;
$$;

-- Make sure the trigger still references the new function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3: re-assert insert policy (idempotent — drop first then create)
DROP POLICY IF EXISTS "Service role inserts profiles" ON public.profiles;
CREATE POLICY "Service role inserts profiles" ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- 4: explicit grants — postgres should always have these but migration drift
-- can erase them. Authenticated needs SELECT for own-profile reads (RLS still
-- restricts which rows they see).
GRANT INSERT, SELECT, UPDATE ON public.profiles TO postgres;
GRANT SELECT ON public.profiles TO authenticated;
