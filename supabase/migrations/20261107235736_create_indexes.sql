-- Performance indexes.

CREATE INDEX IF NOT EXISTS idx_profiles_role
ON public.profiles(role);

CREATE INDEX IF NOT EXISTS idx_students_department_semester
ON public.students(department, semester);

CREATE INDEX IF NOT EXISTS idx_complaints_student_created
ON public.complaints(student_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_complaints_assigned_status
ON public.complaints(assigned_to, status);

CREATE INDEX IF NOT EXISTS idx_complaints_status_created
ON public.complaints(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_complaint_respondents_complaint_id
ON public.complaint_respondents(complaint_id);

CREATE INDEX IF NOT EXISTS idx_complaint_respondents_student_id
ON public.complaint_respondents(student_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
ON public.notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
ON public.notifications(user_id, created_at DESC)
WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_meetings_creator_starts
ON public.meetings(created_by, starts_at);

CREATE INDEX IF NOT EXISTS idx_meeting_participants_user
ON public.meeting_participants(user_id, invitation_status);

CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting
ON public.meeting_participants(meeting_id);
