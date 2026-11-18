-- Row Level Security policies for the meetings and notifications modules.
--
-- RLS was enabled on these tables but no policies existed, so every
-- authenticated read/write failed with:
--   "new row violates row-level security policy for table meetings" (42501)
--
-- Notifications have no INSERT policy on purpose: they are system-generated
-- on behalf of other users (e.g. an admin notifying complaint participants),
-- and those writes go through the service-role client from trusted
-- server-side flows only.

-- ─── meetings ────────────────────────────────────────────────────────────────

-- Visible to: the admin who created it, any admin, and invited participants.
DROP POLICY IF EXISTS meetings_select_participant ON public.meetings;
CREATE POLICY meetings_select_participant ON public.meetings
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.meeting_participants mp
      WHERE mp.meeting_id = meetings.id
        AND mp.user_id = auth.uid()
    )
  );

-- Only admins can schedule meetings, and only in their own name.
DROP POLICY IF EXISTS meetings_insert_admin ON public.meetings;
CREATE POLICY meetings_insert_admin ON public.meetings
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND public.is_admin());

-- Creators and admins can update meeting details / status (cancel, complete).
DROP POLICY IF EXISTS meetings_update_creator_or_admin ON public.meetings;
CREATE POLICY meetings_update_creator_or_admin ON public.meetings
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.is_admin())
  WITH CHECK (created_by = auth.uid() OR public.is_admin());

-- ─── meeting_participants ────────────────────────────────────────────────────

DROP POLICY IF EXISTS meeting_participants_select_own ON public.meeting_participants;
CREATE POLICY meeting_participants_select_own ON public.meeting_participants
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admins add participants to meetings they created.
DROP POLICY IF EXISTS meeting_participants_insert_admin ON public.meeting_participants;
CREATE POLICY meeting_participants_insert_admin ON public.meeting_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    AND EXISTS (
      SELECT 1 FROM public.meetings m
      WHERE m.id = meeting_participants.meeting_id
        AND m.created_by = auth.uid()
    )
  );

-- Participants respond to their own invitation (accept/decline).
DROP POLICY IF EXISTS meeting_participants_update_own ON public.meeting_participants;
CREATE POLICY meeting_participants_update_own ON public.meeting_participants
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── notifications ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS notifications_select_own ON public.notifications;
CREATE POLICY notifications_select_own ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS notifications_update_own ON public.notifications;
CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── Storage: reading evidence files of complaints you are party to ─────────

DROP POLICY IF EXISTS complaint_uploads_select_participant ON storage.objects;
CREATE POLICY complaint_uploads_select_participant ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'complaint-attachments'
    AND EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id::text = (storage.foldername(storage.objects.name))[1]
        AND (
          c.student_id = auth.uid()
          OR c.assigned_to = auth.uid()
          OR public.is_admin()
        )
    )
  );
