import { useMemo, useState } from 'react';
import { CalendarCheck, CalendarX, Trash2, History, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { cn } from '@/lib/utils';
import {
  useAttendance,
  AttendanceRecord,
  ATTENDANCE_RETENTION_DAYS,
} from '@/hooks/useAttendance';
import { formatSessionDate } from '@/lib/sessionDate';

type StatusFilter = 'all' | 'present' | 'absent';

const REASON_STYLES: Record<string, string> = {
  Sakit: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  Izin: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
};

function reasonClass(reason: string): string {
  return (
    REASON_STYLES[reason] ||
    'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700'
  );
}

/**
 * Attendance history, newest first. The list only ever shows the last
 * ATTENDANCE_RETENTION_DAYS days because records are pruned in the database.
 */
export function AttendanceHistoryPanel() {
  const { records, loading, removeRecord } = useAttendance();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  /** Record staged for deletion, pending confirmation. */
  const [pendingDelete, setPendingDelete] = useState<AttendanceRecord | null>(null);

  const stats = useMemo(() => {
    const absent = records.filter((r) => r.status === 'absent').length;
    return {
      total: records.length,
      present: records.length - absent,
      absent,
    };
  }, [records]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((r) => {
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchSearch =
        !query ||
        r.studentName.toLowerCase().includes(query) ||
        r.coach.toLowerCase().includes(query) ||
        (r.reason || '').toLowerCase().includes(query);
      return matchStatus && matchSearch;
    });
  }, [records, statusFilter, search]);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <SummaryTile label="Total Catatan" value={stats.total} tone="neutral" />
        <SummaryTile label="Hadir" value={stats.present} tone="present" />
        <SummaryTile label="Tidak Hadir" value={stats.absent} tone="absent" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama murid, coach, atau alasan"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'present', 'absent'] as StatusFilter[]).map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className="flex-1 sm:flex-initial"
            >
              {s === 'all' ? 'Semua' : s === 'present' ? 'Hadir' : 'Tidak Hadir'}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <History className="h-3.5 w-3.5" />
        Catatan otomatis dihapus setelah {ATTENDANCE_RETENTION_DAYS} hari.
      </p>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={records.length === 0 ? 'Belum Ada Catatan Kehadiran' : 'Tidak Ada Hasil'}
          description={
            records.length === 0
              ? 'Catat kehadiran murid lewat tombol kehadiran pada kartu jadwal.'
              : 'Coba ubah filter atau kata kunci pencarian.'
          }
          className="py-8"
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((record) => (
            <AttendanceRow
              key={record.id}
              record={record}
              onRemove={() => setPendingDelete(record)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => { if (!open) setPendingDelete(null); }}
        onConfirm={() => {
          if (pendingDelete) removeRecord(pendingDelete.id);
          setPendingDelete(null);
        }}
        tone="destructive"
        title="Hapus Catatan Kehadiran?"
        description={
          pendingDelete
            ? `Catatan ${pendingDelete.status === 'absent' ? 'tidak hadir' : 'hadir'} untuk ${pendingDelete.studentName} akan dihapus.`
            : undefined
        }
        confirmLabel="Hapus"
      />
    </div>
  );
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'neutral' | 'present' | 'absent';
}) {
  return (
    <Card className="border shadow-xs">
      <CardContent className="p-3 sm:p-4">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            'text-xl sm:text-2xl font-extrabold mt-1',
            tone === 'present' && 'text-emerald-600 dark:text-emerald-400',
            tone === 'absent' && 'text-rose-600 dark:text-rose-400',
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function AttendanceRow({
  record,
  onRemove,
}: {
  record: AttendanceRecord;
  onRemove: () => void;
}) {
  const isAbsent = record.status === 'absent';

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-3 transition-colors',
        isAbsent
          ? 'border-rose-200/70 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/20'
          : 'border-emerald-200/70 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20',
      )}
    >
      <div
        className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border',
          isAbsent
            ? 'bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
            : 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
        )}
      >
        {isAbsent ? <CalendarX className="h-4 w-4" /> : <CalendarCheck className="h-4 w-4" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-sm text-foreground truncate">
            {record.studentName}
          </p>
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] font-bold uppercase tracking-wider',
              isAbsent
                ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                : 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
            )}
          >
            {isAbsent ? 'Tidak Hadir' : 'Hadir'}
          </Badge>
          {isAbsent && record.reason && (
            <Badge
              variant="outline"
              className={cn('text-[10px] font-bold', reasonClass(record.reason))}
            >
              {record.reason}
            </Badge>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground mt-1">
          {formatSessionDate(record.sessionDate)} - {record.time} - {record.coach}
          {record.level ? ` - ${record.level}` : ''}
        </p>

        {record.note && (
          <p className="text-[11px] text-muted-foreground italic mt-1">
            {record.note}
          </p>
        )}

        {record.recordedBy && (
          <p className="text-[10px] text-muted-foreground/70 mt-1">
            Dicatat oleh {record.recordedBy}
          </p>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        title="Hapus catatan"
        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        onClick={onRemove}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
