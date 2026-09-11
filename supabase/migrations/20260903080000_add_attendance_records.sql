-- Attendance records for weekly tutoring sessions.
--
-- A coach marks a student present or absent for one concrete session date and
-- can attach a reason (e.g. sakit). Records are kept for one week only: a
-- statement-level trigger prunes anything older on every insert, so the table
-- never grows and no cron job or client-side cleanup is needed.

CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_entry_id UUID REFERENCES public.schedule_entries(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  coach TEXT NOT NULL,
  level TEXT NOT NULL,
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  session_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  reason TEXT,
  note TEXT,
  recorded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- One record per student per session date; re-marking updates in place.
CREATE UNIQUE INDEX IF NOT EXISTS attendance_records_entry_date_key
  ON public.attendance_records (schedule_entry_id, session_date)
  WHERE schedule_entry_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS attendance_records_created_at_idx
  ON public.attendance_records (created_at DESC);

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Matches the access model of the other operational tables in this project.
CREATE POLICY "Allow all access to attendance_records"
  ON public.attendance_records
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Retention: drop anything recorded more than a week ago.
CREATE OR REPLACE FUNCTION public.purge_old_attendance()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.attendance_records
  WHERE created_at < now() - INTERVAL '7 days';
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_purge_old_attendance ON public.attendance_records;
CREATE TRIGGER trg_purge_old_attendance
  AFTER INSERT ON public.attendance_records
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.purge_old_attendance();

-- Live updates for every logged-in coach.
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_records;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
  END;
END $$;

ALTER TABLE public.attendance_records REPLICA IDENTITY FULL;
