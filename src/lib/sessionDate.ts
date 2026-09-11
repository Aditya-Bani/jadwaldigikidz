import { DayOfWeek } from '@/types/schedule';

/** JS getDay() index for each schedule day (0 = Sunday). */
export const DAY_TO_JS_INDEX: Record<DayOfWeek, number> = {
  senin: 1,
  selasa: 2,
  rabu: 3,
  kamis: 4,
  jumat: 5,
  sabtu: 6,
  minggu: 0,
};

/** Local date as YYYY-MM-DD, without the UTC shift toISOString() would apply. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * The occurrence of `day` inside the current Monday-to-Sunday week.
 *
 * Deliberately not "the next upcoming occurrence": a coach often records
 * attendance after the session, so a day that already passed this week must
 * still resolve to that past date rather than jumping a week ahead.
 */
export function sessionDateForDay(day: DayOfWeek, reference = new Date()): string {
  const todayIndex = reference.getDay();
  const daysSinceMonday = (todayIndex + 6) % 7;
  const monday = new Date(reference);
  monday.setDate(reference.getDate() - daysSinceMonday);

  const targetOffset = (DAY_TO_JS_INDEX[day] + 6) % 7;
  const target = new Date(monday);
  target.setDate(monday.getDate() + targetOffset);

  return toDateKey(target);
}

/** Human label for a YYYY-MM-DD key, e.g. "Jum, 05 Sep 2026". */
export function formatSessionDate(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
