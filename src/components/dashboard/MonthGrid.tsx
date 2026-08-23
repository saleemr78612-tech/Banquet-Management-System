import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Booking } from "../../types/booking";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const statusDot: Record<string, string> = {
  Confirmed: "bg-maroon-500",
  Pending: "bg-warning-500",
  Completed: "bg-success-500",
  Cancelled: "bg-danger-500",
};

interface MonthGridProps {
  year: number;
  month: number; // 0-indexed
  bookings: Booking[];
}

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function MonthGrid({ year, month, bookings }: MonthGridProps) {
  const navigate = useNavigate();

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach((b) => {
      const list = map.get(b.eventDate) ?? [];
      list.push(b);
      map.set(b.eventDate, list);
    });
    return map;
  }, [bookings]);

  const cells = useMemo(() => {
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

    const result: { date: Date | null }[] = [];
    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startWeekday + 1;
      if (dayNum < 1 || dayNum > daysInMonth) {
        result.push({ date: null });
      } else {
        result.push({ date: new Date(year, month, dayNum) });
      }
    }
    return result;
  }, [year, month]);

  const todayIso = iso(new Date());

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-ink-100 dark:border-ink-600">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-2 py-2 text-center text-xs font-medium text-ink-400">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          if (!cell.date) {
            return <div key={i} className="min-h-[92px] border-b border-r border-ink-100/60 dark:border-ink-600/60 bg-ivory-100/50 dark:bg-ink-900/30" />;
          }
          const dateIso = iso(cell.date);
          const dayBookings = bookingsByDate.get(dateIso) ?? [];
          const isToday = dateIso === todayIso;
          return (
            <div
              key={i}
              className={`min-h-[92px] border-b border-r border-ink-100/60 dark:border-ink-600/60 p-1.5 ${
                isToday ? "bg-maroon-50 dark:bg-maroon-400/10" : ""
              }`}
            >
              <p className={`text-xs mb-1 ${isToday ? "font-bold text-maroon-500" : "text-ink-400"}`}>
                {cell.date.getDate()}
              </p>
              <div className="space-y-0.5">
                {dayBookings.slice(0, 3).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => navigate(`/bookings/${b.id}`)}
                    className="w-full flex items-center gap-1 rounded px-1 py-0.5 text-left text-[10px] leading-tight hover:bg-ivory-200 dark:hover:bg-ink-600/40 truncate"
                    title={`${b.eventType} — ${b.bookingNumber}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusDot[b.status]}`} />
                    <span className="truncate text-ink-600 dark:text-ivory-200">{b.eventType}</span>
                  </button>
                ))}
                {dayBookings.length > 3 && (
                  <p className="text-[10px] text-ink-400 px-1">+{dayBookings.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
