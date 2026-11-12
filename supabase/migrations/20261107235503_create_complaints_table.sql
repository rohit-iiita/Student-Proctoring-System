-- Student complaints.

DO $$ BEGIN
  CREATE TYPE public.complaint_status AS ENUM (
    'submitted',
    'under_review',
    'resolved',
    'rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.complaint_category AS ENUM (
    'ragging_and_harassment',
    'ta',
    'hostel',
    'mess_and_food',
    'discrimination_and_misconduct'
  )
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id TEXT NOT NULL,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  category public.complaint_category NOT NULL DEFAULT 'hostel',
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status public.complaint_status NOT NULL DEFAULT 'submitted',
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(reference_id)
);

CREATE TABLE IF NOT EXISTS public.complaint_respondents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (complaint_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.complaint_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Generate a random 9-character reference.
CREATE OR REPLACE FUNCTION public.generate_complaint_reference()
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
SET search_path = ''
AS $$
DECLARE
  v_chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_result TEXT := '';
  v_bytes BYTEA;
  i INTEGER;
BEGIN
  v_bytes := extensions.gen_random_bytes(9);

  FOR i IN 0..8 LOOP
    v_result := v_result ||
      SUBSTRING(
        v_chars,
        (GET_BYTE(v_bytes, i) % 32) + 1,
        1
      );
  END LOOP;

  RETURN v_result;
END;
$$;