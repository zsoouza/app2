import { HTMLAttributes } from "react";
import { clsx } from "clsx";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "primary";
}

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  const variants = {
    default:   "bg-gray-100 text-gray-700",
    secondary: "bg-indigo-50 text-indigo-700",
    primary:   "bg-primary-100 text-primary-700",
  };
  return (
    <span
      className={clsx("inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full", variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
