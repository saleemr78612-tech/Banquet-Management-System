import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
      <div className="rounded-full bg-ivory-200 dark:bg-ink-600/40 p-4 text-ink-400">
        {icon ?? <Inbox size={28} />}
      </div>
      <div className="space-y-1">
        <p className="font-display text-base font-semibold text-ink-700 dark:text-ivory-100">{title}</p>
        {description && <p className="text-sm text-ink-400 max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
