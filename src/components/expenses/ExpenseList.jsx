"use client";

// ============================================
// EXPENSE LIST COMPONENT
// List of all expenses with filters
// ============================================

import * as React from "react";
import { ExpenseCard } from "./ExpenseCard";
import { cn } from "@/lib/utils";
import { Loader2, Receipt } from "lucide-react";

function ExpenseList({
  expenses = [],
  loading = false,
  onDelete,
  showDelete = true,
  emptyMessage = "No expenses yet",
  className,
}) {
  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Receipt className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          onDelete={onDelete}
          showDelete={showDelete}
        />
      ))}
    </div>
  );
}

export { ExpenseList };
