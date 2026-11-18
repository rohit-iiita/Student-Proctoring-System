-- =============================================================================
-- Seed data: test users for the Student Proctoring System.
--
-- Purpose:
--   Seeds `auth.users` with one admin, two faculty and one student account so
--   every role-based flow (auth, complaints, meetings, notifications, exams,
--   proctoring review) can be tested without signing up through the UI.
--
-- How it works:
--   1. Inserts rows into `auth.users` with bcrypt-hashed passwords, exactly
--      like GoTrue does (cost 10), with verified / confirmed email state.
--   2. The existing `on_auth_user_created` trigger (handle_new_auth_user)
--      automatically creates the matching `public.profiles` row plus the
--      `public.students` / `public.faculty` row from the user metadata, so
--      the public tables stay consistent with a real signup.
--   3. Inserts the matching `auth.identities` (email provider) rows.
--
-- Idempotent:
--   Safe to re-run. Existing users (matched case-insensitively by email) are
--   skipped and identity inserts use ON CONFLICT DO NOTHING.
--
-- Run locally:  `supabase db reset` (loads this file per [db.seed] in config.toml)
-- Run remotely: `npx supabase db query --remote --file supabase/seed.sql`
--
-- NOTE: Test credentials only - do not use these passwords in production.
-- =============================================================================

-- 1. Auth users. `raw_user_meta_data` mirrors the shape produced by the app's
--    signup service (full_name, role, id_number), which the DB trigger reads.
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token,
  recovery_token,
  email_change,
  email_change_token_new,
  email_change_token_current,
  reauthentication_token,
  phone_change,
  phone_change_token,
  created_at,
  updated_at,
  is_sso_user,
  is_anonymous
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  u.id,
  'authenticated',
  'authenticated',
  u.email,
  extensions.crypt(u.password, extensions.gen_salt('bf', 10)),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  jsonb_build_object(
    'sub', u.id,
    'email', u.email,
    'email_verified', true,
    'phone_verified', false,
    'full_name', u.full_name,
    'role', u.role,
    'id_number', u.id_number
  ),
  -- GoTrue scans token columns as non-nullable strings: they must be ''
  -- (like a real signup), never NULL, or password sign-in returns a 500.
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  now(),
  now(),
  false,
  false
FROM (
  VALUES
    -- id,                                   email,                      password,          full_name,        role,       id_number
    ('639ebac6-55f4-4f4a-88b5-c68d492cca22'::uuid, 'rohitmondall8000@gmail.com',   'Keyamondal@123',  'Mr. John Doe',   'admin',    NULL::text),
    ('b227093d-e516-4a0d-80ea-f1563e80e020'::uuid, 'itrohitmondall@gmail.com', 'Keyamondal@123',  'Mr. James Davis','faculty',  'FAC2026001'),
    ('91159466-c659-47bd-a3f6-1a978d4f9154'::uuid, 'neowwqtd1l@olipii.com',    'Keyamondal@123',  'Mr. K. Durant',  'faculty',  'FAC2026002'),
    ('9325fcb2-fa38-4d2a-9b99-5d318b9b29a5'::uuid, 'mse2026014@iiita.ac.in',   'Keyamondal@123',  'Advaith',        'student',  'MSE2026014')
) AS u(id, email, password, full_name, role, id_number)
WHERE NOT EXISTS (
  SELECT 1
  FROM auth.users existing
  WHERE lower(existing.email) = lower(u.email)
);

-- 2. Email identities (mirrors what GoTrue writes at signup).
INSERT INTO auth.identities (
  user_id,
  provider_id,
  provider,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  au.id,
  au.id,
  'email',
  au.raw_user_meta_data,
  now(),
  now(),
  now()
FROM auth.users au
WHERE lower(au.email) IN (
  'rohitmondall@gmail.com',
  'itrohitmondall@gmail.com',
  'neowwqtd1l@olipii.com',
  'mse2026014@iiita.ac.in'
)
ON CONFLICT (provider_id, provider) DO NOTHING;
