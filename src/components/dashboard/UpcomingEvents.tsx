import { Link } from "react-router-dom";
import { Users, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "../ui/Card";
import { Badge, paymentStatusTone } from "../ui/Badge";
import { EmptyState } from "../ui/EmptyState";
import { useData } from "../../context/DataContext";
import { getPaymentStatus } from "../../types/booking";
import { formatShortDate, daysFromToday } from "../../utils/format";

export function UpcomingEvents() {
  const { bookings, getCustomerById } = useData();

  const upcoming = bookings
    .filter((b) => b.status !== "Cancelled" && daysFromToday(b.eventDate) >= 0)
    .sort((a, b) => daysFromToday(a.eventDate) - daysFromToday(b.eventDate))
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
        <Link to="/bookings" className="text-xs font-medium text-maroon-500 hover:underline flex items-center gap-1">
          View all <ArrowRight size={12} />
        </Link>
      </CardHeader>
      <CardBody className="p-0">
        {upcoming.length === 0 ? (
          <EmptyState title="No upcoming events" description="New bookings will appear here." />
        ) : (
          <div className="divide-y divide-ink-100/60 dark:divide-ink-600/60">
            {upcoming.map((b) => {
              const customer = getCustomerById(b.customerId);
              const status = getPaymentStatus(b.totalAmount, b.paidAmount);
              return (
                <Link
                  key={b.id}
                  to={`/bookings/${b.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-ivory-100 dark:hover:bg-ink-600/20 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-800 dark:text-ivory-100 truncate">
                      {customer?.fullName ?? "Unknown Customer"} · {b.eventType}
                    </p>
                    <p className="text-xs text-ink-400 mt-0.5">
                      {formatShortDate(b.eventDate)} · {b.hijriDate} ·{" "}
                      <span className="inline-flex items-center gap-1">
                        <Users size={11} /> {b.guests}
                      </span>
                    </p>
                  </div>
                  <Badge tone={paymentStatusTone(status)}>{status}</Badge>
                </Link>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
