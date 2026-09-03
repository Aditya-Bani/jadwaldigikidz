import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import mascotChild from '@/assets/Mascot Optional CS6-05.png';
import logodk from '@/assets/logodk.png';
import { Calendar, ChevronLeft, ChevronRight, Clock, Info, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSchedule } from '@/hooks/useSchedule';
import { useHolidays } from '@/hooks/useHolidays';
import { DAYS, DAY_LABELS, TIME_SLOTS } from '@/types/schedule';
import type { DayOfWeek } from '@/types/schedule';
import { cn } from '@/lib/utils';

const WEEKDAY_HEADER: DayOfWeek[] = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
const WEEKDAY_SHORT: Record<DayOfWeek, string> = {
  minggu: 'Min', senin: 'Sen', selasa: 'Sel', rabu: 'Rab', kamis: 'Kam', jumat: 'Jum', sabtu: 'Sab'
};

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function CalendarPreviewPage() {
  const { schedule, loading } = useSchedule();
  const { holidays, isHoliday } = useHolidays();

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    today.toISOString().split('T')[0]
  );

  // Build calendar grid for current month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startPad = firstDay.getDay(); // 0=Sun
    const daysInMonth = lastDay.getDate();

    const cells: ({ dateStr: string; day: number } | null)[] = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ dateStr, day: d });
    }
    // Pad to complete last week
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [currentMonth, currentYear]);

  // Map schedule entries by day-of-week for quick lookup
  const scheduleByDay = useMemo(() => {
    const map: Record<string, typeof schedule> = {};
    DAYS.forEach(d => { map[d] = []; });
    schedule.forEach(entry => {
      if (entry.isActive && map[entry.day]) {
        map[entry.day].push(entry);
      }
    });
    // Sort each day by time
    Object.keys(map).forEach(d => {
      map[d].sort((a, b) => a.time.localeCompare(b.time));
    });
    return map;
  }, [schedule]);

  // Get day-of-week for a specific date
  const getDayOfWeek = (dateStr: string): DayOfWeek => {
    const day = new Date(dateStr + 'T00:00:00').getDay();
    return WEEKDAY_HEADER[day];
  };

  // Get schedule for selected date
  const selectedDaySchedule = useMemo(() => {
    if (!selectedDate) return [];
    const dow = getDayOfWeek(selectedDate);
    return scheduleByDay[dow] || [];
  }, [selectedDate, scheduleByDay]);

  const isDatePast = (dateStr: string): boolean => {
    const date = new Date(dateStr + 'T00:00:00');
    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayMid;
  };

  const isToday = (dateStr: string): boolean => {
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return dateStr === todayStr;
  };

  // Count total active students
  const totalActiveStudents = useMemo(() => {
    const names = new Set<string>();
    schedule.forEach(e => { if (e.isActive) names.add(e.studentName); });
    return names.size;
  }, [schedule]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const holidayName = (dateStr: string): string | null => {
    const h = holidays.find(h => h.date === dateStr);
    return h ? h.name : null;
  };

  const hasSchedule = (dateStr: string): boolean => {
    const dow = getDayOfWeek(dateStr);
    return (scheduleByDay[dow]?.length || 0) > 0;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-orange-50 min-h-screen p-4 sm:p-8 font-sans overflow-x-hidden">
      {/* Background blobs */}
      <div className="fixed -z-10 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full top-[-200px] right-[-200px]" />
      <div className="fixed -z-10 w-[500px] h-[500px] bg-accent/5 blur-[100px] rounded-full bottom-[-100px] left-[-100px]" />

      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Header */}
        <div className="lg:col-span-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-border/30">
              <img src={logodk} alt="Digikidz" className="h-8 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">Jadwal Kelas Digikidz</h1>
              <p className="text-sm text-muted-foreground">
                {totalActiveStudents} murid aktif terjadwal mingguan
              </p>
            </div>
          </div>
          <Link to="/">
            <Button variant="outline" className="rounded-full gap-2 border-primary/20 text-primary hover:bg-primary/10">
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>

        {/* Left: Interactive Calendar */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 sm:p-8 flex flex-col border border-white/60 shadow-lg shadow-primary/5">
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {BULAN[currentMonth]} {currentYear}
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={prevMonth}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-border/50 hover:bg-muted transition-colors text-muted-foreground"
                  aria-label="Bulan sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextMonth}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-border/50 hover:bg-muted transition-colors text-muted-foreground"
                  aria-label="Bulan berikutnya"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
              {/* Day headers */}
              {WEEKDAY_HEADER.map((day) => (
                <div key={day} className="text-xs sm:text-sm font-bold text-muted-foreground mb-2 py-1">
                  {WEEKDAY_SHORT[day]}
                </div>
              ))}

              {/* Calendar cells */}
              {calendarDays.map((cell, i) => {
                if (!cell) {
                  return <div key={`empty-${i}`} className="aspect-square" />;
                }

                const isSelected = selectedDate === cell.dateStr;
                const holiday = holidayName(cell.dateStr);
                const isHolidayDay = !!holiday;
                const past = isDatePast(cell.dateStr);
                const todayFlag = isToday(cell.dateStr);
                const hasSched = hasSchedule(cell.dateStr);

                return (
                  <button
                    key={cell.dateStr}
                    onClick={() => setSelectedDate(cell.dateStr)}
                    className={cn(
                      "aspect-square flex flex-col items-center justify-center rounded-lg sm:rounded-xl transition-all cursor-pointer relative overflow-hidden text-sm sm:text-base font-semibold",
                      isSelected
                        ? "bg-primary text-white shadow-lg shadow-primary/30 font-bold scale-[1.05]"
                        : isHolidayDay
                          ? "bg-destructive/5 text-destructive/50 hover:bg-destructive/10"
                          : past
                            ? "text-muted-foreground/30 hover:bg-muted/50"
                            : "bg-white/50 text-foreground hover:bg-white hover:shadow-md border border-transparent hover:border-border/30",
                      todayFlag && !isSelected && "ring-2 ring-primary/30"
                    )}
                  >
                    <span className="relative z-10">{cell.day}</span>
                    {hasSched && !isSelected && !isHolidayDay && (
                      <span className="absolute bottom-1.5 w-1.5 h-1.5 bg-green-600 rounded-full" />
                    )}
                    {isHolidayDay && (
                      <span className="absolute bottom-0.5 text-[7px] sm:text-[8px] uppercase tracking-wider font-bold text-destructive/60 leading-none">
                        Libur
                      </span>
                    )}
                    {todayFlag && !isSelected && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border/20 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-600 rounded-full" /> Ada jadwal
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-destructive/30 rounded-full" /> Hari libur
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 ring-2 ring-primary/30 rounded-full" /> Hari ini
              </div>
            </div>
          </div>

          {/* Holiday info for selected date */}
          {selectedDate && holidayName(selectedDate) && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-destructive shrink-0" />
              <div>
                <p className="text-sm font-bold text-destructive">Hari Libur Nasional</p>
                <p className="text-xs text-destructive/70">{holidayName(selectedDate)}</p>
              </div>
            </div>
          )}

          {/* Mascot Help Banner */}
          <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent overflow-hidden border border-primary/20 relative">
            <div className="max-w-[70%] z-10">
              <h3 className="text-lg font-bold text-primary mb-1 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Butuh Bantuan Penjadwalan?
              </h3>
              <p className="text-sm text-muted-foreground">Hubungi konsultan kami jika kesulitan menemukan slot waktu yang pas.</p>
              <Link to="/parent">
                <Button size="sm" className="mt-3 bg-accent hover:bg-accent/90 text-white rounded-full">
                  Hubungi Konsultan
                </Button>
              </Link>
            </div>
            <div className="absolute -right-6 -bottom-6 w-40 opacity-90 z-0 mix-blend-multiply hidden sm:block">
              <img alt="Digikidz Mascot" src={mascotChild} className="w-full h-auto drop-shadow-2xl" />
            </div>
          </div>
        </div>

        {/* Right: Schedule for selected date */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 sm:p-8 flex flex-col h-full sticky top-8 border border-white/60 shadow-lg shadow-primary/5">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">Jadwal Hari Ini</h3>
              {selectedDate && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-semibold bg-white px-3 py-1.5 rounded-lg border border-border/30 inline-flex">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>
                    {DAY_LABELS[getDayOfWeek(selectedDate)]}, {selectedDate.split('-')[2]} {BULAN[parseInt(selectedDate.split('-')[1]) - 1]} {selectedDate.split('-')[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Loading state */}
            {loading ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-[#004ac6] rounded-full animate-spin" />
              </div>
            ) : selectedDaySchedule.length === 0 ? (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm font-semibold text-muted-foreground">Tidak ada jadwal</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Tidak ada kelas terjadwal pada hari ini.
                </p>
              </div>
            ) : (
              /* Schedule list */
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {selectedDaySchedule.map((entry, idx) => (
                  <div
                    key={`${entry.id}-${idx}`}
                    className={cn(
                      "w-full p-4 rounded-2xl border transition-all",
                      "border-border/40 bg-white/50 hover:bg-white hover:shadow-sm"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-lg font-black text-primary">{entry.time}</span>
                        <span className="text-xs text-muted-foreground">
                          - {parseInt(entry.time) + 1}:00
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {entry.coach}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-foreground">{entry.studentName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{entry.level}</p>
                    {entry.notes && (
                      <p className="text-[11px] text-muted-foreground/70 mt-1 italic">{entry.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            {!loading && selectedDaySchedule.length > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-br from-[#004ac6] to-[#2563eb] rounded-2xl text-white shadow-lg shadow-primary/20">
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">Ringkasan</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-2xl font-black">{selectedDaySchedule.length}</p>
                  <Users className="w-6 h-6 opacity-80" />
                </div>
                <p className="text-sm mt-1 opacity-90">
                  {selectedDaySchedule.length === 1 ? 'murid' : 'murid'} terjadwal hari ini
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
