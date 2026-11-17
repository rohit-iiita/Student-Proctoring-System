-- Create bucket for complaint attachments if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-attachments', 'complaint-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Trigger to automatically create complaint_attachments from storage.objects
CREATE OR REPLACE FUNCTION public.handle_storage_attachment_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_complaint_id UUID;
  v_file_name TEXT;
  v_file_type TEXT;
  v_file_size BIGINT;
  v_owner UUID;
BEGIN
  -- Only process uploads into 'complaint-attachments'
  IF NEW.bucket_id = 'complaint-attachments' THEN
    -- Expect name format: "<complaint_id>/<file_name>"
    BEGIN
      v_complaint_id := split_part(NEW.name, '/', 1)::UUID;
    EXCEPTION WHEN OTHERS THEN
      v_complaint_id := NULL;
    END;

    IF v_complaint_id IS NOT NULL THEN
      v_file_name := split_part(NEW.name, '/', 2);
      v_file_type := COALESCE(NEW.metadata->>'mimetype', 'application/octet-stream');
      v_file_size := COALESCE((NEW.metadata->>'size')::BIGINT, 1);
      v_owner := NEW.owner;

      -- If owner not set, fallback to student of complaint
      IF v_owner IS NULL THEN
        SELECT student_id INTO v_owner FROM public.complaints WHERE id = v_complaint_id;
      END IF;

      IF v_owner IS NOT NULL THEN
        INSERT INTO public.complaint_attachments (
          complaint_id,
          uploaded_by,
          file_path,
          file_type,
          file_size
        )
        VALUES (
          v_complaint_id,
          v_owner,
          NEW.name,
          v_file_type,
          v_file_size
        )
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_storage_complaint_attachment ON storage.objects;
CREATE TRIGGER trg_storage_complaint_attachment
AFTER INSERT ON storage.objects
FOR EACH ROW
EXECUTE FUNCTION public.handle_storage_attachment_created();
