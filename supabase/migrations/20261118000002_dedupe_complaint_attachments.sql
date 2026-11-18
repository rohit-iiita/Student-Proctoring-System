-- Ensure one complaint_attachments row per stored file.
--
-- The storage trigger and the complaint service were both inserting rows,
-- producing duplicates with the same file_path. The service insert has been
-- removed; this migration cleans up existing duplicates and prevents new ones.

-- 1. Remove duplicate rows, keeping the earliest insert per file_path
DELETE FROM public.complaint_attachments a
USING public.complaint_attachments b
WHERE a.file_path = b.file_path
  AND a.created_at > b.created_at;

-- 2. Enforce one row per storage path going forward
ALTER TABLE public.complaint_attachments
  ADD CONSTRAINT complaint_attachments_file_path_unique UNIQUE (file_path);
