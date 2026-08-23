import { PartyPopper } from "lucide-react";
import { Card } from "../ui/Card";
import { useData } from "../../context/DataContext";
import { daysFromToday } from "../../utils/format";

export function ReminderCards() {
  const { bookings, getCustomerById } = useData();

  const reminders = bookings
    .filter((b) => b.status !== "Cancelled")
    .map((b) => ({ booking: b, days: daysFromToday(b.eventDate) }))
    .filter((x) => x.days >= 0 && x.days <= 5)
    .sort((a, b) => a.days - b.days);

  if (reminders.length === 0) return null;

  const label = (days: number) => {
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `In ${days} days`;
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {reminders.map(({ booking, days }) => {
        const customer = getCustomerById(booking.customerId);
        const urgent = days <= 1;
        return (
          <Card
            key={booking.id}
            className={`shrink-0 min-w-[240px] p-4 flex items-start gap-3 ${
              urgent ? "border-maroon-400/40 bg-maroon-50 dark:bg-maroon-400/10" : ""
            }`}
          >
            <div className="rounded-lg bg-gold-100 dark:bg-gold-500/15 p-2 text-gold-600 dark:text-gold-300 shrink-0">
              <PartyPopper size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-800 dark:text-ivory-100">
                {booking.eventType} for {customer?.fullName ?? "Customer"}
              </p>
              <p className="text-xs text-ink-400 mt-0.5">{label(days)} · {booking.bookingNumber}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
