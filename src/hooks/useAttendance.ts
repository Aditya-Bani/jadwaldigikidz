import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeRefetch } from './useRealtimeRefetch';

export type AttendanceStatus = 'present' | 'absent';

/** Reasons are fixed options so the history stays readable and filterable. */
export const ABSENCE_REASONS = [
  'Sakit',
  'Izin',
  'Keperluan keluarga',
  'Tanpa keterangan',
  'Lainnya',
] as const;

export type AbsenceReason = (typeof ABSENCE_REASONS)[number];

export interface AttendanceRecord {
  id: string;
  scheduleEntryId: string | null;
  studentName: string;
  coach: string;
  level: string;
  day: string;
  time: string;
  sessionDate: string;
  status: AttendanceStatus;
  reason?: string;
  note?: string;
  recordedBy?: string;
  createdAt: string;
}

interface AttendanceRow {
  id: string;
  schedule_entry_id: string | null;
  student_name: string;
  coach: string;
  level: string;
  day: string;
  time: string;
  session_date: string;
  status: string;
  reason: string | null;
  note: string | null;
  recorded_by: string | null;
  created_at: string;
}

function rowToRecord(row: AttendanceRow): AttendanceRecord {
  return {
    id: row.id,
    scheduleEntryId: row.schedule_entry_id,
    studentName: row.student_name,
    coach: row.coach,
    level: row.level,
    day: row.day,
    time: row.time,
    sessionDate: row.session_date,
    status: row.status === 'absent' ? 'absent' : 'present',
    reason: row.reason || undefined,
    note: row.note || undefined,
    recordedBy: row.recorded_by || undefined,
    createdAt: row.created_at,
  };
}

/** Records older than this are pruned by a database trigger. */
export const ATTENDANCE_RETENTION_DAYS = 7;

export function useAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRecords = useCallback(async () => {
    const cutoff = new Date(
      Date.now() - ATTENDANCE_RETENTION_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching attendance:', error);
      setLoading(false);
      return;
    }

    setRecords(((data as AttendanceRow[]) || []).map(rowToRecord));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useRealtimeRefetch('attendance_records', fetchRecords);

  /**
   * Marks a student present or absent for one session date. Re-marking the same
   * student on the same date updates the existing row instead of adding a
   * second entry, so correcting a mistake does not duplicate history.
   */
  const markAttendance = useCallback(
    async (input: {
      scheduleEntryId: string;
      studentName: string;
      coach: string;
      level: string;
      day: string;
      time: string;
      sessionDate: string;
      status: AttendanceStatus;
      reason?: string;
      note?: string;
      recordedBy?: string;
    }) => {
      const payload = {
        schedule_entry_id: input.scheduleEntryId,
        student_name: input.studentName,
        coach: input.coach,
        level: input.level,
        day: input.day,
        time: input.time,
        session_date: input.sessionDate,
        status: input.status,
        reason: input.status === 'absent' ? input.reason || null : null,
        note: input.note || null,
        recorded_by: input.recordedBy || null,
      };

      const { data: existing } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('schedule_entry_id', input.scheduleEntryId)
        .eq('session_date', input.sessionDate)
        .maybeSingle();

      const { error } = existing
        ? await supabase
            .from('attendance_records')
            .update(payload)
            .eq('id', existing.id)
        : await supabase.from('attendance_records').insert(payload);

      if (error) {
        console.error('Error marking attendance:', error);
        toast({
          title: 'Gagal Menyimpan',
          description: 'Kehadiran tidak dapat disimpan. Coba lagi.',
          variant: 'destructive',
        });
        return false;
      }

      await fetchRecords();
      return true;
    },
    [fetchRecords, toast],
  );

  const removeRecord = useCallback(
    async (id: string) => {
      const { error } = await supabase
        .from('attendance_records')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error removing attendance record:', error);
        toast({
          title: 'Gagal Menghapus',
          description: 'Catatan kehadiran tidak dapat dihapus.',
          variant: 'destructive',
        });
        return;
      }

      await fetchRecords();
    },
    [fetchRecords, toast],
  );

  /** Attendance for one schedule entry on a given date, if already recorded. */
  const getRecordFor = useCallback(
    (scheduleEntryId: string, sessionDate: string) =>
      records.find(
        (r) =>
          r.scheduleEntryId === scheduleEntryId &&
          r.sessionDate === sessionDate,
      ),
    [records],
  );

  return {
    records,
    loading,
    markAttendance,
    removeRecord,
    getRecordFor,
    refetch: fetchRecords,
  };
}
