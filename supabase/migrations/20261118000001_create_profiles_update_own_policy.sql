-- Allow users to update their own profile row (full_name only).
--
-- `profiles` had RLS enabled but no UPDATE policy, so any UPDATE from the
-- client (anon key) fails with "new row violates row-level security policy".
-- Only `full_name` is updatable: role and email are managed centrally, so a
-- column-level grant prevents users from self-escalating their role.

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

REVOKE UPDATE ON TABLE public.profiles FROM authenticated;

GRANT UPDATE (full_name) ON public.profiles TO authenticated;
