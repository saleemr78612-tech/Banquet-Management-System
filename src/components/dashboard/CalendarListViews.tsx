import { useNavigate } from "react-router-dom";
import { Badge, bookingStatusTone } from "../ui/Badge";
import { EmptyState } from "../ui/EmptyState";
import type { Booking } from "../../types/booking";
import { formatShortDate } from "../../utils/format";

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

interface ListViewProps {
  bookings: Booking[];
  getCustomerName: (customerId: string) => string;
}

export function WeekView({ anchorDate, bookings, getCustomerName }: ListViewProps & { anchorDate: Date }) {
  const navigate = useNavigate();
  const start = startOfWeek(anchorDate);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="divide-y divide-ink-100/60 dark:divide-ink-600/60">
      {days.map((day) => {
        const dateIso = iso(day);
        const dayBookings = bookings.filter((b) => b.eventDate === dateIso);
        return (
          <div key={dateIso} className="px-5 py-3.5">
            <p className="text-sm font-medium text-ink-700 dark:text-ivory-100 mb-2">
              {day.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}
            </p>
            {dayBookings.length === 0 ? (
              <p className="text-xs text-ink-400">No events</p>
            ) : (
              <div className="space-y-1.5">
                {dayBookings.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => navigate(`/bookings/${b.id}`)}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-ivory-100 dark:hover:bg-ink-600/20"
                  >
                    <span className="text-sm text-ink-700 dark:text-ivory-200">
                      {b.eventType} — {getCustomerName(b.customerId)}
                    </span>
                    <Badge tone={bookingStatusTone(b.status)}>{b.status}</Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function DayView({ anchorDate, bookings, getCustomerName }: ListViewProps & { anchorDate: Date }) {
  const navigate = useNavigate();
  const dateIso = iso(anchorDate);
  const dayBookings = bookings.filter((b) => b.eventDate === dateIso);

  if (dayBookings.length === 0) {
    return <EmptyState title="No events on this day" description={formatShortDate(dateIso)} />;
  }

  return (
    <div className="divide-y divide-ink-100/60 dark:divide-ink-600/60">
      {dayBookings.map((b) => (
        <button
          key={b.id}
          onClick={() => navigate(`/bookings/${b.id}`)}
          className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-ivory-100 dark:hover:bg-ink-600/20"
        >
          <div>
            <p className="text-sm font-medium text-ink-800 dark:text-ivory-100">
              {b.eventType} — {getCustomerName(b.customerId)}
            </p>
            <p className="text-xs text-ink-400">{b.startTime} – {b.endTime} · {b.bookingNumber}</p>
          </div>
          <Badge tone={bookingStatusTone(b.status)}>{b.status}</Badge>
        </button>
      ))}
    </div>
  );
}
