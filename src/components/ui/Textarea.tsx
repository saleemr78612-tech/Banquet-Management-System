import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const areaId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={areaId} className="text-sm font-medium text-ink-700 dark:text-ivory-200">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          className={cn(
            "w-full rounded-lg border bg-ivory-50 dark:bg-ink-800 px-3 py-2 text-sm text-ink-800 dark:text-ivory-100",
            "placeholder:text-ink-400 dark:placeholder:text-ink-400",
            "focus:outline-none focus:ring-2 focus:ring-maroon-400 focus:border-transparent",
            "transition-colors resize-none",
            error ? "border-danger-500" : "border-ink-100 dark:border-ink-600",
            className
          )}
          rows={3}
          {...props}
        />
        {error && <span className="text-xs text-danger-500">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
