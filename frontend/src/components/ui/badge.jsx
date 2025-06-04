import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-400",
        outline:
          "text-foreground",
        success: 
          "border-transparent bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-400",
        warning:
          "border-transparent bg-yellow-50 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400",
        info:
          "border-transparent bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants }; 