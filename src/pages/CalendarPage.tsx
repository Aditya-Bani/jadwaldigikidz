import { useState, useCallback } from 'react';
import { LiveDateTime } from '@/components/LiveDateTime';

import { useSchedule } from '@/hooks/useSchedule';
import { ScheduleGrid } from '@/components/ScheduleGrid';
import { ScheduleDialog } from '@/components/ScheduleDialog';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { ScheduleEntry, DayOfWeek, TimeSlot, Coach, COACHES } from '@/types/schedule';
import { X, Eye, EyeOff, User, GraduationCap, Plus, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { getDisplayName } from '@/lib/displayNames';

export default function CalendarPage() {
  const { schedule, loading: scheduleLoading, addEntry, updateEntry, deleteEntry, getEntriesForCell } = useSchedule();
  const { user } = useAuth();
  const { toast } = useToast();
  const displayedCoachName = user?.user_metadata?.full_name || getDisplayName(user?.email || '') || 'Coach';

  const [filterCoach, setFilterCoach] = useState<Coach | 'all'>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<boolean>(true);

  const filteredGetEntriesForCell = useCallback(
    (day: DayOfWeek, time: TimeSlot) => {
      return getEntriesForCell(day, time).filter((entry) => {
        const matchCoach = filterCoach === 'all' || entry.coach === filterCoach;
        const matchLevel =
          filterLevel === 'all' ||
          (filterLevel === 'Little Creator' && entry.level.startsWith('Little Creator')) ||
          (filterLevel === 'Junior' && entry.level.startsWith('Junior')) ||
          (filterLevel === 'Teenager' && entry.level.startsWith('Teenager'));
        const matchActive = !filterActive || entry.isActive;
        return matchCoach && matchLevel && matchActive;
      });
    },
    [getEntriesForCell, filterCoach, filterLevel, filterActive]
  );

  const hasActiveFilter = filterCoach !== 'all' || filterLevel !== 'all' || !filterActive;

  const clearFilters = () => {
    setFilterCoach('all');
    setFilterLevel('all');
    setFilterActive(true);
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const [defaultDay, setDefaultDay] = useState<DayOfWeek>('senin');
  const [defaultTime, setDefaultTime] = useState<TimeSlot>('08:00');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<ScheduleEntry | null>(null);

  const handleAddClick = (day: DayOfWeek, time: TimeSlot) => {
    setEditingEntry(null);
    setDefaultDay(day);
    setDefaultTime(time);
    setDialogOpen(true);
  };

  const handleEditClick = (entry: ScheduleEntry) => {
    const existing = schedule.find(e => e.id === entry.id);
    if (existing && existing.isActive !== entry.isActive) {
      updateEntry(entry.id, { isActive: entry.isActive, updatedBy: displayedCoachName });
      toast({
        title: entry.isActive ? 'Murid Diaktifkan' : 'Murid Dinonaktifkan',
        description: `${entry.studentName} kini berstatus ${entry.isActive ? 'Aktif' : 'Nonaktif'}.`,
      });
      return;
    }
    setEditingEntry(entry);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    const entry = schedule.find((e) => e.id === id);
    if (entry) {
      setDeletingEntry(entry);
      setDeleteDialogOpen(true);
    }
  };

  const handleSave = (data: Omit<ScheduleEntry, 'id'>) => {
    const adminName = displayedCoachName;
    const auditData = { ...data, updatedBy: adminName };
    if (editingEntry) {
      updateEntry(editingEntry.id, auditData);
      toast({ title: 'Berhasil!', description: `Jadwal ${data.studentName} berhasil diperbarui oleh ${adminName}.` });
    } else {
      addEntry(auditData);
      toast({ title: 'Berhasil!', description: `Jadwal ${data.studentName} berhasil ditambahkan oleh ${adminName}.` });
    }
  };

  const handleConfirmDelete = () => {
    if (deletingEntry) {
      deleteEntry(deletingEntry.id);
      toast({ title: 'Dihapus', description: `Jadwal ${deletingEntry.studentName} berhasil dihapus.`, variant: 'destructive' });
      setDeletingEntry(null);
    }
  };

  return (
    <>
      {/* ── Modern Header ── */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 p-5 sm:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        {/* Left: title + live time */}
        <div className="flex items-center gap-4 z-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Jadwal Mingguan
              </h1>
              <Badge variant="outline" className="text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                Interactive Grid
              </Badge>
            </div>
            <div className="mt-1">
              <LiveDateTime />
            </div>
          </div>
        </div>

        {/* Right: filters + add button */}
        <div className="flex flex-wrap items-stretch sm:items-center gap-2 sm:gap-2.5 w-full xl:w-auto z-10">
          {/* Coach filter */}
          <div className="flex-1 sm:flex-initial flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs min-w-[120px]">
            <User className="w-4 h-4 text-slate-500 shrink-0" />
            <Select value={filterCoach} onValueChange={(v) => setFilterCoach(v as Coach | 'all')}>
              <SelectTrigger className="border-none bg-transparent shadow-none focus:ring-0 h-auto p-0 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 w-full sm:min-w-[95px]">
                <SelectValue placeholder="Coach" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">Semua Coach</SelectItem>
                {COACHES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Level filter */}
          <div className="flex-1 sm:flex-initial flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs min-w-[120px]">
            <GraduationCap className="w-4 h-4 text-slate-500 shrink-0" />
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="border-none bg-transparent shadow-none focus:ring-0 h-auto p-0 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 w-full sm:min-w-[95px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">Semua Level</SelectItem>
                <SelectItem value="Little Creator">Little Creator</SelectItem>
                <SelectItem value="Junior">Junior</SelectItem>
                <SelectItem value="Teenager">Teenager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active filter */}
          <div className="flex-1 sm:flex-initial flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs min-w-[140px]">
            {filterActive
              ? <EyeOff className="h-4 w-4 text-slate-500 shrink-0" />
              : <Eye className="h-4 w-4 text-blue-600 shrink-0" />
            }
            <Select value={filterActive ? 'active' : 'all'} onValueChange={(v) => setFilterActive(v === 'active')}>
              <SelectTrigger className="border-none bg-transparent shadow-none focus:ring-0 h-auto p-0 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 w-full sm:min-w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="active">Sembunyikan Nonaktif</SelectItem>
                <SelectItem value="all">Tampilkan Semua</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear filter */}
          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              title="Reset filter"
              className="rounded-xl px-2.5 py-1.5 flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-400 transition-colors shrink-0 border border-rose-200 dark:border-rose-800"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Add Button */}
          <Button
            onClick={() => {
              setEditingEntry(null);
              setDefaultDay('senin');
              setDefaultTime('08:00');
              setDialogOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal</span>
          </Button>
        </div>
      </div>

      {/* ── Schedule Grid ── */}
      {scheduleLoading ? (
        <div className="ai-card p-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl mb-3" />
          ))}
        </div>
      ) : (
        <div className="ai-card overflow-hidden">
          <ScheduleGrid
            getEntriesForCell={filteredGetEntriesForCell}
            onAddEntry={handleAddClick}
            onEditEntry={handleEditClick}
            onDeleteEntry={handleDeleteClick}
            hasActiveFilter={hasActiveFilter}
          />
        </div>
      )}

      {/* ── Clean Legend ── */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 sm:gap-6 p-4 rounded-2xl ai-card text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
            Coach:
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/20" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Mr. Bani</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-500/20" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Mr. Argy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/20" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Ms. Zaura</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mr-1">
            Level:
          </span>
          <span className="font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 text-[11px]">
            Little Creator
          </span>
          <span className="font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800 text-[11px]">
            Junior
          </span>
          <span className="font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 text-[11px]">
            Teenager
          </span>
        </div>
      </div>

      <ScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        entry={editingEntry}
        defaultDay={defaultDay}
        defaultTime={defaultTime}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        studentName={deletingEntry?.studentName}
      />
    </>
  );
}
