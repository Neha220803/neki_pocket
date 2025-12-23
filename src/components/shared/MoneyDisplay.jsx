"use client";

// ============================================
// MONEY DISPLAY COMPONENT
// Formatted currency display with Indian formatting
// ============================================

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

function MoneyDisplay({
  amount,
  showSymbol = true,
  className,
  size = "default",
  variant = "default",
}) {
  const formatted = formatCurrency(amount, showSymbol);

  const sizeClasses = {
    sm: "text-sm",
    default: "text-base",
    lg: "text-2xl font-semibold",
    xl: "text-4xl font-bold",
  };

  const variantClasses = {
    default: "text-foreground",
    muted: "text-muted-foreground",
    success: "text-green-600 dark:text-green-400",
    danger: "text-red-600 dark:text-red-400",
    primary: "text-primary",
    secondary: "text-secondary-foreground",
  };

  return (
    <span
      className={cn(
        "tabular-nums font-mono",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {formatted}
    </span>
  );
}

export { MoneyDisplay };
