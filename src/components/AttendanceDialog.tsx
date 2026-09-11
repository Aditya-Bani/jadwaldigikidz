import { useEffect, useState } from 'react';
import { CalendarCheck, CalendarX } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ScheduleEntry } from '@/types/schedule';
import {
  ABSENCE_REASONS,
  AttendanceStatus,
} from '@/hooks/useAttendance';
import { formatSessionDate, sessionDateForDay } from '@/lib/sessionDate';

interface AttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: ScheduleEntry | null;
  onSubmit: (data: {
    status: AttendanceStatus;
    reason?: string;
    note?: string;
    sessionDate: string;
  }) => void;
}

export function AttendanceDialog({
  open,
  onOpenChange,
  entry,
  onSubmit,
}: AttendanceDialogProps) {
  const [status, setStatus] = useState<AttendanceStatus>('present');
  const [reason, setReason] = useState<string>(ABSENCE_REASONS[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const sessionDate = entry ? sessionDateForDay(entry.day) : '';

  useEffect(() => {
    if (open) {
      setStatus('present');
      setReason(ABSENCE_REASONS[0]);
      setNote('');
      setError('');
    }
  }, [open]);

  if (!entry) return null;

  const handleSubmit = () => {
    if (status === 'absent' && !reason) {
      setError('Alasan wajib dipilih untuk murid yang tidak hadir');
      return;
    }
    onSubmit({
      status,
      reason: status === 'absent' ? reason : undefined,
      note: note.trim() || undefined,
      sessionDate,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Kehadiran Murid</DialogTitle>
          <DialogDescription>
            <span className="font-semibold text-foreground">{entry.studentName}</span>
            {' - '}
            {entry.coach}
            {' - '}
            {formatSessionDate(sessionDate)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setStatus('present')}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all text-sm font-bold',
                status === 'present'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted/60',
              )}
            >
              <CalendarCheck className="h-5 w-5" />
              Hadir
            </button>
            <button
              type="button"
              onClick={() => setStatus('absent')}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all text-sm font-bold',
                status === 'absent'
                  ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted/60',
              )}
            >
              <CalendarX className="h-5 w-5" />
              Tidak Hadir
            </button>
          </div>

          {/* Reason — only relevant when absent */}
          {status === 'absent' && (
            <div className="space-y-2">
              <Label htmlFor="absence-reason" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Alasan
              </Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="absence-reason">
                  <SelectValue placeholder="Pilih alasan" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  {ABSENCE_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="absence-note" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Keterangan tambahan
            </Label>
            <Textarea
              id="absence-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Opsional, misalnya: sudah konfirmasi lewat WhatsApp"
              maxLength={200}
              rows={2}
              className="resize-none"
            />
          </div>

          {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
