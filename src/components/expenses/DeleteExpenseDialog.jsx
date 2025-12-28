"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PinVerification } from "@/components/shared/PinVerification";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { Loader2 } from "lucide-react";

function DeleteExpenseDialog({ open, onOpenChange, expense, onConfirmed }) {
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setShowConfirmDialog(false);
      setIsDeleting(false);
    }
  }, [open]);

  if (!expense) return null;

  const handlePinVerified = () => {
    // PIN verified, now show the confirmation dialog
    setShowConfirmDialog(true);
    setTimeout(() => {
      setShowConfirmDialog(true);
    }, 150);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirmed?.(expense.id);
      setShowConfirmDialog(false);
      onOpenChange?.(false); // Close everything
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete expense");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDialogClose = (isOpen) => {
    setShowConfirmDialog(isOpen);
    if (!isOpen) {
      onOpenChange?.(false); // Close the main dialog if confirmation is cancelled
    }
  };

  return (
    <>
      {/* PIN Verification Dialog - SHOWN FIRST */}
      <PinVerification
        open={open && !showConfirmDialog}
        onOpenChange={onOpenChange}
        onVerified={handlePinVerified}
        title="Verify PIN to Delete"
        description="Enter your PIN to proceed with deletion"
      />

      {/* Confirmation Dialog - SHOWN AFTER PIN */}
      <AlertDialog
        open={showConfirmDialog}
        onOpenChange={handleConfirmDialogClose}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              expense from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Expense Details Preview */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{expense.reason}</span>
              <MoneyDisplay amount={expense.amount} size="lg" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Paid by {expense.paidBy}</span>
              {expense.paidFor && expense.paidFor !== "Both" && (
                <>
                  <span>•</span>
                  <span>for {expense.paidFor}</span>
                </>
              )}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Expense"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { DeleteExpenseDialog };
