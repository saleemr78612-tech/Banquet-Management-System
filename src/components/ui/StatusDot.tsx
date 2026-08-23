import type { BookingStatus } from "../../types/booking";

const dotColor: Record<BookingStatus, string> = {
  Confirmed: "bg-maroon-500",
  Pending: "bg-warning-500",
  Completed: "bg-success-500",
  Cancelled: "bg-ink-400",
};

export function StatusDot({ status }: { status: BookingStatus }) {
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotColor[status]}`} />;
}

export function StatusLegend() {
  const items: BookingStatus[] = ["Confirmed", "Pending", "Completed", "Cancelled"];
  return (
    <div className="flex flex-wrap items-center gap-4">
      {items.map((s) => (
        <span key={s} className="flex items-center gap-1.5 text-xs text-ink-500 dark:text-ivory-300">
          <StatusDot status={s} /> {s}
        </span>
      ))}
    </div>
  );
}
