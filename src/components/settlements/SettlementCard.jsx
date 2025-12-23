"use client";

// ============================================
// SETTLEMENT CARD COMPONENT
// Individual settlement display with status
// ============================================

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoneyDisplay } from "@/components/shared/MoneyDisplay";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Check, CheckCheck, Clock, ArrowRight } from "lucide-react";

function SettlementCard({
  settlement,
  onConfirm,
  currentUser,
  showConfirmButton = true,
  className,
}) {
  const [isConfirming, setIsConfirming] = React.useState(false);

  const isConfirmed = settlement.status === "confirmed";
  const isPending = settlement.status === "pending";

  // Check if current user needs to confirm
  const needsUserConfirmation =
    currentUser &&
    ((currentUser === settlement.from && !settlement.confirmedByFrom) ||
      (currentUser === settlement.to && !settlement.confirmedByTo));

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm?.(settlement.id, currentUser);
    } catch (error) {
      console.error("Confirm error:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  // Determine card styling
  const cardStyles = isConfirmed
    ? "bg-accent/30 border-accent"
    : "bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800";

  return (
    <Card className={cn(cardStyles, "transition-all", className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "rounded-full p-1.5",
                  isConfirmed
                    ? "bg-accent text-accent-foreground"
                    : "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400"
                )}
              >
                {isConfirmed ? (
                  <CheckCheck className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isConfirmed
                    ? "text-accent-foreground"
                    : "text-orange-700 dark:text-orange-400"
                )}
              >
                {isConfirmed ? "Confirmed" : "Pending Confirmation"}
              </span>
            </div>

            <span className="text-xs text-muted-foreground">
              {formatDate(settlement.createdAt, "relative")}
            </span>
          </div>

          {/* Payment details */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "font-medium text-sm px-2 py-1 rounded-md",
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
                  "font-medium text-sm px-2 py-1 rounded-md",
                  settlement.to === "Kiruthika"
                    ? "bg-secondary/20 text-secondary-foreground"
                    : "bg-primary/20 text-primary"
                )}
              >
                {settlement.to}
              </span>
            </div>

            <MoneyDisplay
              amount={settlement.amount}
              size="lg"
              variant={isConfirmed ? "success" : "default"}
              className="font-semibold"
            />
          </div>

          {/* Confirmation status */}
          {isPending && (
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                {settlement.confirmedByFrom ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground" />
                )}
                <span
                  className={
                    settlement.confirmedByFrom
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }
                >
                  {settlement.from}{" "}
                  {settlement.confirmedByFrom ? "confirmed" : "pending"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {settlement.confirmedByTo ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground" />
                )}
                <span
                  className={
                    settlement.confirmedByTo
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }
                >
                  {settlement.to}{" "}
                  {settlement.confirmedByTo ? "confirmed" : "pending"}
                </span>
              </div>
            </div>
          )}

          {/* Payment method */}
          {isConfirmed && settlement.paymentMethod && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              via {settlement.paymentMethod === "gpay" ? "Google Pay" : "Cash"}{" "}
              ✓
            </div>
          )}

          {/* Confirm button */}
          {showConfirmButton && needsUserConfirmation && (
            <Button
              onClick={handleConfirm}
              disabled={isConfirming}
              className="w-full"
              size="sm"
            >
              {isConfirming ? "Confirming..." : `Confirm Receipt`}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export { SettlementCard };
