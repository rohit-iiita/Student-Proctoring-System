-- Resolution certificate storage.
--
-- Signed resolution-certificate PDFs are generated in the admin's browser at
-- resolve-time and uploaded to a private bucket so the complaining student,
-- the assigned faculty and admins can download them later.

INSERT INTO storage.buckets (id, name, public)
VALUES ('resolution-certificates', 'resolution-certificates', false)
ON CONFLICT (id) DO NOTHING;

-- ─── Upload / overwrite: admins only, files must live in a complaint folder ──

DROP POLICY IF EXISTS resolution_certificates_insert_admin ON storage.objects;
CREATE POLICY resolution_certificates_insert_admin ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'resolution-certificates'
    AND public.is_admin()
    AND EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id::text = (storage.foldername(name))[1]
    )
  );

DROP POLICY IF EXISTS resolution_certificates_update_admin ON storage.objects;
CREATE POLICY resolution_certificates_update_admin ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'resolution-certificates'
    AND public.is_admin()
    AND EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id::text = (storage.foldername(name))[1]
    )
  )
  WITH CHECK (
    bucket_id = 'resolution-certificates'
    AND public.is_admin()
    AND EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id::text = (storage.foldername(name))[1]
    )
  );

-- ─── Download: complaint participants only (student, assigned faculty, admin) ─

DROP POLICY IF EXISTS resolution_certificates_select_participant ON storage.objects;
CREATE POLICY resolution_certificates_select_participant ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'resolution-certificates'
    AND EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND (
          c.student_id = auth.uid()
          OR c.assigned_to = auth.uid()
          OR public.is_admin()
        )
    )
  );
