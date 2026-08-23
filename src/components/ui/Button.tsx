import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-maroon-500 text-ivory-50 hover:bg-maroon-600 shadow-card focus-visible:ring-maroon-400",
  secondary:
    "bg-gold-500 text-maroon-900 hover:bg-gold-600 shadow-card focus-visible:ring-gold-300",
  outline:
    "border border-ink-100 dark:border-ink-600 text-ink-800 dark:text-ivory-200 hover:bg-ivory-200 dark:hover:bg-ink-800 focus-visible:ring-maroon-400",
  ghost:
    "text-ink-600 dark:text-ivory-300 hover:bg-ivory-200 dark:hover:bg-ink-800 focus-visible:ring-maroon-400",
  danger:
    "bg-danger-500 text-ivory-50 hover:bg-danger-600 shadow-card focus-visible:ring-danger-500",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-5 py-2.5 text-base gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ink-900",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
