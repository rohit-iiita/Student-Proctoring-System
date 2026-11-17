-- Fix handle_new_auth_user trigger to also populate students / faculty tables.
-- The existing trigger on auth.users is kept; only the function body is replaced.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  display_name TEXT;
  user_role    public.user_role;
  id_number    TEXT;
BEGIN
  display_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
    'New User'
  );

  user_role := CASE
    WHEN NEW.raw_user_meta_data ->> 'role' = 'faculty' THEN 'faculty'::public.user_role
    WHEN NEW.raw_user_meta_data ->> 'role' = 'admin'   THEN 'admin'::public.user_role
    ELSE 'student'::public.user_role
  END;

  id_number := NULLIF(NEW.raw_user_meta_data ->> 'id_number', '');

  -- 1. Insert profile row
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (NEW.id, display_name, NEW.email, user_role)
  ON CONFLICT (id) DO NOTHING;

  -- 2. Insert role-specific row
  IF user_role = 'student' THEN
    INSERT INTO public.students (id, enrollment_no)
    VALUES (NEW.id, id_number)
    ON CONFLICT (id) DO NOTHING;

  ELSIF user_role = 'faculty' THEN
    INSERT INTO public.faculty (id, employee_id)
    VALUES (NEW.id, id_number)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  -- admin users have no extra table row

  RETURN NEW;
END;
$$;
