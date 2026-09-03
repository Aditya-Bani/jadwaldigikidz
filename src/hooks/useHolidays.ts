import { useState, useEffect } from 'react';

export interface Holiday {
  date: string;   // YYYY-MM-DD
  name: string;
  isNational: boolean;
}

// ponytail: hardcoded 2026 holidays kept as fallback if fetch fails.
// Upgrade path: move to DB table `holidays` with Supabase CRUD.
const HOLIDAYS_2026: Holiday[] = [
  { date: '2026-01-01', name: 'Tahun Baru', isNational: true },
  { date: '2026-02-08', name: 'Tahun Baru Imlek', isNational: true },
  { date: '2026-02-17', name: 'Isra Mikraj', isNational: true },
  { date: '2026-03-03', name: 'Hari Suci Nyepi', isNational: true },
  { date: '2026-03-20', name: 'Hari Raya Nyepi', isNational: true },
  { date: '2026-03-31', name: 'Wafat Isa Al Masih', isNational: true },
  { date: '2026-04-10', name: 'Idul Fitri 1447 H', isNational: true },
  { date: '2026-04-11', name: 'Idul Fitri 1447 H', isNational: true },
  { date: '2026-05-01', name: 'Hari Buruh', isNational: true },
  { date: '2026-05-21', name: 'Hari Raya Waisak', isNational: true },
  { date: '2026-05-29', name: 'Kenaikan Isa Al Masih', isNational: true },
  { date: '2026-06-01', name: 'Hari Lahir Pancasila', isNational: true },
  { date: '2026-06-17', name: 'Idul Adha 1447 H', isNational: true },
  { date: '2026-07-27', name: 'Tahun Baru Islam 1448 H', isNational: true },
  { date: '2026-08-17', name: 'Hari Kemerdekaan RI', isNational: true },
  { date: '2026-09-05', name: 'Maulid Nabi Muhammad SAW', isNational: true },
  { date: '2026-12-25', name: 'Hari Natal', isNational: true },
];

export function useHolidays() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ponytail: use hardcoded data for now. DB table upgrade path:
    // const { data } = await supabase.from('holidays').select('*');
    setHolidays(HOLIDAYS_2026);
    setLoading(false);
  }, []);

  const isHoliday = (dateStr: string): boolean => {
    return holidays.some(h => h.date === dateStr);
  };

  const getHoliday = (dateStr: string): Holiday | undefined => {
    return holidays.find(h => h.date === dateStr);
  };

  return { holidays, loading, isHoliday, getHoliday };
}
