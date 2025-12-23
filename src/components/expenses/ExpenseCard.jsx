"use client";

// ============================================
// EXPENSE CARD COMPONENT - RESPONSIVE
// Single expense item display with mobile-first design
// ============================================

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { formatDate } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

function ExpenseCard({ expense, onDelete, showDelete = true, className }) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    setIsDeleting(true);
    try {
      await onDelete?.(expense.id);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete expense");
    } finally {
      setIsDeleting(false);
    }
  };

  // Color based on who paid
  const bgColor =
    expense.paidBy === "Kiruthika"
      ? "bg-secondary/5 border-secondary/20"
      : "bg-primary/5 border-primary/20";

  return (
    <Card className={cn(bgColor, "transition-all hover:shadow-md", className)}>
      <CardContent className="p-3 sm:p-4">
        {/* Mobile Layout (< 640px) - Stacked */}
        <div className="flex sm:hidden flex-col gap-2">
          <div className="flex justify-between">
            {/* Top Row: Person & Time */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-start gap-2">
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    expense.paidBy === "Kiruthika"
                      ? "bg-secondary/20 text-secondary-foreground"
                      : "bg-primary/20 text-primary"
                  )}
                >
                  {expense.paidBy}
                </span>
                {/* Middle Row: Reason */}
                <div className="font-medium text-sm line-clamp-2">
                  {expense.reason}
                </div>
              </div>

              {/* {showDelete && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-muted-foreground hover:text-destructive -mr-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )} */}
            </div>

            <div className="flex flex-col justify-end">
              <MoneyDisplay
                amount={expense.amount}
                size="lg"
                variant={
                  expense.paidBy === "Kiruthika" ? "secondary" : "primary"
                }
                className="font-semibold"
              />
              <span className="text-xs text-muted-foreground">
                {formatDate(expense.createdAt, "relative")}
              </span>
            </div>
          </div>

          {/* Bottom Row: Amount
          <div className="flex justify-end">
            <MoneyDisplay
              amount={expense.amount}
              size="lg"
              variant={expense.paidBy === "Kiruthika" ? "secondary" : "primary"}
              className="font-semibold"
            />
          </div> */}
        </div>

        {/* Desktop/Tablet Layout (>= 640px) - Horizontal */}
        <div className="hidden sm:flex items-start justify-between gap-4">
          {/* Left side - Details */}
          <div className="flex-1 space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap",
                  expense.paidBy === "Kiruthika"
                    ? "bg-secondary/20 text-secondary-foreground"
                    : "bg-primary/20 text-primary"
                )}
              >
                {expense.paidBy}
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(expense.createdAt, "relative")}
              </span>
            </div>

            <div className="font-medium text-sm break-words">
              {expense.reason}
            </div>
          </div>

          {/* Right side - Amount and Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <MoneyDisplay
              amount={expense.amount}
              size="lg"
              variant={expense.paidBy === "Kiruthika" ? "secondary" : "primary"}
              className="font-semibold"
            />

            {showDelete && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { ExpenseCard };
