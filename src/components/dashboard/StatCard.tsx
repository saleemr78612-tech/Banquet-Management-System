import type { LucideIcon } from "lucide-react";
import { Card } from "../ui/Card";
import { cn } from "../../utils/cn";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "maroon" | "gold" | "success" | "warning" | "danger";
}

const toneClasses = {
  maroon: "bg-maroon-50 text-maroon-500 dark:bg-maroon-400/15 dark:text-maroon-400",
  gold: "bg-gold-100 text-gold-600 dark:bg-gold-500/15 dark:text-gold-300",
  success: "bg-success-100 text-success-600 dark:bg-success-500/15 dark:text-success-500",
  warning: "bg-warning-100 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500",
  danger: "bg-danger-100 text-danger-600 dark:bg-danger-500/15 dark:text-danger-500",
};

export function StatCard({ label, value, icon: Icon, tone = "maroon" }: StatCardProps) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={cn("shrink-0 rounded-xl p-3", toneClasses[tone])}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink-400 truncate">{label}</p>
        <p className="font-display text-xl font-semibold text-ink-800 dark:text-ivory-100 font-mono-tabular truncate">
          {value}
        </p>
      </div>
    </Card>
  );
}
