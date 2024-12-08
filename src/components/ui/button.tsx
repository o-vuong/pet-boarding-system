import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "~/utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const variants = {
      primary: "bg-indigo-600 text-white hover:bg-indigo-500",
      secondary: "bg-gray-600 text-white hover:bg-gray-500",
      danger: "bg-red-600 text-white hover:bg-red-500",
      ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
    };

    const sizes = {
      sm: "px-2 py-1 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled ?? isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);
