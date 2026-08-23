import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-ink-700 dark:text-ivory-200">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full appearance-none rounded-lg border bg-ivory-50 dark:bg-ink-800 px-3 py-2 pr-9 text-sm text-ink-800 dark:text-ivory-100",
              "focus:outline-none focus:ring-2 focus:ring-maroon-400 focus:border-transparent",
              "transition-colors",
              error ? "border-danger-500" : "border-ink-100 dark:border-ink-600",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
          />
        </div>
        {error && <span className="text-xs text-danger-500">{error}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";
