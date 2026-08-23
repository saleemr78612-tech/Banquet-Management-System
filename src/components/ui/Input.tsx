import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink-700 dark:text-ivory-200">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-lg border bg-ivory-50 dark:bg-ink-800 px-3 py-2 text-sm text-ink-800 dark:text-ivory-100",
            "placeholder:text-ink-400 dark:placeholder:text-ink-400",
            "focus:outline-none focus:ring-2 focus:ring-maroon-400 focus:border-transparent",
            "transition-colors",
            error
              ? "border-danger-500"
              : "border-ink-100 dark:border-ink-600",
            className
          )}
          {...props}
        />
        {hint && !error && <span className="text-xs text-ink-400">{hint}</span>}
        {error && <span className="text-xs text-danger-500">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
