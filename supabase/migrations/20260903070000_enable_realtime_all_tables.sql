-- Enable Supabase Realtime for all collaborative tables.
-- Previously only schedule_entries was published, so admin changes to
-- reports, certificates, banners, notifications and access codes required
-- a manual page refresh to show up for other logged-in coaches.
--
-- Idempotent: re-running is safe.

DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'schedule_entries',
    'activity_reports',
    'student_access_codes',
    'student_certificates',
    'holiday_banners',
    'admin_notifications',
    'programs'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl) THEN
      BEGIN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
      EXCEPTION
        WHEN duplicate_object THEN NULL;  -- already published
        WHEN undefined_object THEN NULL;  -- publication missing
      END;

      -- Ensure DELETE events carry enough row data for clients.
      EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', tbl);
    END IF;
  END LOOP;
END $$;
