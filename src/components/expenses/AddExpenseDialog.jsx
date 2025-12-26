"use client";

// ============================================
// ADD EXPENSE DIALOG COMPONENT
// Modal for adding new expenses
// ============================================

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PersonSelect } from "@/components/shared/PersonSelect";
import { PaidForSelect } from "@/components/shared/PaidForSelect";
import { ReasonInput } from "@/components/shared/ReasonInput";
import { Plus, Loader2 } from "lucide-react";
import { CURRENCY } from "@/lib/constants";

function AddExpenseDialog({ onExpenseAdded, trigger }) {
  const [open, setOpen] = React.useState(false);
  const [paidBy, setPaidBy] = React.useState("");
  const [paidFor, setPaidFor] = React.useState("Both");
  const [amount, setAmount] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setPaidBy("");
      setPaidFor("Both");
      setAmount("");
      setReason("");
      setError("");
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!paidBy || !paidFor || !amount || !reason) {
      setError("Please fill in all fields");
      return;
    }

    if (paidFor !== "Both" && paidBy === paidFor) {
      setError("Paid By and Paid For cannot be the same person");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paidBy,
          paidFor,
          amount: numAmount,
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success
        onExpenseAdded?.(data.expense);
        setOpen(false);
      } else {
        setError(data.error || "Failed to add expense");
      }
    } catch (err) {
      console.error("Add expense error:", err);
      setError("Failed to add expense. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>Record a new expense or payment</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Paid By */}
          <div className="space-y-2">
            <Label htmlFor="paidBy">
              Paid By <span className="text-destructive">*</span>
            </Label>
            <PersonSelect
              value={paidBy}
              onValueChange={setPaidBy}
              placeholder="Select who paid"
            />
          </div>

          {/* Paid For - NEW FIELD */}
          <div className="space-y-2">
            <Label htmlFor="paidFor">
              Paid For <span className="text-destructive">*</span>
            </Label>
            <PaidForSelect
              value={paidFor}
              onValueChange={setPaidFor}
              placeholder="Who benefited?"
            />
            <p className="text-xs text-muted-foreground">
              Select "Both" for shared expenses, or choose the individual for
              personal expenses.
            </p>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {CURRENCY.SYMBOL}
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="300"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Reason */}
          <ReasonInput
            value={reason}
            onChange={setReason}
            label="Reason"
            placeholder="e.g., Dinner at Sangeetha"
            required
          />

          {/* Error message */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add Expense"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { AddExpenseDialog };
