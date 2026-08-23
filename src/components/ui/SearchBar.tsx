import { Search, X } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange, className, placeholder = "Search...", ...props }: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-lg border border-ink-100 dark:border-ink-600 bg-ivory-50 dark:bg-ink-800",
          "pl-9 pr-9 py-2 text-sm text-ink-800 dark:text-ivory-100 placeholder:text-ink-400",
          "focus:outline-none focus:ring-2 focus:ring-maroon-400 focus:border-transparent transition-colors"
        )}
        {...props}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
