import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type BadgeTone = "success" | "warning" | "danger" | "neutral" | "info" | "gold";

const toneClasses: Record<BadgeTone, string> = {
  success: "bg-success-100 text-success-600 dark:bg-success-500/15 dark:text-success-500",
  warning: "bg-warning-100 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500",
  danger: "bg-danger-100 text-danger-600 dark:bg-danger-500/15 dark:text-danger-500",
  neutral: "bg-ink-100 text-ink-600 dark:bg-ink-600/30 dark:text-ivory-200",
  info: "bg-maroon-50 text-maroon-500 dark:bg-maroon-400/15 dark:text-maroon-400",
  gold: "bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-300",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

export function bookingStatusTone(status: string): BadgeTone {
  switch (status) {
    case "Confirmed":
      return "info";
    case "Completed":
      return "success";
    case "Cancelled":
      return "danger";
    default:
      return "warning";
  }
}

export function paymentStatusTone(status: string): BadgeTone {
  switch (status) {
    case "Fully Paid":
      return "success";
    case "Partially Paid":
      return "warning";
    default:
      return "danger";
  }
}
