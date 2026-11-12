CREATE EXTENSION IF NOT EXISTS pgmq;

SELECT pgmq.create('email_jobs');

-- Add one email job to the queue.
CREATE OR REPLACE FUNCTION public.enqueue_email_job(
  p_message JSONB
)
RETURNS BIGINT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT *
  FROM pgmq.send('email_jobs', p_message);
$$;


-- Read pending email jobs.
CREATE OR REPLACE FUNCTION public.read_email_jobs(
  p_visibility_timeout INTEGER DEFAULT 120,
  p_batch_size INTEGER DEFAULT 5
)
RETURNS TABLE (
  msg_id BIGINT,
  read_ct INTEGER,
  enqueued_at TIMESTAMPTZ,
  vt TIMESTAMPTZ,
  message JSONB
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    m.msg_id,
    m.read_ct,
    m.enqueued_at,
    m.vt,
    m.message
  FROM pgmq.read(
    'email_jobs',
    p_visibility_timeout,
    p_batch_size
  ) AS m;
$$;


-- Delete a job after successful email delivery.
CREATE OR REPLACE FUNCTION public.delete_email_job(
  p_message_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT pgmq.delete('email_jobs', p_message_id);
$$;


-- Archive jobs that have exceeded the retry limit.
CREATE OR REPLACE FUNCTION public.archive_email_job(
  p_message_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT pgmq.archive('email_jobs', p_message_id);
$$;


-- Only the backend service role can call these functions.
REVOKE ALL ON FUNCTION public.enqueue_email_job(JSONB)
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.read_email_jobs(INTEGER, INTEGER)
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.delete_email_job(BIGINT)
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.archive_email_job(BIGINT)
FROM PUBLIC, anon, authenticated;


GRANT EXECUTE ON FUNCTION public.enqueue_email_job(JSONB)
TO service_role;

GRANT EXECUTE ON FUNCTION public.read_email_jobs(INTEGER, INTEGER)
TO service_role;

GRANT EXECUTE ON FUNCTION public.delete_email_job(BIGINT)
TO service_role;

GRANT EXECUTE ON FUNCTION public.archive_email_job(BIGINT)
TO service_role;