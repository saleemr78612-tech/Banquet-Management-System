import { useMemo, useState, useRef, useEffect } from "react";
import { Menu, Bell, Sun, Moon, PartyPopper, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useData } from "../../context/DataContext";
import { daysFromToday, formatShortDate } from "../../utils/format";
import { getPaymentStatus } from "../../types/booking";

interface NavbarProps {
  onOpenMobileMenu: () => void;
  title: string;
}

export function Navbar({ onOpenMobileMenu, title }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { bookings } = useData();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const notifications = useMemo(() => {
    const upcoming = bookings
      .filter((b) => b.status !== "Cancelled")
      .map((b) => ({ booking: b, days: daysFromToday(b.eventDate) }))
      .filter((x) => x.days >= 0 && x.days <= 5)
      .sort((a, b) => a.days - b.days);

    const unpaidOrPartial = bookings.filter((b) => {
      const status = getPaymentStatus(b.totalAmount, b.paidAmount);
      return status !== "Fully Paid" && b.status !== "Cancelled" && daysFromToday(b.eventDate) >= 0;
    });

    return { upcoming, unpaidOrPartial };
  }, [bookings]);

  const totalCount = notifications.upcoming.length + notifications.unpaidOrPartial.length;

  const dayLabel = (days: number) => {
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `In ${days} days`;
  };

  return (
    <header className="flex items-center justify-between border-b border-ink-100 dark:border-ink-600 bg-ivory-50/80 dark:bg-ink-900/80 backdrop-blur px-4 md:px-6 py-3.5 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden rounded-lg p-2 text-ink-600 dark:text-ivory-200 hover:bg-ivory-200 dark:hover:bg-ink-600"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-display text-lg md:text-xl font-semibold text-ink-800 dark:text-ivory-100">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-ink-600 dark:text-ivory-200 hover:bg-ivory-200 dark:hover:bg-ink-600 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative rounded-lg p-2 text-ink-600 dark:text-ivory-200 hover:bg-ivory-200 dark:hover:bg-ink-600 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {totalCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-maroon-500 text-[10px] font-semibold text-ivory-50">
                {totalCount > 9 ? "9+" : totalCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-ink-100 dark:border-ink-600 bg-white dark:bg-ink-800 shadow-card-hover">
              <div className="px-4 py-3 border-b border-ink-100 dark:border-ink-600">
                <p className="text-sm font-semibold text-ink-800 dark:text-ivory-100">Notifications</p>
              </div>
              {totalCount === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-ink-400">You're all caught up.</p>
              ) : (
                <div className="divide-y divide-ink-100/60 dark:divide-ink-600/60">
                  {notifications.upcoming.map(({ booking, days }) => (
                    <Link
                      key={booking.id}
                      to="/bookings"
                      onClick={() => setNotifOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-ivory-100 dark:hover:bg-ink-600/30 transition-colors"
                    >
                      <PartyPopper size={16} className="mt-0.5 text-gold-500 shrink-0" />
                      <div className="text-sm">
                        <p className="text-ink-700 dark:text-ivory-100">
                          {booking.eventType} — {dayLabel(days)}
                        </p>
                        <p className="text-xs text-ink-400">
                          {booking.bookingNumber} · {formatShortDate(booking.eventDate)}
                        </p>
                      </div>
                    </Link>
                  ))}
                  {notifications.unpaidOrPartial.map((booking) => (
                    <Link
                      key={booking.id}
                      to="/payments"
                      onClick={() => setNotifOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-ivory-100 dark:hover:bg-ink-600/30 transition-colors"
                    >
                      <AlertCircle size={16} className="mt-0.5 text-warning-500 shrink-0" />
                      <div className="text-sm">
                        <p className="text-ink-700 dark:text-ivory-100">
                          {getPaymentStatus(booking.totalAmount, booking.paidAmount)} — {booking.bookingNumber}
                        </p>
                        <p className="text-xs text-ink-400">Event on {formatShortDate(booking.eventDate)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
