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

CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.faculty(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status public.complaint_status NOT NULL DEFAULT 'submitted',
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_complaints_updated_at ON public.complaints;

CREATE TRIGGER set_complaints_updated_at
BEFORE UPDATE ON public.complaints
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();