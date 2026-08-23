import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, Users } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge, bookingStatusTone } from "../components/ui/Badge";
import { useData } from "../context/DataContext";
import { buildMonthGrid, buildWeekGrid, isSameDay, addDaysPure } from "../utils/calendarUtils";
import { cn } from "../utils/cn";
import { WEEKDAY_LABELS_FULL } from "../types/pricing";
import { gregorianToHijri, formatHijri } from "../utils/hijri";

type ViewMode = "month" | "week" | "day";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const { bookings, getCustomerById } = useData();
  const navigate = useNavigate();
  const [view, setView] = useState<ViewMode>("month");
  const [anchor, setAnchor] = useState(new Date());

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, typeof bookings>();
    bookings.forEach((b) => {
      const key = b.eventDate;
      const list = map.get(key) ?? [];
      list.push(b);
      map.set(key, list);
    });
    return map;
  }, [bookings]);

  const goPrev = () => {
    if (view === "month") setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1));
    else if (view === "week") setAnchor(addDaysPure(anchor, -7));
    else setAnchor(addDaysPure(anchor, -1));
  };

  const goNext = () => {
    if (view === "month") setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1));
    else if (view === "week") setAnchor(addDaysPure(anchor, 7));
    else setAnchor(addDaysPure(anchor, 1));
  };

  const goToday = () => setAnchor(new Date());

  const headerLabel = useMemo(() => {
    if (view === "month") {
      return anchor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    }
    if (view === "week") {
      const week = buildWeekGrid(anchor);
      const start = week[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      const end = week[6].toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      return `${start} – ${end}`;
    }
    return anchor.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [anchor, view]);

  const today = new Date();

  const renderDayCell = (date: Date, muted: boolean) => {
    const key = date.toISOString().slice(0, 10);
    const dayBookings = bookingsByDate.get(key) ?? [];
    const activeBookings = dayBookings.filter((b) => b.status !== "Cancelled");
    const isBooked = activeBookings.length > 0;
    const isToday = isSameDay(date, today);
    const hijri = gregorianToHijri(date);

    return (
      <div
        key={key}
        className={cn(
          "group relative min-h-[92px] border-r border-b border-ink-100 dark:border-ink-600 p-1.5 last:border-r-0 transition-colors",
          muted
            ? "bg-ivory-100/60 dark:bg-ink-900/40"
            : isBooked
            ? "bg-success-100/70 dark:bg-success-500/10 hover:bg-success-100 dark:hover:bg-success-500/20 cursor-pointer"
            : "bg-danger-100/60 dark:bg-danger-500/10"
        )}
      >
        <div className="flex items-baseline gap-1.5">
          <span
            className={cn(
              "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
              isToday
                ? "bg-maroon-500 text-ivory-50"
                : muted
                ? "text-ink-300 dark:text-ink-600"
                : "text-ink-700 dark:text-ivory-100"
            )}
          >
            {date.getDate()}
          </span>
          <span className={cn("text-[10px] font-medium", muted ? "text-ink-300 dark:text-ink-600" : "text-ink-500 dark:text-ivory-300")}>
            {WEEKDAY_LABELS[date.getDay()]}
          </span>
        </div>
        <p className={cn("mt-0.5 text-[10px] leading-tight", muted ? "text-ink-300 dark:text-ink-700" : "text-ink-400")}>
          {hijri.day} {hijri.monthName.slice(0, 3)}
        </p>

        {!muted && (
          <p
            className={cn(
              "mt-1.5 text-[10px] font-medium",
              isBooked ? "text-success-600 dark:text-success-500" : "text-danger-600 dark:text-danger-500"
            )}
          >
            {isBooked ? `Booked (${activeBookings.length})` : "Available"}
          </p>
        )}

        {/* Hover detail popover — booked days only */}
        {!muted && isBooked && (
          <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-1 w-64 -translate-x-1/2 scale-95 rounded-xl border border-ink-100 dark:border-ink-600 bg-white dark:bg-ink-800 p-3 opacity-0 shadow-card-hover transition-all duration-150 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
            <p className="mb-2 text-xs font-semibold text-ink-700 dark:text-ivory-100">
              {date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · {formatHijri(date)}
            </p>
            <div className="space-y-2">
              {activeBookings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => navigate(`/bookings/${b.id}`)}
                  className="w-full rounded-lg border border-ink-100 dark:border-ink-600 px-2.5 py-2 text-left hover:bg-ivory-100 dark:hover:bg-ink-600/30"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-ink-800 dark:text-ivory-100 truncate">
                      {b.eventType} — {getCustomerById(b.customerId)?.fullName ?? "Customer"}
                    </span>
                    <Badge tone={bookingStatusTone(b.status)} className="shrink-0">
                      {b.status}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-ink-400">
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {b.startTime}–{b.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={10} /> {b.guests}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-800 dark:text-ivory-100">Calendar</h2>
          <p className="text-sm text-ink-400">{headerLabel}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-lg border border-ink-100 dark:border-ink-600 overflow-hidden">
            {(["month", "week", "day"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  view === v
                    ? "bg-maroon-500 text-ivory-50"
                    : "text-ink-600 dark:text-ivory-300 hover:bg-ivory-200 dark:hover:bg-ink-600"
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={goToday}>
            <CalendarDays size={14} /> Today
          </Button>
          <div className="flex items-center gap-1">
            <button onClick={goPrev} className="rounded-lg p-1.5 text-ink-500 hover:bg-ivory-200 dark:hover:bg-ink-600">
              <ChevronLeft size={16} />
            </button>
            <button onClick={goNext} className="rounded-lg p-1.5 text-ink-500 hover:bg-ivory-200 dark:hover:bg-ink-600">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <Card className="p-4 flex flex-wrap items-center gap-5">
        <span className="flex items-center gap-1.5 text-xs text-ink-500 dark:text-ivory-300">
          <span className="h-3 w-3 rounded-sm bg-success-100 border border-success-300 dark:bg-success-500/15 dark:border-success-500/40" />
          Booked
        </span>
        <span className="flex items-center gap-1.5 text-xs text-ink-500 dark:text-ivory-300">
          <span className="h-3 w-3 rounded-sm bg-danger-100 border border-danger-300 dark:bg-danger-500/15 dark:border-danger-500/40" />
          Available
        </span>
        <span className="text-xs text-ink-400">Hover a green (booked) day to see customer and event details.</span>
      </Card>

      <Card>
        {view === "month" && (
          <>
            <div className="grid grid-cols-7 border-b border-ink-100 dark:border-ink-600">
              {WEEKDAY_LABELS.map((d) => (
                <div key={d} className="px-2 py-2 text-center text-xs font-medium text-ink-400">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {buildMonthGrid(anchor).map((date) => renderDayCell(date, date.getMonth() !== anchor.getMonth()))}
            </div>
          </>
        )}

        {view === "week" && (
          <>
            <div className="grid grid-cols-7 border-b border-ink-100 dark:border-ink-600">
              {buildWeekGrid(anchor).map((date) => (
                <div key={date.toISOString()} className="px-2 py-2 text-center text-xs font-medium text-ink-400">
                  {WEEKDAY_LABELS[date.getDay()]} {date.getDate()}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {buildWeekGrid(anchor).map((date) => renderDayCell(date, false))}
            </div>
          </>
        )}

        {view === "day" && (
          <div className="p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ivory-100 dark:bg-ink-900/40 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink-800 dark:text-ivory-100">{WEEKDAY_LABELS_FULL[anchor.getDay()]}</p>
                <p className="text-xs text-ink-400">{formatHijri(anchor)}</p>
              </div>
              {(() => {
                const key = anchor.toISOString().slice(0, 10);
                const dayBookings = (bookingsByDate.get(key) ?? []).filter((b) => b.status !== "Cancelled");
                const isBooked = dayBookings.length > 0;
                return (
                  <Badge tone={isBooked ? "success" : "danger"}>{isBooked ? "Booked" : "Available"}</Badge>
                );
              })()}
            </div>
            {(() => {
              const key = anchor.toISOString().slice(0, 10);
              const dayBookings = bookingsByDate.get(key) ?? [];
              if (dayBookings.length === 0) {
                return <p className="text-sm text-ink-400 text-center py-8">No events scheduled for this day.</p>;
              }
              return (
                <div className="space-y-2">
                  {dayBookings.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => navigate(`/bookings/${b.id}`)}
                      className="w-full flex items-center justify-between rounded-lg border border-ink-100 dark:border-ink-600 px-4 py-3 text-left hover:bg-ivory-100 dark:hover:bg-ink-600/20"
                    >
                      <div className="flex items-center gap-2">
                        <Badge tone={bookingStatusTone(b.status)}>{b.status}</Badge>
                        <div>
                          <p className="text-sm font-medium text-ink-800 dark:text-ivory-100">
                            {b.eventType} — {getCustomerById(b.customerId)?.fullName}
                          </p>
                          <p className="text-xs text-ink-400">
                            {b.startTime} – {b.endTime} · {b.bookingNumber}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </Card>
    </div>
  );
}
