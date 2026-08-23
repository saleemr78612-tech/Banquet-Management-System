import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../utils/cn";

const iconByVariant = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const toneByVariant = {
  success: "border-success-500/30 text-success-600 dark:text-success-500",
  error: "border-danger-500/30 text-danger-600 dark:text-danger-500",
  info: "border-maroon-400/30 text-maroon-500 dark:text-maroon-400",
};

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => {
        const Icon = iconByVariant[toast.variant];
        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border bg-white dark:bg-ink-800 px-4 py-3 shadow-card-hover",
              "animate-in slide-in-from-bottom-2 fade-in duration-200",
              toneByVariant[toast.variant]
            )}
          >
            <Icon size={18} className="shrink-0" />
            <p className="text-sm text-ink-700 dark:text-ivory-100 flex-1">{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-ink-400 hover:text-ink-600 dark:hover:text-ivory-100"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
