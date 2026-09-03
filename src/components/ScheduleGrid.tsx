import { useState, useEffect } from 'react';
import { DAYS, TIME_SLOTS, DAY_LABELS, DayOfWeek, TimeSlot, ScheduleEntry } from '@/types/schedule';
import { ScheduleEntryCard } from './ScheduleEntry';
import { EmptyState } from './EmptyState';
import { cn } from '@/lib/utils';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScheduleGridProps {
  getEntriesForCell: (day: DayOfWeek, time: TimeSlot) => ScheduleEntry[];
  onAddEntry: (day: DayOfWeek, time: TimeSlot) => void;
  onEditEntry: (entry: ScheduleEntry) => void;
  onDeleteEntry: (id: string) => void;
  hasActiveFilter?: boolean;
}

// Removed old custom dayColorClasses. Use standard styling in the component instead.

/* ─── DESKTOP GRID VIEW ───────────────────────────────────────────────────── */

function DesktopGrid({ getEntriesForCell, onAddEntry, onEditEntry, onDeleteEntry, hasActiveFilter }: ScheduleGridProps) {
  const JS_DAY_MAP: Record<number, DayOfWeek> = { 1: 'senin', 2: 'selasa', 3: 'rabu', 4: 'kamis', 5: 'jumat', 6: 'sabtu', 0: 'minggu' };
  const todayKey = JS_DAY_MAP[new Date().getDay()];

  // Check if any cell has entries — used to show empty state
  const totalEntries = DAYS.reduce((acc, day) =>
    acc + TIME_SLOTS.reduce((a, time) => a + getEntriesForCell(day, time).length, 0), 0);

  if (hasActiveFilter && totalEntries === 0) {
    return (
      <div className="p-8">
        <EmptyState
          title="Tidak Ada Jadwal Ditemukan"
          description="Tidak ada jadwal yang cocok dengan filter yang aktif. Coba ubah atau hapus filter untuk melihat semua jadwal."
        />
      </div>
    );
  }

  if (totalEntries === 0 && !hasActiveFilter) {
    return (
      <div className="p-8 text-center">
        <EmptyState
          title="Belum Ada Jadwal"
          description="Tambahkan jadwal murid dengan klik tombol + di sel kosong."
          className="py-12"
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1000px]">
        {/* Header Row */}
        <div className="grid grid-cols-8 border-t border-l border-border">
          <div className="day-header bg-muted border-r border-b border-border">
            <span className="text-muted-foreground">Jam</span>
          </div>
          {DAYS.map((day) => (
            <div key={day} className={cn("day-header border-r border-b border-border", day === todayKey ? "bg-primary/10 text-primary font-bold" : "bg-slate-50/50 dark:bg-slate-800/20")}>
              {DAY_LABELS[day]}
            </div>
          ))}
        </div>

        {/* Time Slots */}
        {TIME_SLOTS.map((time) => (
          <div key={time} className="grid grid-cols-8 border-l border-border">
            <div className="time-slot border-r border-b border-border flex items-center justify-center">
              <span className="font-medium">{time}</span>
            </div>
            {DAYS.map((day) => {
              const entries = getEntriesForCell(day, time);
              return (
                <div key={`${day}-${time}`} className={cn("schedule-cell group relative", day === todayKey && "bg-primary/5")}>
                  {entries.map((entry) => (
                    <ScheduleEntryCard
                      key={entry.id}
                      entry={entry}
                      onEdit={onEditEntry}
                      onDelete={onDeleteEntry}
                    />
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                    onClick={() => onAddEntry(day, time)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah
                  </Button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── MOBILE LIST VIEW (per hari) ────────────────────────────────────────── */

function MobileDayView({ day, getEntriesForCell, onAddEntry, onEditEntry, onDeleteEntry }: ScheduleGridProps & { day: DayOfWeek }) {
  const slotsWithEntries = TIME_SLOTS.map((time) => ({
    time,
    entries: getEntriesForCell(day, time),
  }));

  return (
    <div className="divide-y divide-border">
      {slotsWithEntries.map(({ time, entries }) => (
        <div key={time} className="flex gap-3 px-3 py-2">
          {/* Jam */}
          <div className="w-12 shrink-0 flex items-start pt-1">
            <span className="text-xs font-semibold text-muted-foreground">{time}</span>
          </div>
          {/* Konten */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {entries.length > 0 ? (
              entries.map((entry) => (
                <ScheduleEntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={onEditEntry}
                  onDelete={onDeleteEntry}
                />
              ))
            ) : null}
            {/* Tombol tambah hanya ditampilkan jika slot kosong */}
            {entries.length === 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-7 text-xs text-muted-foreground hover:text-primary border border-dashed border-border hover:border-primary/50 transition-colors"
                onClick={() => onAddEntry(day, time)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Tambah
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function MobileView({ getEntriesForCell, onAddEntry, onEditEntry, onDeleteEntry, hasActiveFilter }: ScheduleGridProps) {
  // Map system day (0-6, 0 is Sun) to DAYS index (0-5)
  // 1 (Mon) -> 0, 2 (Tue) -> 1, ..., 6 (Sat) -> 5, 0 (Sun) -> 0
  const getTodayIndex = () => {
    const day = new Date().getDay();
    if (day === 0) return 0; // Sunday to Monday
    return day - 1;
  };

  const [currentDayIndex, setCurrentDayIndex] = useState(getTodayIndex());
  const currentDay = DAYS[currentDayIndex];

  // Hitung total jadwal per hari untuk badge
  const dayCounts = DAYS.map((day) =>
    TIME_SLOTS.reduce((acc, time) => acc + getEntriesForCell(day, time).length, 0)
  );

  const totalEntries = dayCounts.reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Day Selector Header & Quick Tab Pills */}
      <div className="px-3 py-3 border-b border-border bg-slate-50/80 dark:bg-slate-900/50">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            onClick={() => setCurrentDayIndex((i) => Math.max(0, i - 1))}
            disabled={currentDayIndex === 0}
            aria-label="Hari sebelumnya"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <p className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">{DAY_LABELS[currentDay]}</p>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {dayCounts[currentDayIndex]} murid terjadwal
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            onClick={() => setCurrentDayIndex((i) => Math.min(DAYS.length - 1, i + 1))}
            disabled={currentDayIndex === DAYS.length - 1}
            aria-label="Hari berikutnya"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Day Selector Pills */}
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1 pt-1 -mx-1 px-1">
          {DAYS.map((day, i) => {
            const isSelected = i === currentDayIndex;
            const count = dayCounts[i];
            return (
              <button
                key={day}
                onClick={() => setCurrentDayIndex(i)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                )}
              >
                <span>{DAY_LABELS[day].slice(0, 3)}</span>
                {count > 0 && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-extrabold",
                    isSelected ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty state when filter active */}
      {hasActiveFilter && totalEntries === 0 ? (
        <div className="p-6">
          <EmptyState
            title="Tidak Ada Jadwal Ditemukan"
            description="Tidak ada jadwal yang cocok dengan filter aktif. Coba ubah atau hapus filter."
            className="py-8"
          />
        </div>
      ) : (
        /* Day Content */
        <MobileDayView
          day={currentDay}
          getEntriesForCell={getEntriesForCell}
          onAddEntry={onAddEntry}
          onEditEntry={onEditEntry}
          onDeleteEntry={onDeleteEntry}
        />
      )}
    </div>
  );
}

/* ─── ScheduleGrid (responsive wrapper) ─────────────────────────────────── */

export function ScheduleGrid(props: ScheduleGridProps) {
  return (
    <>
      {/* Mobile: tampilan list per hari */}
      <div className="sm:hidden">
        <MobileView {...props} />
      </div>
      {/* Desktop: grid lengkap */}
      <div className="hidden sm:block">
        <DesktopGrid {...props} />
      </div>
    </>
  );
}
