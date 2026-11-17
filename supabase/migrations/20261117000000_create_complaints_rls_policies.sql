-- Row Level Security policies for the complaints module.
--
-- RLS was enabled on these tables but no policies existed, which blocked every
-- user-scoped read/write (e.g. "new row violates row-level security policy for
-- table complaints" when a student submitted the complaint form).

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_respondents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;

-- Helper: true when the current user has the admin profile role.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ─── complaints ──────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS complaints_select_own ON public.complaints;
CREATE POLICY complaints_select_own ON public.complaints
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS complaints_select_assigned ON public.complaints;
CREATE POLICY complaints_select_assigned ON public.complaints
  FOR SELECT TO authenticated
  USING (assigned_to = auth.uid());

DROP POLICY IF EXISTS complaints_select_admin ON public.complaints;
CREATE POLICY complaints_select_admin ON public.complaints
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS complaints_insert_own ON public.complaints;
CREATE POLICY complaints_insert_own ON public.complaints
  FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS complaints_update_assigned ON public.complaints;
CREATE POLICY complaints_update_assigned ON public.complaints
  FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

DROP POLICY IF EXISTS complaints_update_admin ON public.complaints;
CREATE POLICY complaints_update_admin ON public.complaints
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (true);

-- ─── complaint_attachments ───────────────────────────────────────────────────

DROP POLICY IF EXISTS complaint_attachments_select_participant ON public.complaint_attachments;
CREATE POLICY complaint_attachments_select_participant ON public.complaint_attachments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_id
        AND (
          c.student_id = auth.uid()
          OR c.assigned_to = auth.uid()
          OR public.is_admin()
        )
    )
  );

DROP POLICY IF EXISTS complaint_attachments_insert_own ON public.complaint_attachments;
CREATE POLICY complaint_attachments_insert_own ON public.complaint_attachments
  FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

-- ─── complaint_respondents ───────────────────────────────────────────────────

DROP POLICY IF EXISTS complaint_respondents_select_participant ON public.complaint_respondents;
CREATE POLICY complaint_respondents_select_participant ON public.complaint_respondents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_id
        AND (
          c.student_id = auth.uid()
          OR c.assigned_to = auth.uid()
          OR public.is_admin()
        )
    )
  );

DROP POLICY IF EXISTS complaint_respondents_insert_own ON public.complaint_respondents;
CREATE POLICY complaint_respondents_insert_own ON public.complaint_respondents
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_id
        AND c.student_id = auth.uid()
    )
  );

-- ─── Reference tables (read-only directory data used by complaint joins) ────

DROP POLICY IF EXISTS profiles_select_authenticated ON public.profiles;
CREATE POLICY profiles_select_authenticated ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS students_select_authenticated ON public.students;
CREATE POLICY students_select_authenticated ON public.students
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS faculty_select_authenticated ON public.faculty;
CREATE POLICY faculty_select_authenticated ON public.faculty
  FOR SELECT TO authenticated
  USING (true);

-- ─── Storage: evidence uploads into own complaint folders ────────────────────

DROP POLICY IF EXISTS complaint_uploads_insert_own ON storage.objects;
CREATE POLICY complaint_uploads_insert_own ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'complaint-attachments'
    AND EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND c.student_id = auth.uid()
    )
  );
