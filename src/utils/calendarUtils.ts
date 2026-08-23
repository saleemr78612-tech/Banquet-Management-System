export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDaysPure(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Builds a full 6-row (42-cell) month grid including leading/trailing days from adjacent months. */
export function buildMonthGrid(monthDate: Date): Date[] {
  const first = startOfMonth(monthDate);
  const gridStart = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDaysPure(gridStart, i));
}

export function buildWeekGrid(anchorDate: Date): Date[] {
  const start = startOfWeek(anchorDate);
  return Array.from({ length: 7 }, (_, i) => addDaysPure(start, i));
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
