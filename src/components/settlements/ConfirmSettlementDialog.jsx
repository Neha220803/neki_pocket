"use client";

// ============================================
// CONFIRM SETTLEMENT DIALOG COMPONENT
// Mutual confirmation flow with PIN verification
// ============================================

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PinVerification } from "@/components/shared/PinVerification";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader2 } from "lucide-react";

function ConfirmSettlementDialog({
  open,
  onOpenChange,
  settlement,
  currentUser,
  onConfirmed,
}) {
  const [showPinDialog, setShowPinDialog] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState("");
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [error, setError] = React.useState("");

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setPaymentMethod("");
      setError("");
      setShowPinDialog(false);
    }
  }, [open]);

  if (!settlement) return null;

  const handleProceed = () => {
    setError("");

    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }

    // Show PIN verification dialog
    setShowPinDialog(true);
  };

  const handlePinVerified = async (pin) => {
    setIsConfirming(true);
    setError("");

    try {
      const response = await fetch(
        `/api/settlements/${settlement.id}/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            confirmedBy: currentUser,
            pin,
            paymentMethod,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Success
        onConfirmed?.(data.settlement, data.isFullyConfirmed);
        onOpenChange?.(false);
      } else {
        setError(data.error || "Failed to confirm settlement");
      }
    } catch (err) {
      console.error("Confirm settlement error:", err);
      setError("Failed to confirm settlement. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Settlement</DialogTitle>
            <DialogDescription>
              Verify the settlement details and confirm receipt
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Settlement Details */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="text-sm text-muted-foreground">
                Settlement Amount
              </div>
              <MoneyDisplay
                amount={settlement.amount}
                size="xl"
                variant="primary"
              />

              <div className="flex items-center justify-center gap-3 pt-2">
                <span
                  className={cn(
                    "font-medium text-sm px-3 py-1.5 rounded-md",
                    settlement.from === "Kiruthika"
                      ? "bg-secondary/20 text-secondary-foreground"
                      : "bg-primary/20 text-primary"
                  )}
                >
                  {settlement.from}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span
                  className={cn(
                    "font-medium text-sm px-3 py-1.5 rounded-md",
                    settlement.to === "Kiruthika"
                      ? "bg-secondary/20 text-secondary-foreground"
                      : "bg-primary/20 text-primary"
                  )}
                >
                  {settlement.to}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">
                Payment Method <span className="text-destructive">*</span>
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpay">Google Pay</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Confirming as */}
            <div className="text-sm bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
              Confirming as <span className="font-semibold">{currentUser}</span>
            </div>

            {/* Error message */}
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              disabled={isConfirming}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProceed}
              disabled={isConfirming || !paymentMethod}
            >
              {isConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Confirming...
                </>
              ) : (
                "Proceed to Verify PIN"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PIN Verification Dialog */}
      <PinVerification
        open={showPinDialog}
        onOpenChange={setShowPinDialog}
        onVerified={handlePinVerified}
        title="Verify PIN to Confirm"
        description={`Enter your PIN to confirm receiving ₹${settlement.amount} from ${settlement.from}`}
      />
    </>
  );
}

export { ConfirmSettlementDialog };
