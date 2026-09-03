import { useMemo, useState } from 'react';
import { useSchedule } from '@/hooks/useSchedule';
import { useAuth } from '@/hooks/useAuth';
import { getDisplayName } from '@/lib/displayNames';
import { Link, useNavigate } from 'react-router-dom';
import { DayOfWeek, DAY_LABELS } from '@/types/schedule';
import { LiveDateTime } from '@/components/LiveDateTime';
import { 
  Sparkles, 
  CalendarDays, 
  FileText, 
  Users, 
  ArrowRight, 
  Search, 
  Clock, 
  GraduationCap, 
  Layers, 
  Activity,
  ArrowUpRight,
  UserCheck,
  CalendarCheck2,
  CalendarX2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Map JS getDay() (0=Sun, 1=Mon, ...) ke DayOfWeek
const JS_DAY_TO_SCHEDULE: Record<number, DayOfWeek> = {
  1: 'senin',
  2: 'selasa',
  3: 'rabu',
  4: 'kamis',
  5: 'jumat',
  6: 'sabtu',
  0: 'minggu',
};

const COACH_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Mr. Bani':  { bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-500' },
  'Mr. Argy':  { bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-500' },
  'Ms. Zaura': { bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-500' },
  'Ms. Nay':   { bg: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-500' },
  'Ms. Nurul': { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-500' },
};

function getLevelBadgeClass(level: string) {
  if (level.startsWith('Little Creator')) return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
  if (level.startsWith('Junior')) return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800';
  return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
}

const Index = () => {
  const { schedule, loading } = useSchedule();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const displayedCoachName = user?.user_metadata?.full_name || getDisplayName(user?.email || '') || 'Coach';

  const activeStudents = useMemo(() => schedule.filter(s => s.isActive).length, [schedule]);

  const levelDistribution = useMemo(() => {
    let littleCreator = 0, junior = 0, teenager = 0;
    schedule.forEach(s => {
      if (s.level.startsWith('Little Creator')) littleCreator++;
      if (s.level.startsWith('Junior')) junior++;
      if (s.level.startsWith('Teenager')) teenager++;
    });
    const total = littleCreator + junior + teenager || 1;
    return {
      littleCreatorCount: littleCreator,
      juniorCount: junior,
      teenagerCount: teenager,
      littleCreator: (littleCreator / total) * 100,
      junior: (junior / total) * 100,
      teenager: (teenager / total) * 100
    };
  }, [schedule]);

  // ── Agenda Hari Ini ──
  const todayKey = JS_DAY_TO_SCHEDULE[new Date().getDay()];
  const todayLabel = DAY_LABELS[todayKey];

  const todayStudents = useMemo(() => {
    return schedule
      .filter(s => s.day === todayKey && s.isActive && s.status === 'active')
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [schedule, todayKey]);

  const filteredTodayStudents = useMemo(() => {
    if (!searchTerm.trim()) return todayStudents;
    const term = searchTerm.toLowerCase();
    return todayStudents.filter(s => 
      s.studentName.toLowerCase().includes(term) ||
      s.coach.toLowerCase().includes(term) ||
      s.level.toLowerCase().includes(term) ||
      s.time.includes(term)
    );
  }, [todayStudents, searchTerm]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── AI Command Center Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 shadow-md border border-blue-500/30">
        {/* Ambient glow orbs */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 h-48 w-48 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-blue-100 border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                Learning Management Suite
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-medium text-blue-200 border border-white/10">
                <Activity className="w-3 h-3 text-emerald-300" />
                Live Hub
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              Selamat Bertugas,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-white to-indigo-100">
                {displayedCoachName}
              </span>
            </h1>

            <p className="text-blue-100/90 text-xs sm:text-sm font-medium leading-relaxed max-w-md">
              Pantau jadwal belajar terpadu, update perkembangan murid, dan kelola laporan aktivitas secara real-time.
            </p>

            <div className="pt-2 flex flex-wrap gap-2.5">
              <Link
                to="/reports"
                className="inline-flex items-center gap-2 bg-white text-blue-900 hover:bg-blue-50 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 no-underline"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Tulis Activity Report</span>
              </Link>
              <Link
                to="/kalender"
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/25 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold backdrop-blur-md transition-all active:scale-95 no-underline"
              >
                <CalendarDays className="w-4 h-4" />
                <span>Lihat Jadwal Lengkap</span>
              </Link>
            </div>
          </div>

          {/* Right Mascot Visual */}
          <div className="relative shrink-0 hidden sm:flex justify-end pr-4">
            <div className="w-36 md:w-44 h-auto">
              <img
                alt="Digikidz Mascot"
                className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeoUy-VYNz48-vUSNO6KGS01ekOfzl4sTt57LpQfDbbeyBtx0zG6tcQ9Oyg08p1lE1AlSLLEE3n5k9PVot-GW3Wethqz-z9eS7SWJD-pwJ7rZGUPvPvdfoc4-eE_F6Z3zwy-6gCF2U4kFSDUAjX0Z2FzcU0fQEU6ZW-moOEla5GIt5eV0dDEuYSFEMDXAl81M8K-uTT9XZxFJJvbpwx6HoPQCw310evRQnTkzofMF2HV259BTzOyLpMjmat5WUvh8rtoQBp3d8bFQ"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Intelligence Bento Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Active Students */}
        <div className="ai-card p-5 flex flex-col justify-between animate-scale-in" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <Badge variant="outline" className="text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
              Active Status
            </Badge>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Murid Aktif
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                {activeStudents}
              </span>
              <span className="text-xs font-medium text-slate-500">terdaftar</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Siap belajar
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {Math.round((activeStudents / (schedule.length || 1)) * 100)}% Rasio Aktif
            </span>
          </div>
        </div>

        {/* Card 2: Total Sesi Kelas */}
        <div className="ai-card p-5 flex flex-col justify-between animate-scale-in" style={{ animationDelay: '80ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center">
              <CalendarCheck2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <Badge variant="outline" className="text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
              Total Enrolled
            </Badge>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Sesi Terjadwal
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                {schedule.length}
              </span>
              <span className="text-xs font-medium text-slate-500">slot sesi</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Slot reguler & trial
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Mingguan
            </span>
          </div>
        </div>

        {/* Card 3: Level Ratio Distribution */}
        <div className="ai-card p-5 flex flex-col justify-between sm:col-span-2 lg:col-span-1 animate-scale-in" style={{ animationDelay: '160ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center">
              <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <Badge variant="outline" className="text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
              Distribusi Level
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Rasio Tingkat Kelas</span>
              <span className="text-slate-400">{schedule.length} Total</span>
            </div>
            {/* Multi-segmented Progress Bar */}
            <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 gap-1 p-0.5">
              <div 
                style={{ width: `${levelDistribution.littleCreator}%` }} 
                className="bg-purple-600 rounded-full transition-all duration-500" 
                title={`Little Creator: ${levelDistribution.littleCreatorCount}`}
              />
              <div 
                style={{ width: `${levelDistribution.junior}%` }} 
                className="bg-sky-600 rounded-full transition-all duration-500" 
                title={`Junior: ${levelDistribution.juniorCount}`}
              />
              <div 
                style={{ width: `${levelDistribution.teenager}%` }} 
                className="bg-amber-600 rounded-full transition-all duration-500" 
                title={`Teenager: ${levelDistribution.teenagerCount}`}
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-medium text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-600" />
              <span>LC ({levelDistribution.littleCreatorCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-sky-600" />
              <span>Junior ({levelDistribution.juniorCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-600" />
              <span>Teen ({levelDistribution.teenagerCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Section: Agenda Hari Ini + Quick Hub ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Agenda Hari Ini (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Agenda Kelas Hari {todayLabel}
                </h2>
                <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs">
                  {todayStudents.length} Sesi
                </Badge>
              </div>
              <div className="mt-1">
                <LiveDateTime />
              </div>
            </div>

            {/* Quick search input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Cari murid / coach..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>
          </div>

          {/* Agenda Table Container */}
          <div className="ai-card overflow-hidden">
            {/* Header row */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-2">Waktu</div>
              <div className="col-span-4">Nama Murid</div>
              <div className="col-span-3">Level</div>
              <div className="col-span-3 text-right">Aksi</div>
            </div>

            {/* Content List */}
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredTodayStudents.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {filteredTodayStudents.map((entry) => {
                  const coachInfo = COACH_COLORS[entry.coach] ?? { 
                    bg: 'bg-slate-50 text-slate-700 border-slate-200', 
                    text: 'text-slate-700', 
                    border: 'border-slate-400' 
                  };

                  return (
                    <div
                      key={entry.id}
                      className="p-4 sm:px-5 flex flex-col md:grid md:grid-cols-12 gap-3 md:items-center hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors"
                    >
                      {/* Jam */}
                      <div className="md:col-span-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                          <Clock className="w-3 h-3 text-blue-600" />
                          {entry.time}
                        </span>
                      </div>

                      {/* Murid & Coach */}
                      <div className="md:col-span-4 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border ${coachInfo.bg} flex-shrink-0`}>
                          {entry.studentName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {entry.studentName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] font-medium text-slate-500">Coach:</span>
                            <span className={`text-[11px] font-bold ${coachInfo.text}`}>
                              {entry.coach}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Level */}
                      <div className="md:col-span-3 flex items-center">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold border ${getLevelBadgeClass(entry.level)}`}>
                          {entry.level}
                        </span>
                      </div>

                      {/* Action */}
                      <div className="md:col-span-3 flex items-center justify-end">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/reports?student=${encodeURIComponent(entry.studentName)}`)}
                          className="w-full md:w-auto h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Tulis Report</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <CalendarX2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {searchTerm ? 'Tidak ada murid yang cocok dengan pencarian' : `Tidak ada jadwal kelas untuk hari ${todayLabel}`}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {searchTerm ? 'Coba ubah kata kunci pencarian.' : 'Lihat jadwal mingguan lengkap di menu Jadwal.'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/kalender')}
                  className="rounded-xl text-xs font-semibold mt-2"
                >
                  Buka Halaman Jadwal
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Command Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Quick Hub
          </h2>

          <div className="space-y-3">
            {/* Action 1: Manage Schedule */}
            <Link
              to="/kalender"
              className="group block p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 no-underline card-hover"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-sm tracking-tight">Kelola Jadwal</h3>
              <p className="text-xs text-blue-100/90 mt-1 leading-relaxed">
                Atur jadwal murid, penempatan coach, sesi trial, dan jam mengajar.
              </p>
            </Link>

            {/* Action 2: Activity Reports */}
            <Link
              to="/reports"
              className="group block p-4 rounded-2xl ai-card hover:border-blue-300 dark:hover:border-blue-700 hover:-translate-y-0.5 no-underline card-hover"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">
                Activity Reports
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Tulis modul pembelajaran mingguan dan bagikan report ke orang tua.
              </p>
            </Link>

            {/* Action 3: Sertifikat Murid */}
            <Link
              to="/sertifikat"
              className="group block p-4 rounded-2xl ai-card hover:border-blue-300 dark:hover:border-blue-700 hover:-translate-y-0.5 no-underline card-hover"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/50 flex items-center justify-center mb-3">
                  <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">
                Sertifikat Kelulusan
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Terbitkan sertifikat kelulusan level untuk murid yang telah menyelesaikan modul.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

