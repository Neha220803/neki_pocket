"use client";

// ============================================
// PIN VERIFICATION COMPONENT
// Reusable PIN verification dialog
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
import { InputPin } from "@/components/ui/input-pin";
import { AlertCircle, Lock } from "lucide-react";

function PinVerification({
  open,
  onOpenChange,
  onVerified,
  title = "Enter PIN",
  description = "Please enter your 6-digit PIN to continue",
  verifyingText = "Verifying...",
}) {
  const [pin, setPin] = React.useState("");
  const [error, setError] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setPin("");
      setError("");
      setIsVerifying(false);
    }
  }, [open]);

  const handleVerify = async () => {
    if (pin.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      // Call the API to verify PIN
      const response = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // PIN verified successfully
        onVerified?.(pin);
        onOpenChange?.(false);
      } else {
        // Invalid PIN
        setError(data.error || "Invalid PIN. Please try again.");
        setPin("");
      }
    } catch (err) {
      console.error("PIN verification error:", err);
      setError("Failed to verify PIN. Please try again.");
      setPin("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePinComplete = (completedPin) => {
    // Auto-verify when 6 digits entered
    setPin(completedPin);
    // Small delay to show the last digit before verifying
    setTimeout(() => {
      if (completedPin.length === 6) {
        handleVerify();
      }
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <InputPin
            value={pin}
            onChange={setPin}
            onComplete={handlePinComplete}
            disabled={isVerifying}
          />

          {error && (
            <div className="flex items-center gap-2 mt-4 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            disabled={isVerifying}
          >
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            disabled={pin.length !== 6 || isVerifying}
          >
            {isVerifying ? verifyingText : "Verify"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { PinVerification };
